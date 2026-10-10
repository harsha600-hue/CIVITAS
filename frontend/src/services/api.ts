import type { EventForm, Booking, EventItem, Page, User } from "../types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, { headers: { "Content-Type": "application/json" }, credentials: "same-origin", ...init });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message ?? "Something went wrong");
  }
  return res.status === 204 ? (undefined as T) : res.json();
}
const post = (b: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(b) });

export const api = {
  searchEvents: (params: Record<string, string>) => request<Page<EventItem>>(`/events?${new URLSearchParams(params)}`),
  getEvent: (id: number) => request<EventItem>(`/events/${id}`),
  register: (b: { name: string; email: string; password: string; confirmPassword: string; accountType: string }) => request<User>("/auth/register", post(b)),
  login: (b: { email: string; password: string }) => request<User>("/auth/login", post(b)),
  me: () => request<User>("/auth/me"),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  book: (eventId: number, quantity: number) => request<Booking>("/bookings", post({ eventId, quantity })),
  myBookings: () => request<Booking[]>("/bookings/mine"),
  cancelBooking: (id: number) => request<Booking>(`/bookings/${id}/cancel`, { method: "POST" }),
  uploadPoster: async (file: File): Promise<{ url: string }> => {
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/organizer/posters", { method: "POST", body: fd, credentials: "same-origin" });
    if (!res.ok) { const b = await res.json().catch(() => ({ message: "Upload failed" })); throw new Error(b.message ?? "Upload failed"); }
    return res.json();
  },
  adminEvents: () => request<EventItem[]>("/organizer/events"),
  adminBookings: () => request<Booking[]>("/organizer/bookings"),
  createEvent: (b: EventForm) => request<EventItem>("/organizer/events", post(b)),
  updateEvent: (id: number, b: EventForm) => request<EventItem>(`/organizer/events/${id}`, { method: "PUT", body: JSON.stringify(b) }),
  cancelEvent: (id: number) => request<void>(`/organizer/events/${id}/cancel`, { method: "POST" }),
};
