import { Link } from "react-router-dom";
import { posterFor } from "../utils";
import type { EventItem } from "../types";

export default function EventCard({ e, large }: { e: EventItem; large?: boolean }) {
  const left = e.availableTickets;
  return (
    <li className={`group relative overflow-hidden rounded-xl border border-line bg-raised transition hover:border-cyan ${large ? "md:col-span-2" : ""}`}>
      <div className={`${large ? "h-64" : "h-44"} overflow-hidden`}><img src={posterFor(e)} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" /></div>
      <div className="relative bg-raised p-5">
        <p className="text-sm text-violet">{e.category}</p>
        <h3 className={`font-display font-semibold ${large ? "text-3xl" : "text-xl"}`}>
          <Link to={`/events/${e.id}`} className="after:absolute after:inset-0 hover:text-cyan">{e.title}</Link></h3>
        <p className="mt-1 text-sm text-mute">{new Date(e.eventDate).toLocaleString()}, {e.venue}, {e.city}</p>
        <p className="mt-3 flex justify-between"><span className="font-semibold text-cyan">from Rs {e.ticketPrice}</span>
          <span className={`text-sm ${left === 0 ? "text-red-300" : left < 10 ? "text-violet" : "text-mute"}`}>{left === 0 ? "Sold out" : `${left} left`}</span></p>
      </div>
    </li>);
}
