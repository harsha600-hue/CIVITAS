export interface EventItem { id: number; title: string; description: string; category: string; venue: string; city: string;
  eventDate: string; ticketPrice: number; totalTickets: number; availableTickets: number; posterUrl: string | null; status: string; }
export interface Page<T> { content: T[]; totalElements: number; totalPages: number; number: number; }
export interface Booking { id: number; userEmail: string; bookingReference: string; event: EventItem; quantity: number; totalPrice: number; status: string; bookingDate: string; }
export interface User { id: number; name: string; email: string; role: "USER" | "ORGANIZER"; }
export interface EventForm { title: string; description: string; category: string; venue: string; city: string; eventDate: string; ticketPrice: number; totalTickets: number; posterUrl: string; }
