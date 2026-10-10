import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { posterFor } from "../utils";
import type { Booking, EventItem } from "../types";

const MAX_QTY = 6; // display only; the server enforces the real limit

export default function EventDetail() {
  const { id } = useParams(); const { user } = useAuth(); const nav = useNavigate();
  const [ev, setEv] = useState<EventItem | null>(null); const [qty, setQty] = useState(1);
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const [booking, setBooking] = useState<Booking | null>(null);
  useEffect(() => { api.getEvent(Number(id)).then(setEv).catch(e => setError(e.message)); }, [id]);

  if (error && !ev) return <p role="alert" className="alert m-8">{error}</p>;
  if (!ev) return <p className="p-8 text-mute">Loading event...</p>;

  if (booking) return (
    <main className="mx-auto max-w-lg px-4 py-16"><h1 className="font-display text-4xl font-extrabold">Booking {booking.status.toLowerCase()}</h1>
      <dl className="mt-6 space-y-2 rounded-xl border border-line bg-raised p-6">
        <div><dt className="text-sm text-mute">Reference</dt><dd className="font-mono text-xl text-cyan">{booking.bookingReference}</dd></div>
        <div><dt className="text-sm text-mute">Event</dt><dd>{booking.event.title}, {new Date(booking.event.eventDate).toLocaleString()}</dd></div>
        <div><dt className="text-sm text-mute">Tickets</dt><dd>{booking.quantity}</dd></div>
        <div><dt className="text-sm text-mute">Total</dt><dd>Rs {booking.totalPrice}</dd></div>
      </dl><p className="mt-3 text-sm text-mute">No payment was taken. This is a simulated booking.</p>
      <Link to="/bookings" className="btn mt-6 inline-block">View my bookings</Link></main>);

  const started = new Date(ev.eventDate) <= new Date();
  const blocked = ev.status === "CANCELLED" ? "This event was cancelled." : started ? "This event has already started." : ev.availableTickets === 0 ? "Sold out." : "";
  const book = async () => {
    if (!user) return nav("/login", { state: { from: `/events/${ev.id}` } });
    setBusy(true); setError("");
    try { setBooking(await api.book(ev.id, qty)); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1fr_340px]">
      <section>
        <img src={posterFor(ev)} alt={`${ev.title} poster`} className="h-72 w-full rounded-xl object-cover md:h-96" />
        <p className="mt-6 text-violet">{ev.category}</p>
        <h1 className="font-display text-5xl font-extrabold">{ev.title}</h1>
        <p className="mt-2 text-mute">{new Date(ev.eventDate).toLocaleString()}</p><p className="text-mute">{ev.venue}, {ev.city}</p>
        <p className="mt-6 max-w-prose whitespace-pre-line leading-relaxed">{ev.description}</p>
        <p className="mt-6 text-sm text-mute">Organized by Civitas</p>
      </section>
      <aside className="h-fit rounded-xl border border-line bg-raised p-6 md:sticky md:top-6">
        <p className="text-3xl font-bold text-cyan">Rs {ev.ticketPrice}</p><p className="text-sm text-mute">{ev.availableTickets} of {ev.totalTickets} tickets left</p>
        {blocked ? <p className="alert mt-4">{blocked}</p> : (<>
          <label className="mt-5 block text-sm text-mute" htmlFor="qty">Tickets</label>
          <div className="mt-1 flex items-center gap-3">
            <button className="btn-ghost" aria-label="Fewer tickets" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
            <output id="qty" className="w-8 text-center text-xl">{qty}</output>
            <button className="btn-ghost" aria-label="More tickets" onClick={() => setQty(Math.min(MAX_QTY, ev.availableTickets, qty + 1))}>+</button>
          </div>
          <p className="mt-4 flex justify-between border-t border-line pt-4"><span>Total</span><span className="font-semibold">Rs {(ev.ticketPrice * qty).toFixed(2)}</span></p>
          {error && <p role="alert" className="alert mt-3">{error}</p>}
          {user?.role === "ORGANIZER" ? <p className="mt-4 text-sm text-mute">Organiser accounts cannot book tickets. Use an attendee account.</p>
            : <button className="btn mt-4 w-full" onClick={book} disabled={busy}>{busy ? "Booking..." : user ? "Confirm booking" : "Log in to book"}</button>}
          <p className="mt-2 text-xs text-mute">Simulated booking. No payment is processed.</p></>)}
      </aside>
    </main>);
}
