"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../../../components/auth-context";
import { apiRequest } from "../../../../lib/api";
import {
  Users,
  GraduationCap,
  TrendingUp,
  Activity,
  UserPlus,
  ChevronRight,
  AlertCircle,
  BookOpen,
  ClipboardList,
} from "lucide-react";

export default function TeacherDashboard() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [students, setStudents] = useState([]);

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

  const totalStudents = students.length;
  const gpas = students.map((s) => parseFloat(s.avgGpa)).filter((g) => !isNaN(g));
  const avgGpa = gpas.length ? (gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(2) : "—";
  const totalSemesters = students.reduce((sum, s) => sum + (s.semesterCount || 0), 0);
  const pcts = students.map((s) => s.avgPercentage).filter((p) => p != null);
  const avgPct = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-indigo-600">
          <Activity className="h-8 w-8 animate-spin" />
          <p className="text-sm font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 px-6 py-8 shadow-sm">
        <div className="relative z-10">
          <p className="text-purple-200 text-sm font-medium mb-1">Teacher Panel</p>
          <h2 className="text-2xl font-bold text-white">
            Welcome back, {user?.name?.split(" ")[0] || "Teacher"}!
          </h2>
          <p className="mt-2 text-purple-100 max-w-xl">
            Manage your students, track their academic performance, and assign targeted quizzes to help them improve.
          </p>
          <Link
            href="/teacher/students/new"
            className="inline-flex items-center gap-2 mt-4 bg-white text-purple-700 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Add New Student
          </Link>
        </div>
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-purple-500 opacity-40 blur-3xl" />
        <div className="absolute right-32 bottom-0 -mb-16 h-48 w-48 rounded-full bg-indigo-400 opacity-30 blur-2xl" />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Total Students</p>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900">{totalStudents}</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Avg Class GPA</p>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900">{avgGpa}</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Total Semesters</p>
            <div className="p-2 bg-blue-50 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900">{totalSemesters}</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Avg Score</p>
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900">{avgPct != null ? `${avgPct}%` : "—"}</p>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Your Students</h3>
          </div>
          <Link
            href="/teacher/students"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <Users className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No students yet</p>
            <p className="text-sm text-gray-400 mt-1">Start by adding your first student</p>
            <Link
              href="/teacher/students/new"
              className="mt-4 inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <UserPlus className="h-4 w-4" /> Add Student
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Semesters</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg GPA</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Score</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.slice(0, 8).map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm shrink-0">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-400">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{student.department || "—"}</td>
                    <td className="px-6 py-4 text-gray-600">{student.semesterCount}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${student.avgGpa >= 7 ? "text-green-600" : student.avgGpa >= 5 ? "text-amber-500" : "text-red-500"}`}>
                        {student.avgGpa ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {student.avgPercentage != null ? `${student.avgPercentage}%` : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/teacher/students/${student.id}`}
                        className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 justify-end"
                      >
                        View <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
