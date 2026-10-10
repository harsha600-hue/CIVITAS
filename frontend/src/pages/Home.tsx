import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { api } from "../services/api";
import EventCard from "../components/EventCard";
import type { EventItem } from "../types";

const CATEGORIES = [["Music", "from-violet/60"], ["Technology", "from-cyan/40"], ["Art and Culture", "from-violet/40"],
  ["Workshops", "from-cyan/30"], ["Sports", "from-violet/50"], ["Comedy", "from-cyan/50"]];

export default function Home() {
  const nav = useNavigate(); const [q, setQ] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { api.searchEvents({ size: "7" }).then(p => setEvents(p.content)).catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  const go = (e: FormEvent) => { e.preventDefault(); nav(`/explore?q=${encodeURIComponent(q)}`); };
  return (<main>
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 md:pt-24">
      <p className="text-cyan">Find your next thing.</p>
      <h1 className="mt-3 max-w-4xl font-display text-5xl font-extrabold leading-tight tracking-tight md:text-8xl">Make plans worth remembering.</h1>
      <p className="mt-6 max-w-xl text-lg text-mute">Concerts, workshops, cultural nights and experiences, all in one place. Pick one and book in a minute.</p>
      <form onSubmit={go} className="mt-8 flex max-w-xl gap-2" role="search">
        <label className="relative flex-1"><span className="sr-only">Search events</span><Search className="absolute left-3 top-3.5 h-5 w-5 text-mute" aria-hidden />
          <input className="input pl-10" placeholder="Search by event or venue" value={q} onChange={e => setQ(e.target.value)} /></label>
        <button className="btn">Search</button></form>
      <div className="mt-6 flex gap-3"><Link to="/explore" className="btn">Explore Events</Link><a href="#upcoming" className="btn-ghost py-3">See What's On</a></div>
    </section>

    <section className="mx-auto max-w-6xl px-4" id="upcoming">
      <h2 className="font-display text-3xl font-extrabold">Featured and upcoming</h2>
      {loading && <p className="mt-4 text-mute">Loading events...</p>}
      {error && <p role="alert" className="alert mt-4">{error}</p>}
      {!loading && !error && events.length === 0 && <p className="mt-4 text-mute">No upcoming events yet. Check back soon.</p>}
      <ul className="mt-6 grid gap-6 md:grid-cols-3">{events.map((e, i) => <EventCard key={e.id} e={e} large={i === 0} />)}</ul>
      <Link to="/explore" className="btn-ghost mt-6 inline-block">See all events</Link>
    </section>

    <section className="mx-auto mt-20 max-w-6xl px-4">
      <h2 className="font-display text-3xl font-extrabold">Browse by category</h2>
      <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        {CATEGORIES.map(([c, g]) => <li key={c}><Link to={`/explore?category=${encodeURIComponent(c)}`}
          className={`flex h-28 items-end rounded-xl border border-line bg-gradient-to-br ${g} to-raised p-4 font-display text-xl font-semibold transition hover:border-cyan`}>{c}</Link></li>)}
      </ul>
    </section>
  </main>);
}
