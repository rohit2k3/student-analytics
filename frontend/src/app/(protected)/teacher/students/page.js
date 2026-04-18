"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../../../components/auth-context";
import { apiRequest } from "../../../../lib/api";
import {
  Users,
  UserPlus,
  Search,
  ChevronRight,
  Activity,
  AlertCircle,
  GraduationCap,
  BookOpen,
} from "lucide-react";

export default function StudentsListPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await apiRequest("/teacher/students", { token });
        setStudents(data.students || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    if (token) load();
  }, [token]);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.email.toLowerCase().includes(query.toLowerCase()) ||
      (s.department || "").toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-indigo-600">
          <Activity className="h-8 w-8 animate-spin" />
          <p className="text-sm font-medium">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
          <p className="text-sm text-gray-500 mt-1">{students.length} student{students.length !== 1 ? "s" : ""} enrolled</p>
        </div>
        <Link
          href="/teacher/students/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <UserPlus className="h-4 w-4" />
          Add Student
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, or department..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <Users className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">{query ? "No students match your search" : "No students yet"}</p>
            {!query && (
              <Link
                href="/teacher/students/new"
                className="mt-4 inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <UserPlus className="h-4 w-4" /> Add First Student
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left border-b border-gray-100">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dept / Year</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> Semesters</div>
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> Avg GPA</div>
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Score</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((student) => {
                  const gpa = parseFloat(student.avgGpa);
                  const gpaColor = isNaN(gpa) ? "text-gray-400" : gpa >= 7 ? "text-green-600" : gpa >= 5 ? "text-amber-500" : "text-red-500";
                  return (
                    <tr key={student.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{student.name}</p>
                            <p className="text-xs text-gray-400">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <p>{student.department || <span className="text-gray-300">—</span>}</p>
                        <p className="text-xs text-gray-400">{student.year || ""}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs">
                          {student.semesterCount}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold text-base ${gpaColor}`}>
                          {student.avgGpa ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-medium">
                        {student.avgPercentage != null ? `${student.avgPercentage}%` : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/teacher/students/${student.id}`}
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                        >
                          View <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
