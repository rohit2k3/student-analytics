import Link from "next/link";
import { BarChart3, BrainCircuit, Target, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-white min-h-screen font-sans text-gray-900 selection:bg-indigo-100">
      {/* Navbar */}
      <nav className="border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex flex-shrink-0 items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                AuraAnalytics
              </span>
            </div>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:text-indigo-600 px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative px-6 py-24 sm:py-32 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white"></div>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-6">
              Master Your Semesters with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Intelligent Analytics
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 mb-10">
              Track your academic performance, uncover weak subjects, study smarter with AI-generated quizzes, and reach your target GPA effortlessly.
            </p>
            <div className="flex items-center justify-center gap-x-6">
              <Link
                href="/register"
                className="rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 flex items-center gap-2 transition-transform hover:scale-105"
              >
                Start Analyzing Free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="bg-gray-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-base font-semibold leading-7 text-indigo-600">Accelerate Learning</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Everything you need to excel</p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                <div className="flex flex-col bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                      <BarChart3 className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                    </div>
                    Visual Dashboard
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">Watch your grades grow. Comprehensive charts breakdown your absolute best, worst, and average trends across terms.</p>
                  </dd>
                </div>
                
                <div className="flex flex-col bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                      <BrainCircuit className="h-6 w-6 text-purple-600" aria-hidden="true" />
                    </div>
                    Targeted Quizzes
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">Our AI automatically detects your weakest areas and generates adaptive practice questions so you hit the books effectively.</p>
                  </dd>
                </div>

                <div className="flex flex-col bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50">
                      <Target className="h-6 w-6 text-pink-600" aria-hidden="true" />
                    </div>
                    Goal Tracking
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">Establish your ideal target GPA and weekly study schedules. Map out your path and see how far you are from success.</p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500">© 2026 AuraAnalytics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
