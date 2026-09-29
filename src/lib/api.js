export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://talatkbackend.onrender.com";

export async function apiRequest(path, { token, ...options } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("We couldn’t connect to the booking service. Please try again in a moment.");
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Something went wrong. Please try again.");
  return payload;
}

export function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatDate(value, options = { weekday: "long", month: "long", day: "numeric" }) {
  if (!value) return "Time to be arranged";
  return new Intl.DateTimeFormat("en-IN", options).format(new Date(value));
}

export function formatTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export function getServiceTitle(service) {
  return typeof service === "object" && service ? service.title : "Coaching session";
}

export function getSlot(booking) {
  return typeof booking?.slotId === "object" ? booking.slotId : null;
}
