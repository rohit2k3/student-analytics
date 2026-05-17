"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../../../../components/auth-context";
import { apiRequest } from "../../../../../../../lib/api";
import { ArrowLeft, BrainCircuit, Send, AlertCircle, CheckCircle2, Loader2, Plus, Trash2, PencilLine } from "lucide-react";

const DIFFICULTIES = ["easy", "medium", "hard"];
const LEVELS = ["beginner", "intermediate", "advanced"];

export default function AssignQuizPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ subject: "", topic: "", difficulty: "medium", level: "intermediate", dueAt: "", mandatory: false });
  const [mode, setMode] = useState("ai");
  const [manualQuestions, setManualQuestions] = useState([
    { question: "", options: ["", "", "", ""], answer: "" },
  ]);
  const [preview, setPreview] = useState(null);   // questions preview after assign
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updateManualQuestion(index, patch) {
    setManualQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...patch } : q))
    );
  }

  function updateManualOption(qIndex, optIndex, value) {
    setManualQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((opt, oi) => (oi === optIndex ? value : opt)),
            }
          : q
      )
    );
  }

  function addManualQuestion() {
    setManualQuestions((prev) => [
      ...prev,
      { question: "", options: ["", "", "", ""], answer: "" },
    ]);
  }

  function removeManualQuestion(index) {
    setManualQuestions((prev) => prev.filter((_, i) => i !== index));
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
    if (mode === "manual") {
      const invalid = manualQuestions.some((q) => {
        const opts = q.options.map((o) => o.trim()).filter(Boolean);
        return !q.question.trim() || opts.length < 2 || !q.answer.trim() || !opts.includes(q.answer.trim());
      });
      if (invalid) {
        setError("Each question needs text, at least 2 options, and an answer that matches an option");
        return;
      }
    }
    setLoading(true);
    try {
      const quiz = await apiRequest(`/teacher/students/${id}/quiz`, {
        method: "POST",
        token,
        body: {
          ...form,
          dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : undefined,
          questions: mode === "manual" ? manualQuestions : undefined,
        },
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
          <p className="text-sm text-gray-500 mt-0.5">Generate with AI or build a quiz manually</p>
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
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("ai")}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                mode === "ai"
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
              }`}
            >
              <BrainCircuit className="inline h-4 w-4 mr-1" /> AI Generated
            </button>
            <button
              type="button"
              onClick={() => setMode("manual")}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                mode === "manual"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
              }`}
            >
              <PencilLine className="inline h-4 w-4 mr-1" /> Manual Builder
            </button>
          </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Deadline</label>
              <input
                type="datetime-local"
                value={form.dueAt}
                onChange={(e) => handleChange("dueAt", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                id="mandatory"
                type="checkbox"
                checked={form.mandatory}
                onChange={(e) => handleChange("mandatory", e.target.checked)}
                className="h-4 w-4 accent-indigo-600"
              />
              <label htmlFor="mandatory" className="text-sm font-medium text-gray-700">
                Mark as mandatory
              </label>
            </div>
          </div>

          {mode === "manual" ? (
            <div className="space-y-4">
              {manualQuestions.map((q, index) => (
                <div key={index} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <label className="flex-1">
                      <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                        Question {index + 1}
                      </span>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => updateManualQuestion(index, { question: e.target.value })}
                        placeholder="Type the question"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </label>
                    {manualQuestions.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeManualQuestion(index)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map((opt, optIndex) => (
                      <input
                        key={optIndex}
                        type="text"
                        value={opt}
                        onChange={(e) => updateManualOption(index, optIndex, e.target.value)}
                        placeholder={`Option ${optIndex + 1}`}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ))}
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Correct Answer</label>
                    <input
                      type="text"
                      value={q.answer}
                      onChange={(e) => updateManualQuestion(index, { answer: e.target.value })}
                      placeholder="Must match one of the options"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addManualQuestion}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-indigo-300"
              >
                <Plus className="h-4 w-4" /> Add Question
              </button>
            </div>
          ) : null}

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
