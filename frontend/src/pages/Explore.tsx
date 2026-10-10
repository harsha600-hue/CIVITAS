import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, CalendarX } from "lucide-react";
import { api } from "../services/api";
import EventCard from "../components/EventCard";
import type { EventItem } from "../types";

const CATEGORIES = ["Music", "Technology", "Art and Culture", "Workshops", "Sports", "Comedy"];

export default function Explore() {
  const [sp] = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? ""); const [category, setCategory] = useState(sp.get("category") ?? "");
  const [sort, setSort] = useState("eventDate"); const [maxPrice, setMaxPrice] = useState(""); const [from, setFrom] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]); const [total, setTotal] = useState(0); const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");

  const fetchPage = (p: number, append: boolean) => {
    setLoading(true); setError("");
    const params: Record<string, string> = { q, category, sort, page: String(p), size: "9" };
    if (maxPrice) params.maxPrice = maxPrice;
    if (from) params.from = `${from}T00:00:00`;
    api.searchEvents(params).then(r => { setEvents(prev => append ? [...prev, ...r.content] : r.content); setTotal(r.totalElements); setPage(p); })
      .catch(e => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(() => { const t = setTimeout(() => fetchPage(0, false), 300); return () => clearTimeout(t); }, [q, category, sort, maxPrice, from]); // debounced

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">Explore events</h1>
      <div className="mt-8 grid gap-3 md:grid-cols-5">
        <label className="relative md:col-span-2"><span className="sr-only">Search events</span>
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-mute" aria-hidden />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Title or venue" className="input pl-10" /></label>
        <select aria-label="Category" value={category} onChange={e => setCategory(e.target.value)} className="input">
          <option value="">All categories</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
        <input type="date" aria-label="From date" value={from} onChange={e => setFrom(e.target.value)} className="input" />
        <input type="number" min={0} aria-label="Maximum price" placeholder="Max price (Rs)" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="input" />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-mute" aria-live="polite">{loading && events.length === 0 ? "Loading events..." : `${total} matching events`}</p>
        <select aria-label="Sort" value={sort} onChange={e => setSort(e.target.value)} className="input !w-auto"><option value="eventDate">Soonest first</option><option value="ticketPrice">Lowest price</option></select>
      </div>
      {error && <p role="alert" className="alert mt-4">{error}</p>}
      {!loading && !error && events.length === 0 && (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-dashed border-line p-16 text-mute">
          <CalendarX className="h-8 w-8" aria-hidden /><p>No events match. Try clearing a filter.</p></div>)}
      <ul className="mt-6 grid gap-6 md:grid-cols-3">{events.map(e => <EventCard key={e.id} e={e} />)}</ul>
      {events.length < total && <button className="btn-ghost mx-auto mt-8 block" disabled={loading} onClick={() => fetchPage(page + 1, true)}>{loading ? "Loading..." : "Load more"}</button>}
    </main>);
}
