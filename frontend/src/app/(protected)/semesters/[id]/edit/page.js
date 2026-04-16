"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SemesterForm from "../../../../../components/semester-form";
import { useAuth } from "../../../../../components/auth-context";
import { apiRequest } from "../../../../../lib/api";

export default function EditSemesterPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [semester, setSemester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSemester() {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest(`/results/${params.id}`, { token });
        setSemester(data);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    if (token && params.id) {
      loadSemester();
    }
  }, [token, params.id]);

  async function handleUpdate(payload) {
    await apiRequest(`/results/${params.id}`, {
      method: "PUT",
      token,
      body: payload,
    });
    router.push("/semesters");
  }

  if (loading) {
    return <p className="text-sm text-stone-700">Loading semester...</p>;
  }

  if (error) {
    return <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-stone-700">Update semester details and subject performance.</p>
      <SemesterForm initialData={semester} submitLabel="Update Semester" onSubmit={handleUpdate} />
    </div>
  );
}
