"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/auth-context";
import AppShell from "../../components/app-shell";

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <main className="p-6">Redirecting to login...</main>;
  }

  return <AppShell>{children}</AppShell>;
}
