const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

// B.3: header Authorization aktif (Sanctum Bearer token)
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

/**
 * Untuk submit multipart/form-data (mis. upload foto profile).
 * Jangan set "Content-Type" manual — browser yang isi boundary-nya otomatis.
 */
export async function apiFetchForm(path, formData, method = "POST") {
  const token = localStorage.getItem("umkm_token");

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Accept": "application/json",
      ...(token && token !== "local" ? { "Authorization": `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Untuk download file binari (PDF/Excel export — Tahap F).
 * Memicu "Save As" browser dengan nama file dari header Content-Disposition.
 */
export async function apiDownload(path) {
  const token = localStorage.getItem("umkm_token");

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Accept": "*/*",
      ...(token && token !== "local" ? { "Authorization": `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Gagal mengunduh file (HTTP ${res.status})`);
  }

  const disposition = res.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : "download";

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}