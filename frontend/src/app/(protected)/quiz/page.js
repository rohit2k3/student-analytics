"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../components/auth-context";
import { apiRequest } from "../../../lib/api";

export default function QuizPage() {
  const { token } = useAuth();
  const [weakSubjects, setWeakSubjects] = useState([]);
  const [quizConfig, setQuizConfig] = useState({
    subject: "",
    topic: "Core concepts",
    difficulty: "medium",
    level: "intermediate",
  });
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWeakSubjects() {
      try {
        const analytics = await apiRequest("/analytics", { token });
        const weak = analytics.weakSubjects || [];
        setWeakSubjects(weak);
        if (weak.length) {
          setQuizConfig((prev) => ({ ...prev, subject: weak[0].subject }));
        }
      } catch (requestError) {
        setError(requestError.message);
      }
    }

    if (token) {
      loadWeakSubjects();
    }
  }, [token]);

  async function generateQuiz() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await apiRequest("/quiz/generate", {
        method: "POST",
        token,
        body: quizConfig,
      });
      setQuiz(data);
      setAnswers(new Array(data.questions.length).fill(""));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitQuiz(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/quiz/submit", {
        method: "POST",
        token,
        body: {
          subject: quiz.subject,
          topic: quiz.topic,
          difficulty: quiz.difficulty,
          questions: quiz.questions,
          userAnswers: answers,
        },
      });
      setResult(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="spa-panel p-6">
        <h3 className="spa-title text-lg font-bold text-amber-900">Weak Subject Quiz</h3>
        <p className="mt-1 text-sm text-stone-600">
          Generate targeted quizzes for your weakest subjects.
        </p>

        {weakSubjects.length === 0 ? (
          <p className="mt-3 text-sm text-stone-700">No weak subjects found yet. Add semester data first.</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <select
              className="spa-input"
              value={quizConfig.subject}
              onChange={(event) =>
                setQuizConfig((prev) => ({ ...prev, subject: event.target.value }))
              }
            >
              {weakSubjects.map((subject) => (
                <option key={subject.subject} value={subject.subject}>
                  {subject.subject}
                </option>
              ))}
            </select>
            <input
              className="spa-input"
              value={quizConfig.topic}
              onChange={(event) =>
                setQuizConfig((prev) => ({ ...prev, topic: event.target.value }))
              }
              placeholder="Topic"
            />
            <select
              className="spa-input"
              value={quizConfig.difficulty}
              onChange={(event) =>
                setQuizConfig((prev) => ({ ...prev, difficulty: event.target.value }))
              }
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <button className="spa-button" type="button" onClick={generateQuiz} disabled={loading}>
              {loading ? "Generating..." : "Generate Quiz"}
            </button>
          </div>
        )}
      </section>

      {error ? <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {quiz ? (
        <section className="spa-panel p-6">
          <form className="space-y-4" onSubmit={submitQuiz}>
            {quiz.questions.map((question, index) => (
              <fieldset key={`question-${index}`} className="rounded-lg border border-stone-200 p-3">
                <legend className="font-semibold">Q{index + 1}. {question.question}</legend>
                <div className="mt-2 space-y-1 text-sm">
                  {question.options.map((option) => (
                    <label key={`${index}-${option}`} className="block">
                      <input
                        type="radio"
                        className="mr-2"
                        name={`q-${index}`}
                        checked={answers[index] === option}
                        onChange={() =>
                          setAnswers((prev) =>
                            prev.map((answer, i) => (i === index ? option : answer))
                          )
                        }
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}

            <button className="spa-button" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Quiz"}
            </button>
          </form>

          {result ? (
            <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
              Score: {result.score}/{result.total} ({result.percentage}%)
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
