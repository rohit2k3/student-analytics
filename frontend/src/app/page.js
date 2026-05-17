"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/auth-context";
import { apiRequest } from "../lib/api";
import { ArrowRight, BarChart2, BookOpen, BrainCircuit, Target, CheckCircle2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  async function onSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const data = await apiRequest("/auth/register", { method: "POST", body: form });
      login(data.token, data.user);
      router.replace("/dashboard");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-[#0b0b0f] min-h-screen text-white selection:bg-white selection:text-black">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#0b0b0f]/80 backdrop-blur-md z-50 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-xl tracking-tight text-white">AuraAnalytics</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="#register"
              className="font-semibold text-white/80 hover:text-white transition-colors"
            >
              Register
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-white/15 px-4 py-2 text-white/80 hover:text-white hover:border-white/30 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 lg:pt-32 relative overflow-hidden">
        
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <div className="absolute top-0 right-0 w-[520px] h-[520px] bg-white/[0.04] rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-[440px] h-[440px] bg-white/[0.03] rounded-full blur-[120px]"></div>
          <div className="absolute inset-x-0 top-16 h-64 bg-gradient-to-b from-white/[0.08] to-transparent"></div>
        </div>

        {/* Two-Column Hero */}
        <section className="relative z-10 px-6 py-16 md:py-24 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">
          
          {/* Left Column: Text Content */}
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 group cursor-default">
              <span className="flex h-2 w-2 mr-1">
                <span className="animate-pulse absolute inline-flex h-2 w-2 rounded-full bg-white opacity-70"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Academic OS v2.0
            </div>
            
            <h1 className="font-display text-5xl sm:text-6xl lg:text-[4.5rem] font-semibold tracking-tight leading-[1.05] mb-6 text-white">
              Teacher-first <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">performance intelligence.</span>
            </h1>
            
            <p className="text-lg text-gray-300 font-medium max-w-md mb-8 leading-relaxed">
              Build a living academic workspace for your students. Spot gaps, assign focused practice, and track improvement with clarity.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href="#register"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black px-7 py-3 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors"
              >
                Start Teacher Workspace <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#platform"
                className="w-full sm:w-auto flex items-center justify-center text-white/90 border border-white/20 px-7 py-3 rounded-full text-sm font-semibold hover:bg-white/5 transition-colors"
              >
                Explore Platform
              </a>
            </div>
          </div>

          {/* Right Column: Abstract Minimalist UI Element */}
          <div className="relative w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            {/* Outer Glow */}
            <div className="absolute -inset-1 bg-gradient-to-b from-white/20 to-transparent rounded-2xl blur-xl opacity-30"></div>
            
            {/* Floating Glass Card */}
            <div className="relative rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-2xl p-6 overflow-hidden">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <BarChart2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Overall Trajectory</div>
                    <div className="text-xs text-gray-500">Semester 1-4</div>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-md bg-white/10 text-white text-xs font-bold font-mono">
                  +12.4%
                </div>
              </div>

              {/* Abstract Chart */}
              <div className="flex items-end gap-3 h-32 mb-4">
                {[40, 55, 48, 70, 65, 85, 95].map((height, i) => (
                  <div key={i} className="flex-1 bg-white/5 rounded-t object-bottom relative group">
                    <div 
                      className="absolute bottom-0 w-full bg-white/20 rounded-t transition-all duration-1000 group-hover:bg-white"
                      style={{ height: `${height}%` }}
                    ></div>
                  </div>
                ))}
              </div>
              
              {/* Card Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gray-600 border-2 border-[#0a0a0a]"></div>
                  <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-[#0a0a0a]"></div>
                  <div className="w-6 h-6 rounded-full bg-white border-2 border-[#0a0a0a]"></div>
                </div>
                <div className="text-xs text-gray-500 font-medium">Synced just now</div>
              </div>
            </div>
            
            {/* Floating decorative elements */}
            {/* <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md flex items-center justify-center animate-bounce duration-[3000ms]">
              <Target className="w-8 h-8 text-white/50" />
            </div> */}
          </div>

        </section>

        {/* Registration Section */}
        <section id="register" className="py-24 md:py-32 max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
            <div>
              <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-white">Start your teacher workspace.</h2>
              <p className="text-lg text-gray-300 max-w-md">
                Build a shared view of performance, add students, and keep every term aligned to measurable goals.
              </p>
              <div className="mt-8 grid gap-4 text-sm text-gray-300">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                  <p className="text-white font-semibold">Step 1</p>
                  <p className="text-gray-400">Create a verified teacher account.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                  <p className="text-white font-semibold">Step 2</p>
                  <p className="text-gray-400">Add students and capture semester data.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                  <p className="text-white font-semibold">Step 3</p>
                  <p className="text-gray-400">Use analytics and AI quizzes to guide progress.</p>
                </div>
              </div>
              <div className="mt-6 text-sm text-gray-500">
                Already have an account?{" "}
                <Link href="/login" className="text-white underline-offset-4 hover:underline">
                  Sign in here
                </Link>
              </div>
            </div>

            <form
              onSubmit={onSubmit}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-8 backdrop-blur-xl shadow-2xl"
            >
              {error ? (
                <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs uppercase tracking-[0.2em] text-gray-400">
                  Teacher Registration
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300">Full Name</label>
                  <input
                    required
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-white/40 focus:outline-none"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Jane Teacher"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300">Email</label>
                  <input
                    type="email"
                    required
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-white/40 focus:outline-none"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="you@school.edu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300">Password</label>
                  <input
                    type="password"
                    minLength={6}
                    required
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-white/40 focus:outline-none"
                    value={form.password}
                    onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                    placeholder="At least 6 characters"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-gray-200 disabled:opacity-60"
              >
                {submitting ? "Creating workspace..." : "Create teacher workspace"}
              </button>
            </form>
          </div>
        </section>

        {/* Minimal Stats Strip */}
        <section className="border-y border-white/10 bg-white/5">
          <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="pt-4 md:pt-0">
              <p className="text-4xl font-light tracking-tight mb-1 text-white">100%</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Clarity</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-4xl font-light tracking-tight mb-1 text-white">0</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Distractions</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-4xl font-light tracking-tight mb-1 text-white">AI</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Powered Quizzes</p>
            </div>
            <div className="pt-4 md:pt-0 flex items-center justify-center flex-col">
              <div className="flex -space-x-2 overflow-hidden mb-2">
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-black bg-gray-600" />
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-black bg-gray-400" />
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-black bg-white" />
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">For Students & Teachers</p>
            </div>
          </div>
        </section>

        {/* Asymmetric Feature Layout - Platform Section */}
        <section id="platform" className="py-24 md:py-32 max-w-6xl mx-auto px-6">
          <div className="mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">The core loops.</h2>
            <p className="text-lg text-gray-400 max-w-xl">
              Everything you need to stay on top of your studies without the bloated interface. Simple inputs, powerful outputs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 md:gap-24">
            
            {/* Feature Block 1 */}
            <div className="flex flex-col gap-6">
              <div className="w-12 h-12 bg-white/10 border border-white/5 rounded-lg flex items-center justify-center mb-2">
                <BarChart2 className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-white">Data that speaks.</h3>
              <p className="text-gray-400 leading-relaxed">
                Log your semester results and let AuraAnalytics do the rest. View straightforward graphs detailing your overall GPA, your strongest subjects, and the specific areas pulling your average down. No complex setup—just immediate insights.
              </p>
              <ul className="space-y-3 mt-4">
                <li className="flex items-center gap-3 text-sm font-medium text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-gray-500" /> Historical grade tracking
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-gray-500" /> Weakness identification
                </li>
              </ul>
            </div>

            {/* Feature Block 2 */}
            <div className="flex flex-col gap-6">
              <div className="w-12 h-12 bg-white/10 border border-white/5 rounded-lg flex items-center justify-center mb-2">
                <BrainCircuit className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-white">Adaptive testing.</h3>
              <p className="text-gray-400 leading-relaxed">
                Once the system identifies your weak subjects, you can generate AI practice quizzes instantly. The platform tailors questions to the exact topics you struggle with, allowing you to focus your study time efficiently.
              </p>
              <ul className="space-y-3 mt-4">
                <li className="flex items-center gap-3 text-sm font-medium text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-gray-500" /> On-demand quiz generation
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-gray-500" /> Real-time feedback
                </li>
              </ul>
            </div>

            {/* Feature Block 3 */}
            <div className="flex flex-col gap-6">
              <div className="w-12 h-12 bg-white/10 border border-white/5 rounded-lg flex items-center justify-center mb-2">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-white">Target alignment.</h3>
              <p className="text-gray-400 leading-relaxed">
                Set an overarching GPA goal and define your weekly study hours. AuraAnalytics calculates exactly how far you are from reaching your objective so you can adjust your habits accordingly.
              </p>
            </div>

            {/* Feature Block 4 */}
            <div className="flex flex-col gap-6 border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0 md:pl-16">
              <div className="w-12 h-12 bg-white/10 border border-white/5 rounded-lg flex items-center justify-center mb-2">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-white">Role segregation.</h3>
              <p className="text-gray-400 leading-relaxed">
                Clean boundaries. Teachers manage student profiles and assign curated quizzes. Students get a read-only view of their metrics designed entirely to help them understand their performance.
              </p>
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-bold tracking-tight text-sm text-white">AuraAnalytics.</span>
          <p className="text-xs text-gray-500">© 2026. Designed for focus.</p>
        </div>
      </footer>
    </div>
  );
}
