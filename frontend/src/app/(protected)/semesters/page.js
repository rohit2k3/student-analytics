"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../components/auth-context";
import { apiRequest } from "../../../lib/api";
import { BookOpen, Activity, AlertCircle, GraduationCap, ChevronDown, ChevronUp } from "lucide-react";

export default function SemestersPage() {
  const { token } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);

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
    if (token) loadResults();
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-indigo-600">
          <Activity className="h-8 w-8 animate-spin" />
          <p className="text-sm font-medium">Loading semesters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Semesters</h1>
        <p className="text-sm text-gray-500 mt-1">{results.length} semester{results.length !== 1 ? "s" : ""} recorded</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {results.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-gray-50 rounded-full mb-4">
            <BookOpen className="h-8 w-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No semesters added yet</p>
          <p className="text-sm text-gray-400 mt-1">Your teacher will add your semester results here</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden divide-y divide-gray-50">
          {results.map((result) => (
            <div key={result._id}>
              <div
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 cursor-pointer transition-colors"
                onClick={() => setExpanded(expanded === result._id ? null : result._id)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50">
                    <GraduationCap className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{result.semesterLabel}</p>
                    <p className="text-xs text-gray-400">{result.subjects?.length || 0} subjects</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-400">GPA</p>
                    <p className="font-semibold text-gray-800">{typeof result.gpa === "number" ? result.gpa : "—"}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-400">Score</p>
                    <p className="font-semibold text-gray-800">
                      {typeof result.percentage === "number" ? `${result.percentage}%` : "—"}
                    </p>
                  </div>
                  {expanded === result._id ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>

              {expanded === result._id && (
                <div className="px-6 pb-5 bg-gray-50/30">
                  <table className="w-full text-sm mt-2">
                    <thead>
                      <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                        <th className="pb-2 pr-4">Subject</th>
                        <th className="pb-2 pr-4">Score</th>
                        <th className="pb-2 pr-4">Credits</th>
                        <th className="pb-2">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.subjects?.map((s, i) => (
                        <tr key={i} className="text-gray-700">
                          <td className="py-2.5 pr-4 font-medium">{s.name}</td>
                          <td className="py-2.5 pr-4">
                            <span className={`font-semibold ${s.score < 60 ? "text-red-500" : "text-green-600"}`}>
                              {s.score}
                            </span>
                            <span className="text-gray-400">/100</span>
                          </td>
                          <td className="py-2.5 pr-4 text-gray-500">{s.credits || "—"}</td>
                          <td className="py-2.5 text-gray-500 capitalize">{s.category || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

