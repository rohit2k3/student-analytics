"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../components/auth-context";
import { apiRequest } from "../../../lib/api";
import {
  BrainCircuit,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  Send,
  Loader2,
} from "lucide-react";

export default function QuizPage() {
  const { token } = useAuth();

  // ----- Assigned quizzes (from teacher) -----
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  const [assignedLoading, setAssignedLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [assignedAnswers, setAssignedAnswers] = useState([]);
  const [assignedResult, setAssignedResult] = useState(null);
  const [submittingAssigned, setSubmittingAssigned] = useState(false);

  // ----- Self-practice AI quiz -----
  const [weakSubjects, setWeakSubjects] = useState([]);
  const [quizConfig, setQuizConfig] = useState({ subject: "", topic: "Core concepts", difficulty: "medium", level: "intermediate" });
  const [practiceQuiz, setPracticeQuiz] = useState(null);
  const [practiceAnswers, setPracticeAnswers] = useState([]);
  const [practiceResult, setPracticeResult] = useState(null);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAll() {
      try {
        const [assignedData, analytics] = await Promise.all([
          apiRequest("/quiz/assigned", { token }),
          apiRequest("/analytics", { token }),
        ]);
        setAssignedQuizzes(assignedData.quizzes || []);
        const weak = analytics.weakSubjects || [];
        setWeakSubjects(weak);
        if (weak.length) setQuizConfig((p) => ({ ...p, subject: weak[0].subject }));
      } catch (e) {
        setError(e.message);
      } finally {
        setAssignedLoading(false);
      }
    }
    if (token) loadAll();
  }, [token]);

  function startQuiz(quiz) {
    setActiveQuiz(quiz);
    setAssignedAnswers(new Array(quiz.questions.length).fill(""));
    setAssignedResult(null);
  }

  async function submitAssigned(e) {
    e.preventDefault();
    setSubmittingAssigned(true);
    try {
      const res = await apiRequest(`/quiz/assigned/${activeQuiz._id}/submit`, {
        method: "POST", token, body: { userAnswers: assignedAnswers },
      });
      setAssignedResult(res);
      const updated = await apiRequest("/quiz/assigned", { token });
      setAssignedQuizzes(updated.quizzes || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmittingAssigned(false);
    }
  }

  async function generatePracticeQuiz() {
    setPracticeLoading(true);
    setError("");
    setPracticeResult(null);
    try {
      const data = await apiRequest("/quiz/generate", { method: "POST", token, body: quizConfig });
      setPracticeQuiz(data);
      setPracticeAnswers(new Array(data.questions.length).fill(""));
    } catch (e) {
      setError(e.message);
    } finally {
      setPracticeLoading(false);
    }
  }

  async function submitPractice(e) {
    e.preventDefault();
    setPracticeLoading(true);
    try {
      const data = await apiRequest("/quiz/submit", {
        method: "POST", token,
        body: { subject: practiceQuiz.subject, topic: practiceQuiz.topic, difficulty: practiceQuiz.difficulty, questions: practiceQuiz.questions, userAnswers: practiceAnswers },
      });
      setPracticeResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setPracticeLoading(false);
    }
  }

  // ── Active assigned quiz view ──────────────────────────────────────────────
  if (activeQuiz) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <button onClick={() => setActiveQuiz(null)} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            ← Back to quizzes
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">{activeQuiz.subject} — {activeQuiz.topic}</h1>
          <p className="text-sm text-gray-400 capitalize">{activeQuiz.difficulty} difficulty · {activeQuiz.questions.length} questions</p>
        </div>

        {assignedResult ? (
          <div className={`rounded-2xl p-8 text-center border ${assignedResult.percentage >= 60 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
            <p className={`text-5xl font-bold mb-2 ${assignedResult.percentage >= 60 ? "text-green-600" : "text-red-500"}`}>
              {assignedResult.percentage}%
            </p>
            <p className="text-gray-600">{assignedResult.score} out of {assignedResult.total} correct</p>
            <button
              onClick={() => setActiveQuiz(null)}
              className="mt-6 inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submitAssigned} className="space-y-4">
            {activeQuiz.questions.map((q, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white shadow-sm p-6">
                <p className="font-semibold text-gray-900 mb-4">
                  <span className="text-indigo-600 mr-2">Q{i + 1}.</span>{q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        assignedAnswers[i] === opt
                          ? "border-indigo-400 bg-indigo-50"
                          : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${i}`}
                        checked={assignedAnswers[i] === opt}
                        onChange={() => setAssignedAnswers((a) => a.map((v, idx) => idx === i ? opt : v))}
                        className="accent-indigo-600"
                      />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button
              type="submit"
              disabled={submittingAssigned}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {submittingAssigned ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submittingAssigned ? "Submitting..." : "Submit Quiz"}
            </button>
          </form>
        )}
      </div>
    );
  }

  // ── Main quiz hub ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {/* Assigned Quizzes */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quizzes from Teacher</h2>
        {assignedLoading ? (
          <div className="flex items-center gap-3 text-indigo-600 text-sm">
            <Activity className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : assignedQuizzes.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col items-center justify-center py-12 text-center">
            <BrainCircuit className="h-8 w-8 text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">No quizzes assigned yet by your teacher</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {assignedQuizzes.map((q) => (
              <div
                key={q._id}
                className={`rounded-xl border bg-white shadow-sm p-5 flex flex-col gap-3 ${
                  q.status === "submitted" ? "border-green-100" : "border-indigo-100"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{q.subject}</p>
                    <p className="text-sm text-gray-500">{q.topic}</p>
                  </div>
                  {q.status === "submitted" ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
                      <CheckCircle2 className="h-3 w-3" /> Done
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                      <Clock className="h-3 w-3" /> Pending
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="capitalize">{q.difficulty}</span>
                  <span>·</span>
                  <span>{q.questions?.length || 0} questions</span>
                </div>
                {q.status === "submitted" ? (
                  <div className={`text-center rounded-lg py-2 text-sm font-bold ${q.percentage >= 60 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                    {q.percentage}% &nbsp;({q.score}/{q.total})
                  </div>
                ) : (
                  <button
                    onClick={() => startQuiz(q)}
                    className="w-full bg-indigo-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Start Quiz
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Self-Practice Quiz */}
      <section className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <BrainCircuit className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-bold text-gray-900">Self-Practice Quiz</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">Generate a custom AI quiz to practice any weak subject</p>

        {weakSubjects.length === 0 ? (
          <p className="text-sm text-gray-400">Add semester data first so we can detect your weak subjects.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <select
              value={quizConfig.subject}
              onChange={(e) => setQuizConfig((p) => ({ ...p, subject: e.target.value }))}
              className="col-span-2 sm:col-span-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              {weakSubjects.map((s) => <option key={s.subject} value={s.subject}>{s.subject}</option>)}
            </select>
            <input
              value={quizConfig.topic}
              onChange={(e) => setQuizConfig((p) => ({ ...p, topic: e.target.value }))}
              placeholder="Topic"
              className="col-span-2 sm:col-span-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <select
              value={quizConfig.difficulty}
              onChange={(e) => setQuizConfig((p) => ({ ...p, difficulty: e.target.value }))}
              className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <button
              type="button"
              onClick={generatePracticeQuiz}
              disabled={practiceLoading}
              className="inline-flex items-center justify-center gap-2 bg-purple-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {practiceLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
              {practiceLoading ? "Generating..." : "Generate"}
            </button>
          </div>
        )}

        {practiceQuiz && !practiceResult && (
          <form onSubmit={submitPractice} className="space-y-4 mt-4">
            {practiceQuiz.questions.map((q, i) => (
              <div key={i} className="rounded-xl border border-gray-100 p-4">
                <p className="font-semibold text-gray-900 mb-3">
                  <span className="text-purple-600 mr-2">Q{i + 1}.</span>{q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                        practiceAnswers[i] === opt ? "border-purple-400 bg-purple-50" : "border-gray-100 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`pq-${i}`}
                        checked={practiceAnswers[i] === opt}
                        onChange={() => setPracticeAnswers((a) => a.map((v, idx) => idx === i ? opt : v))}
                        className="accent-purple-600"
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button
              type="submit"
              disabled={practiceLoading}
              className="inline-flex items-center gap-2 bg-purple-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <Send className="h-4 w-4" /> Submit
            </button>
          </form>
        )}

        {practiceResult && (
          <div className={`mt-4 rounded-xl p-5 text-center ${practiceResult.percentage >= 60 ? "bg-green-50" : "bg-red-50"}`}>
            <p className={`text-3xl font-bold ${practiceResult.percentage >= 60 ? "text-green-600" : "text-red-500"}`}>
              {practiceResult.percentage}%
            </p>
            <p className="text-sm text-gray-600 mt-1">{practiceResult.score} / {practiceResult.total} correct</p>
            <button
              onClick={() => { setPracticeQuiz(null); setPracticeResult(null); }}
              className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Try Another →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
