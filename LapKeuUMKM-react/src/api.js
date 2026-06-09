const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

// TODO B.3: header Authorization akan diaktifkan pas Sanctum Token kita siap
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("umkm_token");

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(token && token !== "local" ? { "Authorization": `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}