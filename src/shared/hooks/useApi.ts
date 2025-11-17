import { useState } from 'react';

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

export function useApi(baseUrl = 'https://thin-tables-dress.loca.lt') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function request<T = unknown>(path: string, init?: RequestInit): Promise<T> {
    setLoading(true);
    setError(null);
    console.log(baseUrl + path);
    try {
      const res = await fetch(baseUrl + path, init);
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const err = await res.json();
          msg = err?.message || err?.error || msg;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        return (await res.json()) as T;
      }
      // если не JSON – вернём как текст
      return (await res.text()) as unknown as T;
    } finally {
      setLoading(false);
    }
  }

  async function get<T = unknown>(path: string, headers?: Record<string, string>) {
    return request<T>(path, { method: 'GET', headers });
  }

  async function post<T = unknown>(path: string, body?: Json | FormData, headers?: Record<string, string>) {
    const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
    return request<T>(path, {
      method: 'POST',
      body: isForm ? (body as FormData) : JSON.stringify(body ?? {}),
      headers: isForm ? headers : { 'Content-Type': 'application/json', ...(headers ?? {}) },
    });
  }

  return { loading, error, get, post };
}
