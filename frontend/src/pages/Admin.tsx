import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { posterFor } from "../utils";
import type { Booking, EventForm, EventItem } from "../types";

const CATEGORIES = ["Music", "Technology", "Art and Culture", "Workshops", "Sports", "Comedy"];
const empty: EventForm = { title: "", description: "", category: "Music", venue: "", city: "", eventDate: "", ticketPrice: 0, totalTickets: 50, posterUrl: "" };
const th = "px-3 py-2 text-left font-medium text-mute", td = "px-3 py-2 border-t border-line";

export function MyEvents() {
  const [events, setEvents] = useState<EventItem[] | null>(null); const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState(""); const [error, setError] = useState("");
  const load = () => Promise.all([api.adminEvents(), api.adminBookings()]).then(([e, b]) => { setEvents(e); setBookings(b); }).catch(e => setError(e.message));
  useEffect(() => { load(); }, []);
  const cancel = async (ev: EventItem) => { if (confirm(`Cancel "${ev.title}"?`)) { try { await api.cancelEvent(ev.id); load(); } catch (err) { setError((err as Error).message); } } };
  if (!events) return <p className="p-8 text-mute">{error || "Loading your events..."}</p>;
  const confirmed = bookings.filter(b => b.status === "CONFIRMED");
  const stats = [["Events", events.length], ["Tickets sold", confirmed.reduce((n, b) => n + b.quantity, 0)],
    ["Tickets remaining", events.filter(e => e.status === "ACTIVE").reduce((n, e) => n + e.availableTickets, 0)], ["Revenue (Rs)", confirmed.reduce((n, b) => n + b.totalPrice, 0)]];
  const shown = bookings.filter(b => (b.bookingReference + b.userEmail + b.event.title).toLowerCase().includes(filter.toLowerCase()));
  return (<main className="mx-auto max-w-6xl px-4 py-10 text-sm">
    <div className="flex items-center justify-between"><h1 className="font-display text-3xl font-extrabold">My events</h1><Link to="/organizer/create" className="btn">Create event</Link></div>
    <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-4">
      {stats.map(([k, v]) => <div key={k} className="bg-raised p-4"><dt className="text-mute">{k}</dt><dd className="text-2xl font-semibold text-cyan">{v}</dd></div>)}</dl>
    {error && <p role="alert" className="alert mt-4">{error}</p>}
    {events.length === 0 ? <div className="mt-8 rounded-xl border border-dashed border-line p-12 text-center text-mute"><p>You haven't created any events yet.</p>
      <Link to="/organizer/create" className="btn mt-4 inline-block">Create your first event</Link></div> : (
    <div className="mt-6 overflow-x-auto rounded-lg border border-line"><table className="w-full"><thead><tr>{["Title", "Date", "Price", "Sold / Capacity", "Status", ""].map(h => <th key={h} className={th}>{h}</th>)}</tr></thead>
      <tbody>{events.map(e => <tr key={e.id}><td className={td}>{e.title}</td><td className={td}>{new Date(e.eventDate).toLocaleString()}</td><td className={td}>Rs {e.ticketPrice}</td>
        <td className={td}>{e.totalTickets - e.availableTickets} / {e.totalTickets}</td><td className={td}>{e.status}</td>
        <td className={td + " space-x-2 whitespace-nowrap"}><Link className="btn-ghost" to={`/events/${e.id}`}>View</Link><Link className="btn-ghost" to={`/organizer/create?edit=${e.id}`}>Edit</Link>
          {e.status === "ACTIVE" && <button className="btn-ghost" onClick={() => cancel(e)}>Cancel</button>}</td></tr>)}</tbody></table></div>)}
    <h2 className="mt-10 text-lg font-semibold">Bookings for my events</h2>
    <input className="input mt-3 max-w-sm" placeholder="Search reference, email or event" aria-label="Search bookings" value={filter} onChange={e => setFilter(e.target.value)} />
    <div className="mt-3 overflow-x-auto rounded-lg border border-line"><table className="w-full"><thead><tr>{["Reference", "User", "Event", "Qty", "Total", "Status"].map(h => <th key={h} className={th}>{h}</th>)}</tr></thead>
      <tbody>{shown.map(b => <tr key={b.id}><td className={td + " font-mono"}>{b.bookingReference}</td><td className={td}>{b.userEmail}</td><td className={td}>{b.event.title}</td>
        <td className={td}>{b.quantity}</td><td className={td}>Rs {b.totalPrice}</td><td className={td}>{b.status}</td></tr>)}
        {shown.length === 0 && <tr><td className={td} colSpan={6}>No bookings found.</td></tr>}</tbody></table></div>
  </main>);
}

export function CreateEvent() {
  const nav = useNavigate(); const editId = Number(useSearchParams()[0].get("edit")) || null;
  const [form, setForm] = useState<EventForm>(empty); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const [uploading, setUploading] = useState(false);
  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; setError("");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) return setError("Only PNG, JPEG or WebP images are allowed.");
    if (file.size > 5 * 1024 * 1024) return setError("Image must be 5 MB or smaller.");
    setUploading(true);
    try { const { url } = await api.uploadPoster(file); setForm(f => ({ ...f, posterUrl: url })); } catch (err) { setError((err as Error).message); }
    finally { setUploading(false); e.target.value = ""; }
  };
  useEffect(() => { if (editId) api.adminEvents().then(l => { const ev = l.find(e => e.id === editId);
    if (ev) setForm({ ...ev, eventDate: ev.eventDate.slice(0, 16), posterUrl: ev.posterUrl ?? "" }); else setError("Event not found."); }).catch(e => setError(e.message)); }, [editId]);
  const save = async (e: FormEvent) => {
    e.preventDefault(); setError(""); setBusy(true);
    try { editId ? await api.updateEvent(editId, form) : await api.createEvent(form); nav("/organizer"); } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  };
  const f = (k: keyof EventForm) => ({ value: form[k] as string | number, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: typeof form[k] === "number" ? Number(e.target.value) : e.target.value }) });
  return (<main className="mx-auto max-w-3xl px-4 py-10"><h1 className="font-display text-3xl font-extrabold">{editId ? "Edit event" : "Create event"}</h1>
    {error && <p role="alert" className="alert mt-4">{error}</p>}
    <form onSubmit={save} className="mt-6 grid gap-3 md:grid-cols-2">
      <input className="input" placeholder="Title" aria-label="Title" required {...f("title")} />
      <select className="input" aria-label="Category" {...f("category")}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
      <input className="input" placeholder="Venue" aria-label="Venue" required {...f("venue")} /><input className="input" placeholder="City" aria-label="City" required {...f("city")} />
      <input className="input" type="datetime-local" aria-label="Date and time" required {...f("eventDate")} />
      <div className="rounded-lg border border-line bg-raised p-4 md:col-span-2"><p className="text-sm text-mute">Poster</p>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <img src={posterFor({ posterUrl: form.posterUrl || null, category: form.category })} alt="Poster preview" className="h-28 w-40 rounded-lg object-cover" />
          <div className="space-y-2"><label className="btn-ghost inline-block cursor-pointer focus-within:outline focus-within:outline-2 focus-within:outline-cyan">{uploading ? "Uploading..." : "Upload poster"}
            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={pick} disabled={uploading} /></label>
            {form.posterUrl && <button type="button" className="btn-ghost ml-2" onClick={() => setForm({ ...form, posterUrl: "" })}>Use default poster</button>}
            <p className="text-xs text-mute">PNG, JPEG or WebP, up to 5 MB. Without an upload, a designed {form.category} poster is used.</p></div></div></div>
      <input className="input" type="number" min={0} step="0.01" placeholder="Ticket price" aria-label="Ticket price" required {...f("ticketPrice")} />
      <input className="input" type="number" min={1} placeholder="Capacity" aria-label="Capacity" required {...f("totalTickets")} />
      <textarea className="input md:col-span-2" rows={4} placeholder="Description" aria-label="Description" required {...f("description")} />
      <div className="flex gap-3"><button className="btn" disabled={busy}>{busy ? "Saving..." : editId ? "Save changes" : "Create event"}</button>
        <Link to="/organizer" className="btn-ghost py-3">Back</Link></div>
    </form></main>);
}
