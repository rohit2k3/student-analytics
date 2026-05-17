"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../components/auth-context";
import { apiRequest } from "../../../lib/api";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const data = await apiRequest("/auth/register", { method: "POST", body: form });
      login(data.token, data.user);
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 h-[420px] w-[420px] rounded-full bg-white/5 blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full bg-white/5 blur-[120px]"></div>
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 lg:flex-row lg:items-center lg:gap-12">
        <div className="max-w-lg">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Teacher Access
          </p>
          <h1 className="font-display mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            Create your teacher workspace.
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Centralize student performance, assign quizzes, and keep every semester on track with one unified dashboard.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-gray-300">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              Add student profiles, then monitor performance trends with ease.
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              Generate focused quizzes for weak subjects instantly.
            </div>
          </div>
          <div className="mt-6 text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-white underline-offset-4 hover:underline">
              Sign in here
            </Link>
          </div>
        </div>

        <form
          className="mt-10 w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-8 shadow-2xl backdrop-blur-xl lg:mt-0"
          onSubmit={onSubmit}
        >
          {error && (
            <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300">Full Name</label>
              <input
                type="text"
                required
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-white/40 focus:outline-none"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Jane Teacher"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300">Email address</label>
              <input
                type="email"
                required
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-white/40 focus:outline-none"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="you@school.edu"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-white/40 focus:outline-none"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="At least 6 characters"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-gray-200 disabled:opacity-60"
          >
            {submitting ? "Creating workspace..." : "Create teacher workspace"}
          </button>
        </form>
      </div>
    </div>
  );
}
