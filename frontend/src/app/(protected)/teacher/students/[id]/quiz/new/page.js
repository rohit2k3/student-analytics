"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../../../../components/auth-context";
import { apiRequest } from "../../../../../../../lib/api";
import { ArrowLeft, BrainCircuit, Send, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const DIFFICULTIES = ["easy", "medium", "hard"];
const LEVELS = ["beginner", "intermediate", "advanced"];

export default function AssignQuizPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ subject: "", topic: "", difficulty: "medium", level: "intermediate" });
  const [preview, setPreview] = useState(null);   // questions preview after assign
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onAssign(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setPreview(null);
    if (!form.subject.trim() || !form.topic.trim()) {
      setError("Subject and topic are required");
      return;
    }
    setLoading(true);
    try {
      const quiz = await apiRequest(`/teacher/students/${id}/quiz`, {
        method: "POST",
        token,
        body: form,
      });
      setSuccess(`Quiz assigned! ${quiz.questions?.length || 0} questions generated.`);
      setPreview(quiz.questions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/teacher/students/${id}`} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assign Quiz</h1>
          <p className="text-sm text-gray-500 mt-0.5">Generate an AI-powered quiz and assign it to this student</p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-8">
        {error && (
          <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100 mb-6">
            <AlertCircle className="h-5 w-5 shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-100 mb-6">
            <CheckCircle2 className="h-5 w-5 shrink-0" /> {success}
          </div>
        )}

        <form onSubmit={onAssign} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                placeholder="e.g. Mathematics"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Topic <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={form.topic}
                onChange={(e) => handleChange("topic", e.target.value)}
                placeholder="e.g. Integration by Parts"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Difficulty</label>
              <div className="flex gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleChange("difficulty", d)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors border ${
                      form.difficulty === d
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Student Level</label>
              <div className="flex gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => handleChange("level", l)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors border ${
                      form.level === l
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-50">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-purple-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
              {loading ? "Generating Quiz..." : "Generate & Assign"}
            </button>
          </div>
        </form>
      </div>

      {/* Quiz Preview */}
      {preview && preview.length > 0 && (
        <div className="rounded-2xl border border-purple-100 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-purple-50 bg-purple-50/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Quiz Preview ({preview.length} Questions)</h3>
            </div>
            <button
              onClick={() => router.push(`/teacher/students/${id}`)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              <Send className="h-4 w-4" /> View Student Profile
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {preview.map((q, i) => (
              <div key={i} className="px-6 py-4">
                <p className="font-medium text-gray-900 mb-3">
                  <span className="text-purple-600 mr-2">Q{i + 1}.</span>{q.question}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(q.options || []).map((opt, j) => (
                    <div
                      key={j}
                      className={`px-3 py-2 rounded-lg text-sm border ${
                        opt === q.answer
                          ? "bg-green-50 border-green-200 text-green-700 font-medium"
                          : "bg-gray-50 border-gray-100 text-gray-600"
                      }`}
                    >
                      {opt === q.answer && <span className="mr-1">✓</span>}
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
