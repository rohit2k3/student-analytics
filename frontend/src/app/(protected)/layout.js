"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../components/auth-context";
import AppShell from "../../components/app-shell";

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isTeacher } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }
    // Redirect teachers away from student routes and vice versa
    if (isTeacher && !pathname.startsWith("/teacher")) {
      router.replace("/teacher/dashboard");
    } else if (!isTeacher && pathname.startsWith("/teacher")) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isTeacher, pathname, router]);

  if (!isAuthenticated) {
    return <main className="p-6">Redirecting to login...</main>;
  }

  return <AppShell>{children}</AppShell>;
}

