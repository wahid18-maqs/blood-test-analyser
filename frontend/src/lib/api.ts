import type { HistoryItem, Marker } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export interface AnalyzeResponse {
  status: string;
  query: string;
  analysis: string;
  agents: {
    medical: string;
    verification: string;
    nutrition: string;
    exercise: string;
  };
  markers: Marker[];
  file_processed: string;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ name: string; email: string }>("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<{ status: string }>("/auth/logout", { method: "POST" }),
  me: () => request<{ name: string; email: string }>("/auth/me"),
  history: () => request<HistoryItem[]>("/history"),
  analyze: (file: File, query: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("query", query);
    return request<AnalyzeResponse>("/analyze", { method: "POST", body: form });
  },
};
