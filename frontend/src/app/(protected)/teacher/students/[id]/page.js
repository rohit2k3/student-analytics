"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../../components/auth-context";
import { apiRequest } from "../../../../../lib/api";
import {
  ArrowLeft,
  Activity,
  AlertCircle,
  BookOpen,
  BrainCircuit,
  PlusCircle,
  GraduationCap,
  TrendingUp,
  CheckCircle2,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  Pencil,
  Save,
  X,
  Loader2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function StudentDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [expandedSem, setExpandedSem] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editMsg, setEditMsg] = useState("");

  async function load() {
    try {
      const res = await apiRequest(`/teacher/students/${id}`, { token });
      setData(res);
      // Pre-fill edit form with current student data
      setEditForm({
        name: res.student.name || "",
        department: res.student.profile?.department || "",
        year: res.student.profile?.year || "",
        targetGpa: res.student.profile?.targetGpa ?? "",
        weeklyStudyHours: res.student.profile?.weeklyStudyHours ?? "",
        learningGoal: res.student.profile?.learningGoal || "",
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token && id) load();
  }, [token, id]);

  async function deleteSemester(semesterId) {
    if (!confirm("Delete this semester? This cannot be undone.")) return;
    setDeleting(semesterId);
    try {
      await apiRequest(`/teacher/semesters/${semesterId}`, { method: "DELETE", token });
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setDeleting(null);
    }
  }

  async function saveStudentProfile(e) {
    e.preventDefault();
    setEditSaving(true);
    setEditMsg("");
    try {
      await apiRequest(`/teacher/students/${id}`, {
        method: "PUT",
        token,
        body: {
          name: editForm.name,
          profile: {
            department: editForm.department,
            year: editForm.year,
            targetGpa: editForm.targetGpa === "" ? "" : Number(editForm.targetGpa),
            weeklyStudyHours: editForm.weeklyStudyHours === "" ? "" : Number(editForm.weeklyStudyHours),
            learningGoal: editForm.learningGoal,
          },
        },
      });
      setEditMsg("Saved!");
      await load();
      setTimeout(() => { setEditOpen(false); setEditMsg(""); }, 1200);
    } catch (err) {
      setEditMsg(err.message);
    } finally {
      setEditSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-indigo-600">
          <Activity className="h-8 w-8 animate-spin" />
          <p className="text-sm font-medium">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100">
        <AlertCircle className="h-5 w-5 shrink-0" />
        {error}
      </div>
    );
  }

  const { student, results, quizzes } = data;
  const gpas = results.map((r) => r.gpa).filter((g) => g != null);
  const avgGpa = gpas.length ? (gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(2) : null;
  const pcts = results.map((r) => r.percentage).filter((p) => p != null);
  const avgPct = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null;

  // Build subject score chart data from latest semester
  const latestResult = results[results.length - 1];
  const chartData = latestResult?.subjects?.map((s) => ({ subject: s.name, score: s.score })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/teacher/students" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-bold flex items-center justify-center text-lg shadow-sm">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
              <p className="text-sm text-gray-500">{student.email}</p>
              {(student.profile?.department || student.profile?.year) && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {[student.profile.department, student.profile.year].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditOpen((o) => !o)}
            className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {editOpen ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            {editOpen ? "Cancel" : "Edit Profile"}
          </button>
          <Link
            href={`/teacher/students/${id}/semester/new`}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            Add Semester
          </Link>
          <Link
            href={`/teacher/students/${id}/quiz/new`}
            className="inline-flex items-center gap-2 bg-purple-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
          >
            <BrainCircuit className="h-4 w-4" />
            Assign Quiz
          </Link>
        </div>
      </div>

      {/* Edit Profile Form (collapsible) */}
      {editOpen && editForm && (
        <form onSubmit={saveStudentProfile} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Edit Student Profile</h3>
            {editMsg && (
              <span className={`text-sm font-medium ${editMsg === "Saved!" ? "text-green-600" : "text-red-600"}`}>{editMsg}</span>
            )}
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {[{label:"Full Name",key:"name",type:"text",placeholder:"John Doe"},{label:"Department / Major",key:"department",type:"text",placeholder:"e.g. Computer Science"},{label:"Year / Semester",key:"year",type:"text",placeholder:"e.g. 3rd Year"},{label:"Target GPA",key:"targetGpa",type:"number",placeholder:"e.g. 8.5"},{label:"Weekly Study Hours",key:"weeklyStudyHours",type:"number",placeholder:"e.g. 15"}].map(({label,key,type,placeholder}) => (
              <label key={key}>
                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">{label}</span>
                <input
                  type={type}
                  value={editForm[key]}
                  onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </label>
            ))}
            <label className="md:col-span-2">
              <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Learning Goal</span>
              <textarea
                value={editForm.learningGoal}
                onChange={(e) => setEditForm((f) => ({ ...f, learningGoal: e.target.value }))}
                placeholder="What is this student aiming for?"
                rows={3}
                className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-none"
              />
            </label>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={editSaving}
              className="inline-flex items-center gap-2 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-colors"
            >
              {editSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Semesters</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{results.length}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg GPA</p>
          <p className={`mt-2 text-3xl font-bold ${avgGpa >= 7 ? "text-green-600" : avgGpa >= 5 ? "text-amber-500" : "text-red-500"}`}>
            {avgGpa ?? "—"}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg Score</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{avgPct != null ? `${avgPct}%` : "—"}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quizzes</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{quizzes.length}</p>
        </div>
      </div>

      {/* Chart — latest semester subject scores */}
      {chartData.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="px-6 py-4 border-b border-gray-50">
            <h3 className="font-semibold text-gray-900">Latest Semester Subject Scores</h3>
            <p className="text-xs text-gray-400">{latestResult.semesterLabel}</p>
          </div>
          <div className="h-[260px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} dy={8} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "#F3F4F6" }}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                />
                <Bar dataKey="score" name="Score" radius={[4, 4, 0, 0]} barSize={36}>
                  {chartData.map((entry) => (
                    <Cell key={`cell-${entry.subject}`} fill={entry.score < 60 ? "#ef4444" : "#4f46e5"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Semesters List */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Semesters</h3>
          </div>
          <Link
            href={`/teacher/students/${id}/semester/new`}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" /> Add
          </Link>
        </div>

        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-8 w-8 text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">No semesters added yet</p>
            <Link
              href={`/teacher/students/${id}/semester/new`}
              className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Add first semester →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {results.map((result) => (
              <div key={result._id}>
                <div
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 cursor-pointer transition-colors"
                  onClick={() => setExpandedSem(expandedSem === result._id ? null : result._id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-50">
                      <GraduationCap className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{result.semesterLabel}</p>
                      <p className="text-xs text-gray-400">{result.subjects?.length} subjects</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-400">GPA</p>
                      <p className="font-semibold text-gray-800">{result.gpa ?? "—"}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-400">Score</p>
                      <p className="font-semibold text-gray-800">{result.percentage != null ? `${result.percentage}%` : "—"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteSemester(result._id); }}
                        disabled={deleting === result._id}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete semester"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {expandedSem === result._id ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedSem === result._id && (
                  <div className="px-6 pb-4 bg-gray-50/30">
                    <table className="w-full text-sm mt-2">
                      <thead>
                        <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                          <th className="py-2 pr-4">Subject</th>
                          <th className="py-2 pr-4">Score</th>
                          <th className="py-2 pr-4">Credits</th>
                          <th className="py-2">Category</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {result.subjects?.map((s, i) => (
                          <tr key={i} className="text-gray-700">
                            <td className="py-2 pr-4 font-medium">{s.name}</td>
                            <td className="py-2 pr-4">
                              <span className={`font-semibold ${s.score < 60 ? "text-red-500" : "text-green-600"}`}>
                                {s.score}
                              </span>
                              <span className="text-gray-400">/100</span>
                            </td>
                            <td className="py-2 pr-4 text-gray-500">{s.credits || "—"}</td>
                            <td className="py-2 text-gray-500 capitalize">{s.category || "—"}</td>
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

      {/* Assigned Quizzes */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Assigned Quizzes</h3>
          </div>
          <Link
            href={`/teacher/students/${id}/quiz/new`}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" /> Assign
          </Link>
        </div>

        {quizzes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BrainCircuit className="h-8 w-8 text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">No quizzes assigned yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {quizzes.map((q) => (
              <div key={q._id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${q.status === "submitted" ? "bg-green-50" : "bg-amber-50"}`}>
                    {q.status === "submitted" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{q.subject} — {q.topic}</p>
                    <p className="text-xs text-gray-400 capitalize">{q.difficulty} · {new Date(q.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  {q.status === "submitted" ? (
                    <>
                      <p className="font-bold text-green-600">{q.percentage}%</p>
                      <p className="text-xs text-gray-400">{q.score}/{q.total} correct</p>
                    </>
                  ) : (
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
