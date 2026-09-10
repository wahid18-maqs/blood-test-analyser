"use client";
import { useState, FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Droplet } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-card rounded-xl shadow-sm p-8 border border-slate-100">
        <div className="flex items-center gap-2 mb-8">
          <Droplet className="text-red-500" size={28} fill="currentColor" />
          <span className="font-semibold text-lg text-primary-dark">Blood Test Analyser</span>
        </div>
        <h1 className="text-xl font-semibold text-primary-dark mb-1">Sign in</h1>
        <p className="text-sm text-slate-500 mb-6">Access your dashboard and report history.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="alex@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-dark text-white rounded-lg py-2.5 text-sm font-medium hover:bg-primary transition-colors disabled:opacity-60 cursor-pointer"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
