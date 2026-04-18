"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth-context";
import { 
  LayoutDashboard, 
  BookOpen, 
  BrainCircuit, 
  User, 
  LogOut,
  BarChart3,
  Menu,
  X,
  Users,
  UserPlus,
  GraduationCap,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";

const STUDENT_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/semesters", label: "My Semesters", icon: BookOpen },
  { href: "/quiz", label: "Practice Quiz", icon: BrainCircuit },
  { href: "/profile", label: "Profile", icon: User },
];

const TEACHER_NAV = [
  { href: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/students", label: "My Students", icon: Users },
  { href: "/teacher/students/new", label: "Add Student", icon: UserPlus },
  { href: "/profile", label: "Profile", icon: User },
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isTeacher } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NAV_ITEMS = isTeacher ? TEACHER_NAV : STUDENT_NAV;

  const currentLabel = NAV_ITEMS.find((item) =>
    pathname === item.href || (item.href !== "/dashboard" && item.href !== "/teacher/dashboard" && pathname.startsWith(`${item.href}/`))
  )?.label;

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <div className="flex h-screen bg-[#fafafa] text-gray-900 font-sans overflow-hidden selection:bg-black selection:text-white">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:inset-auto lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none"}`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-200 justify-between">
          <Link href={isTeacher ? "/teacher/dashboard" : "/dashboard"} className="flex items-center gap-2 group">
            <div className="p-1.5 bg-black rounded-md group-hover:bg-gray-800 transition-colors">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-black">
              AuraAnalytics
            </span>
          </Link>
          <button 
            className="lg:hidden text-gray-400 hover:text-black transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">Workspace</span>
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded border border-gray-200 bg-gray-50 text-gray-700">
            {isTeacher ? <GraduationCap className="h-3 w-3" /> : <ClipboardList className="h-3 w-3" />}
            {isTeacher ? "Teacher" : "Student"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && item.href !== "/dashboard" && item.href !== "/teacher/dashboard" && pathname.startsWith(`${item.href}/`)) || (item.href === "/teacher/students" && pathname.includes("/teacher/students/new") === false && pathname.startsWith("/teacher/students")); // Keep parent active
              
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                    active
                      ? "bg-gray-100 text-black shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-black" : "text-gray-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50/50 mt-auto">
          <div className="flex flex-col mb-4 px-2">
            <span className="text-sm font-semibold text-black truncate">{user?.name || "User"}</span>
            <span className="text-xs text-gray-500 truncate">{user?.email || ""}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between glass px-4 sm:px-6 lg:px-8 z-10 shrink-0 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-gray-400 hover:text-black transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-base font-semibold text-black hidden sm:block">
              {currentLabel || "Workspace"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm text-gray-500">
               Welcome, <span className="font-medium text-black">{user?.name?.split(' ')[0] || "User"}</span>
            </div>
            <div className="h-8 w-8 rounded-md bg-black text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
               {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>
        </header>

        {/* Main Content scrollable */}
        <main className="flex-1 overflow-y-auto bg-[#fafafa] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {/* Mobile Title */}
            <div className="sm:hidden mb-6">
              <h2 className="text-lg font-bold text-black">{currentLabel || "Workspace"}</h2>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
