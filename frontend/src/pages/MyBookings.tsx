import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import type { Booking } from "../types";

export default function MyBookings() {
  const [items, setItems] = useState<Booking[] | null>(null); const [error, setError] = useState("");
  const load = () => api.myBookings().then(setItems).catch(e => setError(e.message));
  useEffect(() => { load(); }, []);
  const cancel = async (b: Booking) => {
    if (!confirm(`Cancel ${b.bookingReference}?`)) return;
    try { await api.cancelBooking(b.id); load(); } catch (e) { setError((e as Error).message); }
  };
  if (!items) return <p className="p-8 text-mute">{error || "Loading bookings..."}</p>;
  const now = new Date();
  const upcoming = items.filter(b => new Date(b.event.eventDate) > now), past = items.filter(b => new Date(b.event.eventDate) <= now);
  const Row = ({ b, canCancel }: { b: Booking; canCancel: boolean }) => (
    <li className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-raised p-5">
      <div><p className="font-display text-xl font-semibold">{b.event.title}</p>
        <p className="text-sm text-mute">{new Date(b.event.eventDate).toLocaleString()}, {b.event.venue}</p>
        <p className="mt-1 font-mono text-sm text-cyan">{b.bookingReference}</p></div>
      <div className="text-right"><p>{b.quantity} x Rs {b.event.ticketPrice} = Rs {b.totalPrice}</p>
        <p className={b.status === "CANCELLED" ? "text-red-300" : "text-violet"}>{b.status}</p>
        {canCancel && b.status === "CONFIRMED" && <button className="btn-ghost mt-2" onClick={() => cancel(b)}>Cancel booking</button>}</div>
    </li>);
  return (<main className="mx-auto max-w-4xl px-4 py-12"><h1 className="font-display text-5xl font-extrabold">My events</h1>
    {error && <p role="alert" className="alert mt-4">{error}</p>}
    {items.length === 0 && <div className="mt-8 rounded-xl border border-dashed border-line p-12 text-center text-mute">
      <p>You haven't booked any events yet.</p><Link to="/explore" className="btn mt-4 inline-block">Find an event</Link></div>}
    {upcoming.length > 0 && <><h2 className="mt-10 mb-3 text-xl">Upcoming</h2><ul className="space-y-3">{upcoming.map(b => <Row key={b.id} b={b} canCancel />)}</ul></>}
    {past.length > 0 && <><h2 className="mt-10 mb-3 text-xl">Past</h2><ul className="space-y-3">{past.map(b => <Row key={b.id} b={b} canCancel={false} />)}</ul></>}
  </main>);
}
