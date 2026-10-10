import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { User } from "../types";

function Field({ label, ...p }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label className="block"><span className="mb-1 block text-sm text-mute">{label}</span><input className="input" required {...p} /></label>;
}
const home = (u: User) => (u.role === "ORGANIZER" ? "/organizer" : "/explore");

export function Login() {
  const { setUser } = useAuth(); const nav = useNavigate(); const from = (useLocation().state as { from?: string })?.from;
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setError("");
    try { const u = await api.login({ email, password }); setUser(u); nav(from ?? home(u)); }
    catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  };
  return (<main className="mx-auto max-w-md px-4 py-16"><h1 className="font-display text-4xl font-extrabold">Log in</h1>
    <form onSubmit={submit} className="mt-8 space-y-4">
      {error && <p role="alert" className="alert">{error}</p>}
      <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
      <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
      <button className="btn w-full" disabled={busy}>{busy ? "Logging in..." : "Log in"}</button>
    </form><p className="mt-6 text-mute">New here? <Link to="/register" className="text-cyan">Create an account</Link></p></main>);
}

export function Register() {
  const { setUser } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "", confirmPassword: "", accountType: "USER" }); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError("");
    if (f.password !== f.confirmPassword) return setError("Passwords do not match.");
    setBusy(true);
    try { await api.register(f); const u = await api.login({ email: f.email, password: f.password }); setUser(u); nav(home(u)); }
    catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  };
  const types = [["USER", "Attendee", "Discover and book events"], ["ORGANIZER", "Organiser", "Create and manage your own events"]];
  return (<main className="mx-auto max-w-md px-4 py-16"><h1 className="font-display text-4xl font-extrabold">Create your account</h1>
    <form onSubmit={submit} className="mt-8 space-y-4">
      {error && <p role="alert" className="alert">{error}</p>}
      <fieldset><legend className="mb-2 text-sm text-mute">I want to</legend>
        <div className="grid grid-cols-2 gap-3">{types.map(([v, t, d]) => (
          <label key={v} className={`cursor-pointer rounded-lg border p-3 transition ${f.accountType === v ? "border-cyan bg-raised" : "border-line"} focus-within:outline focus-within:outline-2 focus-within:outline-cyan`}>
            <input type="radio" name="accountType" value={v} checked={f.accountType === v} onChange={set("accountType")} className="sr-only" />
            <span className="block font-semibold">{t}</span><span className="text-sm text-mute">{d}</span></label>))}</div></fieldset>
      <Field label="Full name" value={f.name} onChange={set("name")} autoComplete="name" />
      <Field label="Email" type="email" value={f.email} onChange={set("email")} autoComplete="email" />
      <Field label="Password (8+ characters)" type="password" minLength={8} value={f.password} onChange={set("password")} autoComplete="new-password" />
      <Field label="Confirm password" type="password" value={f.confirmPassword} onChange={set("confirmPassword")} autoComplete="new-password" />
      <button className="btn w-full" disabled={busy}>{busy ? "Creating..." : "Create account"}</button>
    </form><p className="mt-6 text-mute">Already registered? <Link to="/login" className="text-cyan">Log in</Link></p></main>);
}
