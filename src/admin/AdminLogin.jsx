import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";
import { login } from "../utils/auth";
import { Button } from "./ui";

export default function AdminLogin({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const session = await login(email, password);
      onAuth(session);
    } catch (reason) {
      setError(reason.message || "Those credentials didn’t work. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100svh] items-center justify-center px-5 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px]"
      >
        <div className="rounded-2xl border border-line bg-surface/70 p-7 backdrop-blur-2xl elevate-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-accent/12 text-accent ring-1 ring-accent/25">
            <Lock className="h-5 w-5" strokeWidth={1.9} />
          </span>

          <h1 className="mt-5 text-[22px] font-semibold tracking-[-0.03em] text-ink">Admin access</h1>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
            Sign in to manage content, projects and messages.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-3.5" noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-email" className="text-[12px] font-medium text-muted">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-line bg-bg/60 px-3.5 py-2.5 text-[13.5px] text-ink outline-none transition-all hover:border-line-strong focus:border-accent/70 focus:shadow-[0_0_0_3px_rgba(10,132,255,0.15)]"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-password" className="text-[12px] font-medium text-muted">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-line bg-bg/60 px-3.5 py-2.5 text-[13.5px] text-ink outline-none transition-all hover:border-line-strong focus:border-accent/70 focus:shadow-[0_0_0_3px_rgba(10,132,255,0.15)]"
                placeholder="••••••••"
              />
            </div>

            {error ? (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="text-[12.5px] text-red-500"
              >
                {error}
              </motion.p>
            ) : null}

            <Button type="submit" size="lg" loading={loading} className="w-full">
              {loading ? "Verifying" : "Sign in"}
            </Button>
          </form>
        </div>

        <a
          href="#/"
          className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Back to site
        </a>
      </motion.div>
    </div>
  );
}
