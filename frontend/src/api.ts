/**
 * API client configuration.
 * In local dev, falls back to relative paths /api/* (handled by Vite proxy).
 * In production on Vercel, uses VITE_API_URL if configured.
 */
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
}
