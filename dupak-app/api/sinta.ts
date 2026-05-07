import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as cheerio from 'cheerio';

// SINTA migrated domains — try both in order
const SINTA_DOMAINS = [
  'https://sinta.kemdiktisaintek.go.id', // NEW (primary)
  'https://sinta.kemdikbud.go.id',        // OLD (fallback)
];

// Browser-spoofed headers to bypass basic Cloudflare bot detection
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Upgrade-Insecure-Requests': '1',
};

interface SintaPublication {
  title: string;
  journal: string;
  year: number;
  type: 'scopus' | 'garuda';
  url?: string;
  doi?: string;
}

interface SintaProfile {
  name: string;
  sintaId: string;
  affiliation: string;
  studyProgram: string;
  nidn: string;
  sintaScore: string;
  hIndexScopus: string;
  hIndexScholar: string;
}

// Try each domain in sequence; return first that succeeds
async function fetchWithFallback(path: string): Promise<{ html: string; domain: string }> {
  let lastError: Error | null = null;

  for (const domain of SINTA_DOMAINS) {
    try {
      const url = `${domain}${path}`;
      console.log(`Trying: ${url}`);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(url, {
        headers: {
          ...BROWSER_HEADERS,
          'Referer': `${domain}/`,
          'Origin': domain,
        },
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from ${domain}`);
      }

      const html = await response.text();

      if (html.includes('Just a moment') || html.includes('cf-browser-verification')) {
        throw new Error(`Cloudflare challenge at ${domain}`);
      }

      if (html.length < 500) {
        throw new Error(`Response too short (${html.length} chars) — likely blocked`);
      }

      return { html, domain };

    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`Failed for ${domain}: ${lastError.message}`);
    }
  }

  throw lastError ?? new Error('All SINTA domains failed');
}

function parseProfile(html: string, sintaId: string): SintaProfile {
  const $ = cheerio.load(html);

  const name =
    $('h3.au-name').first().text().trim() ||
    $('.profile-name h3').first().text().trim() ||
    $('[class*="author-name"]').first().text().trim() ||
    $('h2').first().text().trim() ||
    '';

  const affiliation =
    $('.au-affiliation').first().text().trim() ||
    $('[class*="affiliation"]').first().text().trim() ||
    '';

  const studyProgram =
    $('.au-department').first().text().trim() ||
    $('[class*="department"]').first().text().trim() ||
    '';

  // NIDN is usually in a small text element near the author info
  const nidnText =
    $('*:contains("NIDN")').filter((_, el) => $(el).children().length === 0).first().text() || '';
  const nidnMatch = nidnText.match(/\d{10}/);
  const nidn = nidnMatch ? nidnMatch[0] : '';

  const sintaScore =
    $('.num-stat').first().text().trim() ||
    $('[class*="sinta-score"]').first().text().trim() ||
    '';

  const hIndexScopus =
    $('[title*="Scopus"] .num-stat, [data-source="scopus"] .h-index').first().text().trim() || '0';
  const hIndexScholar =
    $('[title*="Scholar"] .num-stat, [data-source="scholar"] .h-index').first().text().trim() || '0';

  return { name, sintaId, affiliation, studyProgram, nidn, sintaScore, hIndexScopus, hIndexScholar };
}

function parseScopusPublications(html: string): SintaPublication[] {
  const $ = cheerio.load(html);
  const publications: SintaPublication[] = [];

  const rows = $(
    '.article-list .article-item, ' +
    '.doc-list tr, ' +
    'table.scopus-docs tbody tr, ' +
    '.content-article .ar-list-item, ' +
    '.ar-list-item'
  );

  rows.each((_, el) => {
    const titleEl = $(el).find(
      '.ar-title a, .article-title a, td:nth-child(2) a, .doc-title a'
    ).first();
    const title = titleEl.text().trim();
    if (!title || title.length < 5) return;

    const journal = $(el).find(
      '.ar-publisher, .journal-name, td:nth-child(3), .doc-journal'
    ).first().text().trim();

    const yearText = $(el).find(
      '.ar-year, .pub-year, td:nth-child(4), .doc-year'
    ).first().text().trim();
    const year = parseInt(yearText.replace(/\D/g, '')) || new Date().getFullYear();

    const url = titleEl.attr('href') || '';
    const doi = $(el).find('[href*="doi.org"]').attr('href') || '';

    publications.push({ title, journal, year, type: 'scopus', url, doi });
  });

  return publications;
}

function parseGarudaPublications(html: string): SintaPublication[] {
  const $ = cheerio.load(html);
  const publications: SintaPublication[] = [];

  const rows = $(
    '.article-list .article-item, ' +
    '.doc-list tr, ' +
    'table.garuda-docs tbody tr, ' +
    '.content-article .ar-list-item, ' +
    '.ar-list-item'
  );

  rows.each((_, el) => {
    const titleEl = $(el).find(
      '.ar-title a, .article-title a, td:nth-child(2) a, .doc-title a'
    ).first();
    const title = titleEl.text().trim();
    if (!title || title.length < 5) return;

    const journal = $(el).find(
      '.ar-publisher, .journal-name, td:nth-child(3), .doc-journal'
    ).first().text().trim();

    const yearText = $(el).find(
      '.ar-year, .pub-year, td:nth-child(4), .doc-year'
    ).first().text().trim();
    const year = parseInt(yearText.replace(/\D/g, '')) || new Date().getFullYear();

    publications.push({ title, journal, year, type: 'garuda' });
  });

  return publications;
}

// Debug helper: returns structural info to help update selectors if SINTA redesigns
function debugExtractAll(html: string): Record<string, string[]> {
  const $ = cheerio.load(html);
  return {
    h2: $('h2').map((_, el) => $(el).text().trim()).get().filter(Boolean),
    h3: $('h3').map((_, el) => $(el).text().trim()).get().filter(Boolean),
    classesWithNum: $('[class*="num"]').map((_, el) => `${$(el).attr('class')}: ${$(el).text().trim()}`).get().slice(0, 10),
    tableRows: $('table tbody tr').length > 0
      ? [`Found ${$('table tbody tr').length} table rows`]
      : ['No table rows found'],
    listItems: $('.ar-list-item, .article-item, .doc-item').length > 0
      ? [`Found ${$('.ar-list-item, .article-item, .doc-item').length} list items`]
      : ['No list items found'],
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { sinta_id, debug } = req.query;

  if (!sinta_id || typeof sinta_id !== 'string') {
    return res.status(400).json({ error: 'Parameter sinta_id diperlukan' });
  }

  if (!/^\d+$/.test(sinta_id)) {
    return res.status(400).json({ error: 'SINTA ID harus berupa angka' });
  }

  try {
    const [profileResult, scopusResult, garudaResult] = await Promise.allSettled([
      fetchWithFallback(`/authors/profile/${sinta_id}`),
      fetchWithFallback(`/authors/profile/${sinta_id}?page=1&view=documentsscopus`),
      fetchWithFallback(`/authors/profile/${sinta_id}?page=1&view=documentsgaruda`),
    ]);

    if (profileResult.status === 'rejected') {
      return res.status(502).json({
        error: 'Tidak dapat mengakses halaman profil SINTA',
        detail: profileResult.reason?.message ?? 'Unknown error',
        suggestion: 'SINTA mungkin sedang dalam pemeliharaan. Coba lagi nanti atau isi data secara manual.',
      });
    }

    const { html: profileHtml } = profileResult.value;
    const profile = parseProfile(profileHtml, sinta_id);

    // Debug mode — returns raw structural info to help update selectors
    if (debug === '1') {
      return res.status(200).json({
        debug: true,
        profileDebug: debugExtractAll(profileHtml),
        scopusDebug: scopusResult.status === 'fulfilled'
          ? debugExtractAll(scopusResult.value.html)
          : { error: scopusResult.reason?.message },
        garudaDebug: garudaResult.status === 'fulfilled'
          ? debugExtractAll(garudaResult.value.html)
          : { error: garudaResult.reason?.message },
        profileParsed: profile,
      });
    }

    const scopusPublications = scopusResult.status === 'fulfilled'
      ? parseScopusPublications(scopusResult.value.html)
      : [];

    const garudaPublications = garudaResult.status === 'fulfilled'
      ? parseGarudaPublications(garudaResult.value.html)
      : [];

    const warnings: string[] = [
      ...(scopusResult.status === 'rejected' ? [`Gagal mengambil data Scopus: ${scopusResult.reason?.message}`] : []),
      ...(garudaResult.status === 'rejected' ? [`Gagal mengambil data Garuda: ${garudaResult.reason?.message}`] : []),
      ...(scopusPublications.length === 0 && scopusResult.status === 'fulfilled'
        ? ['Data Scopus tidak ditemukan — mungkin format halaman SINTA berubah'] : []),
      ...(garudaPublications.length === 0 && garudaResult.status === 'fulfilled'
        ? ['Data Garuda tidak ditemukan — mungkin format halaman SINTA berubah'] : []),
    ];

    return res.status(200).json({
      success: true,
      profile,
      publications: {
        scopus: scopusPublications,
        garuda: garudaPublications,
        total: scopusPublications.length + garudaPublications.length,
      },
      warnings,
    });

  } catch (error) {
    console.error('SINTA handler error:', error);
    return res.status(502).json({
      error: 'Gagal mengambil data dari SINTA',
      detail: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Coba lagi dalam beberapa menit, atau isi data publikasi secara manual.',
    });
  }
}
