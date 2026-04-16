"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../../components/auth-context";
import { apiRequest } from "../../../lib/api";

export default function SemestersPage() {
  const { token } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadResults() {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest("/results", { token });
        setResults(data.results || []);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadResults();
    }
  }, [token]);

  return (
    <section className="spa-panel p-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="spa-title text-lg font-bold text-amber-900">Added Semesters</h3>
        <Link href="/semesters/new" className="spa-button">
          Add New Semester
        </Link>
      </div>

      {loading ? <p className="text-sm text-stone-700">Loading semesters...</p> : null}
      {error ? <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200">
              <th className="px-2 py-2 text-left">Semester</th>
              <th className="px-2 py-2 text-left">Subjects</th>
              <th className="px-2 py-2 text-left">GPA</th>
              <th className="px-2 py-2 text-left">Percentage</th>
              <th className="px-2 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result._id} className="border-b border-stone-100">
                <td className="px-2 py-2 font-semibold">{result.semesterLabel}</td>
                <td className="px-2 py-2">{result.subjects?.length || 0}</td>
                <td className="px-2 py-2">{typeof result.gpa === "number" ? result.gpa : "N/A"}</td>
                <td className="px-2 py-2">
                  {typeof result.percentage === "number" ? `${result.percentage}%` : "N/A"}
                </td>
                <td className="px-2 py-2">
                  <Link
                    href={`/semesters/${result._id}/edit`}
                    className="rounded border border-stone-300 px-3 py-1 text-xs font-semibold hover:bg-stone-100"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
