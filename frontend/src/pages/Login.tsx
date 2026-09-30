import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, apiErrorMessage } from "../services/api";
import { useAuthStore } from "../stores/authStore";
import SiteHeader from "../components/layout/SiteHeader";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      setSession(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't sign you in. Check your email and password."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink dark:bg-ink dark:text-paper">
      <SiteHeader />
      <div className="container-page flex justify-center py-20">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h1 className="font-display text-3xl">Welcome back</h1>
          <p className="mt-2 text-sm text-ink/60 dark:text-paper/60">Sign in to keep working on your plan.</p>

          {error && (
            <div className="mt-6 rounded-sm border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="mt-8 space-y-5">
            <div>
              <label className="field-label">Email</label>
              <input className="field-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input className="field-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-8 w-full">
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <p className="mt-6 text-center text-sm text-ink/60 dark:text-paper/60">
            New here? <Link to="/register" className="text-forest underline dark:text-gold-light">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
