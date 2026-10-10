import { Link, NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { Ticket } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import EventDetail from "./pages/EventDetail";
import MyBookings from "./pages/MyBookings";
import { MyEvents, CreateEvent } from "./pages/Admin";
import { Login, Register } from "./pages/Auth";

function Guard({ children, organizer }: { children: ReactNode; organizer?: boolean }) {
  const { user, loading } = useAuth(); const loc = useLocation();
  if (loading) return <p className="p-8 text-mute">Loading...</p>;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (organizer && user.role !== "ORGANIZER") return <Navigate to="/" replace />;
  if (!organizer && user.role === "ORGANIZER") return <Navigate to="/organizer" replace />;
  return <>{children}</>;
}

function Nav() {
  const { user, logout } = useAuth(); const link = "text-mute hover:text-ink";
  return (<header className="sticky top-0 z-10 border-b border-line bg-char/95 backdrop-blur"><nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4" aria-label="Main">
    <Link to="/" className="flex items-center gap-2 font-display text-2xl font-extrabold"><Ticket className="h-6 w-6 text-cyan" aria-hidden />Civitas</Link>
    <NavLink to="/explore" className={link}>Explore</NavLink>
    {user?.role === "ORGANIZER" && <><NavLink to="/organizer" end className={link}>My Events</NavLink><NavLink to="/organizer/create" className={link}>Create Event</NavLink></>}
    {user?.role === "USER" && <NavLink to="/bookings" className={link}>My Events</NavLink>}
    <span className="flex-1" />
    {user ? <><span className="hidden text-mute md:inline">{user.name} ({user.role === "ORGANIZER" ? "Organiser" : "Attendee"})</span><button className="btn-ghost" onClick={logout}>Log out</button></>
      : <><Link to="/login" className={link}>Log in</Link><Link to="/register" className="btn !py-2">Sign up</Link></>}
  </nav></header>);
}

export default function App() {
  return (<AuthProvider><Nav /><Routes>
    <Route path="/" element={<Home />} /><Route path="/explore" element={<Explore />} /><Route path="/events/:id" element={<EventDetail />} />
    <Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} />
    <Route path="/bookings" element={<Guard><MyBookings /></Guard>} />
    <Route path="/organizer" element={<Guard organizer><MyEvents /></Guard>} /><Route path="/organizer/create" element={<Guard organizer><CreateEvent /></Guard>} />
    <Route path="*" element={<Navigate to="/" />} /></Routes>
    <footer className="mt-20 border-t border-line px-4 py-8 text-center text-sm text-mute">Civitas. Find your next thing.</footer></AuthProvider>);
}
