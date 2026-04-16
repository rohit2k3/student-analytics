"use client";

import { useRouter } from "next/navigation";
import SemesterForm from "../../../../components/semester-form";
import { useAuth } from "../../../../components/auth-context";
import { apiRequest } from "../../../../lib/api";

export default function AddSemesterPage() {
  const router = useRouter();
  const { token } = useAuth();

  async function handleCreate(payload) {
    await apiRequest("/results", { method: "POST", body: payload, token });
    router.push("/semesters");
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-stone-700">Create a semester entry with all subjects and marks.</p>
      <SemesterForm submitLabel="Save Semester" onSubmit={handleCreate} />
    </div>
  );
}
