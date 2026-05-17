"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../../components/auth-context";
import { apiRequest } from "../../../../lib/api";
import { getPerformanceTag, getPerformanceTagClasses } from "../../../../lib/performance-tag";
import {
  BrainCircuit,
  AlertCircle,
  Loader2,
  Users,
  CheckCircle2,
  PencilLine,
  Plus,
  Trash2,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const DIFFICULTIES = ["easy", "medium", "hard"];
const LEVELS = ["beginner", "intermediate", "advanced"];
const CATEGORY_OPTIONS = ["Outstanding", "Above Average", "Average", "Below Average", "Not Rated"];

export default function TeacherQuizHubPage() {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [scope, setScope] = useState("all");
  const [category, setCategory] = useState("Outstanding");
  const [selected, setSelected] = useState([]);
  const [mode, setMode] = useState("ai");
  const [manualQuestions, setManualQuestions] = useState([
    { question: "", options: ["", "", "", ""], answer: "" },
  ]);
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  const [quizzesLoading, setQuizzesLoading] = useState(true);
  const [quizzesError, setQuizzesError] = useState("");
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [form, setForm] = useState({
    subject: "",
    topic: "",
    difficulty: "medium",
    level: "intermediate",
    dueAt: "",
    mandatoryMode: "optional",
    mandatoryCategory: "Below Average",
  });

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
    async function loadQuizzes() {
      try {
        const data = await apiRequest("/teacher/quizzes", { token });
        setAssignedQuizzes(data.quizzes || []);
      } catch (e) {
        setQuizzesError(e.message);
      } finally {
        setQuizzesLoading(false);
      }
    }
    if (token) load();
    if (token) loadQuizzes();
  }, [token]);

  const filteredStudents = useMemo(() => {
    if (scope !== "category") return students;
    return students.filter((s) => getPerformanceTag(s.avgPercentage).label === category);
  }, [students, scope, category]);

  function toggleStudent(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
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
          ? { ...q, options: q.options.map((opt, oi) => (oi === optIndex ? value : opt)) }
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

  async function assignQuiz(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.subject.trim() || !form.topic.trim()) {
      setError("Subject and topic are required");
      return;
    }

    if (scope === "selected" && selected.length === 0) {
      setError("Select at least one student");
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

    setAssigning(true);
    try {
      const payload = {
        ...form,
        scope,
        category: scope === "category" ? category : undefined,
        studentIds: scope === "selected" ? selected : undefined,
        questions: mode === "manual" ? manualQuestions : undefined,
        dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : undefined,
      };
      const res = await apiRequest("/teacher/quizzes/assign", { method: "POST", token, body: payload });
      setSuccess(`Assigned quizzes to ${res.count} student${res.count !== 1 ? "s" : ""}.`);
      setSelected([]);
      const nextList = await apiRequest("/teacher/quizzes", { token });
      setAssignedQuizzes(nextList.quizzes || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setAssigning(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-indigo-600">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quiz Assignment Hub</h1>
        <p className="text-sm text-gray-500 mt-1">Assign quizzes to all students, by performance category, or specific students.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-100">
          <CheckCircle2 className="h-5 w-5 shrink-0" /> {success}
        </div>
      )}

      <form onSubmit={assignQuiz} className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-5">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("ai")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              mode === "ai"
                ? "bg-black text-white border-black"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            <BrainCircuit className="inline h-4 w-4 mr-1" /> AI Generated
          </button>
          <button
            type="button"
            onClick={() => setMode("manual")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              mode === "manual"
                ? "bg-black text-white border-black"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            <PencilLine className="inline h-4 w-4 mr-1" /> Manual Builder
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Subject</span>
            <input
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Mathematics"
              required
            />
          </label>
          <label>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Topic</span>
            <input
              value={form.topic}
              onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Quadratic Equations"
              required
            />
          </label>
          <label>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Difficulty</span>
            <select
              value={form.difficulty}
              onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Level</span>
            <select
              value={form.level}
              onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Deadline</span>
            <input
              type="datetime-local"
              value={form.dueAt}
              onChange={(e) => setForm((p) => ({ ...p, dueAt: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Mandatory Settings</p>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { value: "optional", label: "Optional for all" },
              { value: "all", label: "Mandatory for all" },
              { value: "category", label: "Mandatory by category" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, mandatoryMode: option.value }))}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                  form.mandatoryMode === option.value
                    ? "bg-black text-white border-black"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {form.mandatoryMode === "category" && (
            <div className="mt-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Mandatory Category
              </label>
              <select
                value={form.mandatoryCategory}
                onChange={(e) => setForm((p) => ({ ...p, mandatoryCategory: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <button
            type="button"
            onClick={() => setScope("all")}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
              scope === "all" ? "bg-black text-white border-black" : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            Assign to All
          </button>
          <button
            type="button"
            onClick={() => setScope("category")}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
              scope === "category" ? "bg-black text-white border-black" : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            By Category
          </button>
          <button
            type="button"
            onClick={() => setScope("selected")}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
              scope === "selected" ? "bg-black text-white border-black" : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            Select Students
          </button>
        </div>

        {scope === "category" && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {scope !== "all" && (
          <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
              <Users className="h-4 w-4" />
              {scope === "category" ? "Students in category" : "Select students"}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredStudents.length === 0 ? (
                <p className="text-sm text-gray-500">No students match this filter.</p>
              ) : (
                filteredStudents.map((s) => {
                  const tag = getPerformanceTag(s.avgPercentage);
                  const tagClasses = getPerformanceTagClasses(tag.tone);
                  const checked = selected.includes(s.id);
                  return (
                    <label key={s.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
                      {scope === "selected" ? (
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleStudent(s.id)}
                          className="accent-black"
                        />
                      ) : (
                        <span className="h-4 w-4 rounded-full bg-gray-200"></span>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.email}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tagClasses}`}>
                        {tag.label}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}

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

        <div className="pt-2 border-t border-gray-100">
          <button
            type="submit"
            disabled={assigning}
            className="inline-flex items-center gap-2 rounded-lg bg-black text-white px-5 py-2.5 text-sm font-semibold hover:bg-gray-900 disabled:opacity-50"
          >
            {assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
            {assigning ? "Assigning..." : "Assign Quiz"}
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">All Assigned Quizzes</h2>
            <p className="text-sm text-gray-500">Open any quiz to see full analysis and answers.</p>
          </div>
        </div>

        {quizzesLoading ? (
          <div className="flex h-40 items-center justify-center text-indigo-600">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : quizzesError ? (
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100">
            <AlertCircle className="h-5 w-5 shrink-0" /> {quizzesError}
          </div>
        ) : assignedQuizzes.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No quizzes assigned yet.</p>
        ) : (
          <div className="mt-4 divide-y divide-gray-100">
            {assignedQuizzes.map((q) => {
              const missed = q.status === "missed";
              const expanded = expandedQuiz === q._id;
              return (
                <div key={q._id} className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setExpandedQuiz(expanded ? null : q._id)}
                      className="flex items-center gap-3 text-left"
                    >
                      <div className={`p-2 rounded-lg ${q.status === "submitted" ? "bg-green-50" : missed ? "bg-rose-50" : "bg-amber-50"}`}>
                        {q.status === "submitted" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className={`h-4 w-4 ${missed ? "text-rose-500" : "text-amber-500"}`} />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{q.subject} — {q.topic}</p>
                        <p className="text-xs text-gray-400">
                          {q.student?.name ? `${q.student.name} · ` : ""}
                          {new Date(q.createdAt).toLocaleDateString()} · {q.difficulty}
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      {q.status === "submitted" ? (
                        <div className="text-right">
                          <p className="font-bold text-green-600">{q.percentage}%</p>
                          <p className="text-xs text-gray-400">{q.score}/{q.total} correct</p>
                        </div>
                      ) : missed ? (
                        <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full">Missed</span>
                      ) : (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Pending</span>
                      )}
                      <span className="text-gray-400">
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </span>
                    </div>
                  </div>

                  {expanded && (
                    <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50/60 p-4">
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <span className="rounded-full bg-white px-2.5 py-1 border">{q.mandatory ? "Mandatory" : "Optional"}</span>
                        {q.dueAt ? (
                          <span className="rounded-full bg-white px-2.5 py-1 border">Due {new Date(q.dueAt).toLocaleString()}</span>
                        ) : null}
                        <span className="rounded-full bg-white px-2.5 py-1 border">Status: {q.status}</span>
                        {q.student?.email ? (
                          <span className="rounded-full bg-white px-2.5 py-1 border">{q.student.email}</span>
                        ) : null}
                      </div>

                      <div className="mt-4 space-y-3">
                        {(q.questions || []).map((question, idx) => {
                          const answer = q.userAnswers?.[idx];
                          const correct = answer && answer.trim() === (question.answer || "").trim();
                          return (
                            <div key={idx} className="rounded-lg border border-gray-200 bg-white p-3">
                              <p className="text-sm font-semibold text-gray-900">Q{idx + 1}. {question.question}</p>
                              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {(question.options || []).map((opt, oi) => (
                                  <div
                                    key={oi}
                                    className={`rounded-md border px-2 py-1 ${
                                      opt === question.answer
                                        ? "border-green-200 bg-green-50 text-green-700"
                                        : "border-gray-200 bg-gray-50 text-gray-600"
                                    }`}
                                  >
                                    {opt}
                                  </div>
                                ))}
                              </div>
                              {q.status === "submitted" && (
                                <p className={`mt-2 text-xs font-semibold ${correct ? "text-green-600" : "text-red-600"}`}>
                                  Student answer: {answer || "—"}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
