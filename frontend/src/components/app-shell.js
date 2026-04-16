"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth-context";
import { 
  LayoutDashboard, 
  BookOpen, 
  PlusCircle, 
  BrainCircuit, 
  User, 
  LogOut,
  BarChart3,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/semesters", label: "Semesters", icon: BookOpen },
  { href: "/semesters/new", label: "Add Semester", icon: PlusCircle },
  { href: "/quiz", label: "Quiz", icon: BrainCircuit },
  { href: "/profile", label: "Profile", icon: User },
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentLabel = NAV_ITEMS.find((item) =>
    pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`))
  )?.label;

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-800/10 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:inset-auto lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none"}`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100 justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 rounded-md">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              AuraAnalytics
            </span>
          </div>
          <button 
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Menu
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "text-indigo-600" : "text-gray-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100 mt-auto">
          <div className="flex flex-col mb-4 px-2">
            <span className="text-sm font-medium text-gray-900 truncate">{user?.name || "Student"}</span>
            <span className="text-xs text-gray-500 truncate">{user?.email || "student@example.com"}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5 text-red-500" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 hidden sm:block">
              {currentLabel || "Workspace"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm text-gray-500">
               Welcome, <span className="font-medium text-gray-900">{user?.name?.split(' ')[0] || "Student"}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm ring-2 ring-white shadow-sm shrink-0">
               {user?.name?.charAt(0)?.toUpperCase() || "S"}
            </div>
          </div>
        </header>

        {/* Main Content scrollable */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {/* Mobile Title */}
            <div className="sm:hidden mb-6">
              <h2 className="text-xl font-bold text-gray-900">{currentLabel || "Workspace"}</h2>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
