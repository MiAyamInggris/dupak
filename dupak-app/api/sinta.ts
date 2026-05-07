import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as cheerio from 'cheerio';

// SINTA HTML scraper — if SINTA changes their layout, update the CSS selectors below.
// Profile page: https://sinta.kemdikbud.go.id/authors/profile/{sintaId}
// Publications: add ?page=1&view=documentsscopus / documentsgaruda

const SINTA_BASE = 'https://sinta.kemdikbud.go.id';

interface SINTAPublication {
  title: string;
  journal: string;
  year: number;
  type: 'scopus' | 'garuda';
}

interface SINTAProfile {
  name: string;
  sintaId: string;
  affiliation: string;
  studyProgram: string;
  nidn: string;
  sintaScore: string;
}

async function fetchPage(sintaId: string, view: string, page = 1): Promise<string> {
  const url = view === 'overview'
    ? `${SINTA_BASE}/authors/profile/${sintaId}`
    : `${SINTA_BASE}/authors/profile/${sintaId}?page=${page}&view=${view}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'text/html,application/xhtml+xml',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    redirect: 'follow',
  });

  if (!response.ok) throw new Error(`SINTA returned ${response.status} for view=${view}`);
  return response.text();
}

function parseProfile(html: string, sintaId: string): SINTAProfile {
  const $ = cheerio.load(html);

  // Try multiple known selector patterns — update here if SINTA redesigns
  const name =
    $('h3.au-name').first().text().trim() ||
    $('.profile-name').first().text().trim() ||
    $('h3').first().text().trim();

  const affiliation =
    $('.au-affiliation').first().text().trim() ||
    $('.profile-affiliation').first().text().trim();

  const studyProgram =
    $('.au-department').first().text().trim() ||
    $('.profile-department').first().text().trim();

  const nidn =
    $('.au-nidn').first().text().replace(/[^0-9]/g, '') ||
    $('.profile-nidn').first().text().replace(/[^0-9]/g, '');

  const sintaScore =
    $('.num-sinta').first().text().trim() ||
    $('.sinta-score').first().text().trim();

  return { name, sintaId, affiliation, studyProgram, nidn, sintaScore };
}

function parsePublications(html: string, type: 'scopus' | 'garuda'): SINTAPublication[] {
  const $ = cheerio.load(html);
  const publications: SINTAPublication[] = [];

  // SINTA article list — try multiple selector variants
  const rows = $('.ar-list-item, .article-list .media, .doc-item, table.table tbody tr');

  rows.each((_, el) => {
    const titleEl = $(el).find('.ar-title a, .article-title, .doc-title, td:nth-child(1) a, td:nth-child(1)');
    const title = titleEl.first().text().trim();

    const journalEl = $(el).find('.ar-publisher a, .article-journal, .doc-journal, td:nth-child(2)');
    const journal = journalEl.first().text().trim();

    const yearEl = $(el).find('.ar-year, .article-year, .doc-year, td:nth-child(3)');
    const yearText = yearEl.first().text().trim();
    const year = parseInt(yearText.replace(/\D/g, '')) || new Date().getFullYear();

    if (title && title.length > 3) {
      publications.push({ title, journal, year, type });
    }
  });

  return publications;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { sinta_id } = req.query;

  if (!sinta_id || typeof sinta_id !== 'string') {
    return res.status(400).json({ error: 'Parameter sinta_id diperlukan' });
  }

  try {
    const [profileHtml, scopusHtml, garudaHtml] = await Promise.all([
      fetchPage(sinta_id, 'overview'),
      fetchPage(sinta_id, 'documentsscopus'),
      fetchPage(sinta_id, 'documentsgaruda'),
    ]);

    const profile = parseProfile(profileHtml, sinta_id);
    const scopusPublications = parsePublications(scopusHtml, 'scopus');
    const garudaPublications = parsePublications(garudaHtml, 'garuda');

    return res.status(200).json({
      profile,
      publications: {
        scopus: scopusPublications,
        garuda: garudaPublications,
        total: scopusPublications.length + garudaPublications.length,
      },
    });

  } catch (error) {
    console.error('SINTA fetch error:', error);
    return res.status(502).json({
      error: 'Gagal mengambil data dari SINTA',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
