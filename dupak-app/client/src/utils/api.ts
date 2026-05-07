const API_BASE = (import.meta.env.VITE_API_URL as string) ?? '';

export const api = {
  get: async <T = unknown>(path: string): Promise<T> => {
    const res = await fetch(`${API_BASE}/api${path}`);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json() as Promise<T>;
  },

  post: async <T = unknown>(path: string, body: unknown): Promise<T> => {
    const res = await fetch(`${API_BASE}/api${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json() as Promise<T>;
  },
};
