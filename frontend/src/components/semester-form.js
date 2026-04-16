"use client";

import { useMemo, useState } from "react";

const BLANK_SUBJECT = { name: "", score: "", credits: "", category: "theory" };

function toFormState(initialData) {
  if (!initialData) {
    return {
      semesterLabel: "",
      gpa: "",
      percentage: "",
      subjects: [BLANK_SUBJECT],
    };
  }

  return {
    semesterLabel: initialData.semesterLabel || "",
    gpa: typeof initialData.gpa === "number" ? String(initialData.gpa) : "",
    percentage:
      typeof initialData.percentage === "number" ? String(initialData.percentage) : "",
    subjects:
      initialData.subjects?.length > 0
        ? initialData.subjects.map((subject) => ({
            name: subject.name || "",
            score: String(subject.score ?? ""),
            credits: String(subject.credits ?? ""),
            category: subject.category || "theory",
          }))
        : [BLANK_SUBJECT],
  };
}

export default function SemesterForm({ initialData, onSubmit, submitLabel }) {
  const [form, setForm] = useState(() => toFormState(initialData));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(
    () => form.semesterLabel.trim() && form.subjects.some((subject) => subject.name.trim()),
    [form]
  );

  function updateSubject(index, key, value) {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.map((subject, i) =>
        i === index ? { ...subject, [key]: value } : subject
      ),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        semesterLabel: form.semesterLabel,
        gpa: form.gpa ? Number(form.gpa) : undefined,
        percentage: form.percentage ? Number(form.percentage) : undefined,
        subjects: form.subjects
          .filter((subject) => subject.name.trim())
          .map((subject) => ({
            name: subject.name,
            score: Number(subject.score),
            credits: subject.credits ? Number(subject.credits) : 0,
            category: subject.category,
          })),
      };

      await onSubmit(payload);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="spa-panel p-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 md:grid-cols-3">
          <label>
            <span className="mb-1 block text-sm font-semibold">Semester Label</span>
            <input
              className="spa-input"
              required
              value={form.semesterLabel}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, semesterLabel: event.target.value }))
              }
            />
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold">GPA (optional)</span>
            <input
              className="spa-input"
              type="number"
              min={0}
              max={10}
              step="0.01"
              value={form.gpa}
              onChange={(event) => setForm((prev) => ({ ...prev, gpa: event.target.value }))}
            />
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold">Percentage (optional)</span>
            <input
              className="spa-input"
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={form.percentage}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, percentage: event.target.value }))
              }
            />
          </label>
        </div>

        <div className="space-y-3">
          {form.subjects.map((subject, index) => (
            <div key={`subject-${index}`} className="grid gap-2 md:grid-cols-4">
              <input
                className="spa-input"
                placeholder="Subject"
                value={subject.name}
                onChange={(event) => updateSubject(index, "name", event.target.value)}
              />
              <input
                className="spa-input"
                placeholder="Score"
                type="number"
                min={0}
                max={100}
                value={subject.score}
                onChange={(event) => updateSubject(index, "score", event.target.value)}
              />
              <input
                className="spa-input"
                placeholder="Credits"
                type="number"
                min={0}
                value={subject.credits}
                onChange={(event) => updateSubject(index, "credits", event.target.value)}
              />
              <select
                className="spa-input"
                value={subject.category}
                onChange={(event) => updateSubject(index, "category", event.target.value)}
              >
                <option value="theory">Theory</option>
                <option value="practical">Practical</option>
                <option value="problem-solving">Problem-solving</option>
                <option value="other">Other</option>
              </select>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setForm((prev) => ({ ...prev, subjects: [...prev.subjects, BLANK_SUBJECT] }))
            }
            className="rounded-md border border-stone-300 px-3 py-2 text-sm font-semibold hover:bg-stone-100"
          >
            Add Subject
          </button>
          <button className="spa-button" type="submit" disabled={submitting || !canSubmit}>
            {submitting ? "Saving..." : submitLabel}
          </button>
        </div>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </form>
    </section>
  );
}
