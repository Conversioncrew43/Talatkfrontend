const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function api(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export function formatMoney(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSlot(startAt, endAt) {
  const start = new Date(startAt);
  const end = endAt ? new Date(endAt) : null;
  const date = start.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const t1 = start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const t2 = end
    ? end.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : "";
  return t2 ? `${date} · ${t1} – ${t2}` : `${date} · ${t1}`;
}
