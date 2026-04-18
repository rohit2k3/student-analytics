"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../../../../components/auth-context";
import { apiRequest } from "../../../../../../../lib/api";
import { ArrowLeft, PlusCircle, Trash2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const CATEGORIES = ["theory", "practical", "problem-solving", "other"];
const ALL_SEMESTER_LABELS = [
  "Semester 1", "Semester 2", "Semester 3", "Semester 4",
  "Semester 5", "Semester 6", "Semester 7", "Semester 8",
];
const emptySubject = () => ({ name: "", score: "", credits: "", category: "theory" });

export default function AddSemesterPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const router = useRouter();

  const [label, setLabel] = useState("");
  const [gpa, setGpa] = useState("");
  const [percentage, setPercentage] = useState("");
  const [subjects, setSubjects] = useState([emptySubject()]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [usedLabels, setUsedLabels] = useState([]);
  const [loadingLabels, setLoadingLabels] = useState(true);

  // Fetch existing semesters to know which labels are already used
  useEffect(() => {
    if (!token || !id) return;
    apiRequest(`/teacher/students/${id}`, { token })
      .then((res) => {
        const used = (res.results || []).map((r) => r.semesterLabel);
        setUsedLabels(used);
      })
      .catch(() => {})
      .finally(() => setLoadingLabels(false));
  }, [token, id]);

  const availableLabels = ALL_SEMESTER_LABELS.filter((l) => !usedLabels.includes(l));
  const reachedMax = usedLabels.length >= 8;

  function addSubject() {
    setSubjects((prev) => [...prev, emptySubject()]);
  }

  function removeSubject(i) {
    setSubjects((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateSubject(i, field, value) {
    setSubjects((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (reachedMax) {
      setError("Maximum of 8 semesters allowed per student.");
      return;
    }

    if (!label) {
      setError("Please select a semester.");
      return;
    }

    const validSubjects = subjects.filter((s) => s.name.trim());
    if (validSubjects.length === 0) {
      setError("At least one subject with a name is required.");
      return;
    }
    for (const s of validSubjects) {
      const score = Number(s.score);
      if (isNaN(score) || score < 0 || score > 100) {
        setError(`Score for "${s.name}" must be between 0 and 100`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await apiRequest(`/teacher/students/${id}/semesters`, {
        method: "POST",
        token,
        body: {
          semesterLabel: label,
          subjects: validSubjects.map((s) => ({
            name: s.name,
            score: Number(s.score),
            credits: Number(s.credits) || 0,
            category: s.category,
          })),
          gpa: gpa !== "" ? Number(gpa) : undefined,
          percentage: percentage !== "" ? Number(percentage) : undefined,
        },
      });
      setSuccess("Semester added successfully!");
      setTimeout(() => router.push(`/teacher/students/${id}`), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingLabels) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="h-7 w-7 animate-spin" />
          <p className="text-sm">Loading semester info...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/teacher/students/${id}`} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Semester</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {usedLabels.length}/8 semesters used
          </p>
        </div>
      </div>

      {reachedMax ? (
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-6 text-center space-y-2">
          <p className="font-semibold text-amber-800">Maximum semesters reached</p>
          <p className="text-sm text-amber-600">This student already has 8 semesters recorded. You cannot add more.</p>
          <Link
            href={`/teacher/students/${id}`}
            className="inline-block mt-2 text-sm font-medium text-amber-700 underline"
          >
            ← Back to student
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
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

          {/* Semester Details */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 text-base">Semester Details</h2>
              <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                {8 - usedLabels.length} slots remaining
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="" disabled>Select semester...</option>
                  {availableLabels.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  GPA <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  placeholder="0.00 – 10.00"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Percentage <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  placeholder="0 – 100"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 text-base">Subjects <span className="text-red-500">*</span></h2>
              <button
                type="button"
                onClick={addSubject}
                className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <PlusCircle className="h-4 w-4" /> Add Subject
              </button>
            </div>

            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
              <div className="col-span-4">Subject Name</div>
              <div className="col-span-2">Score</div>
              <div className="col-span-2">Credits</div>
              <div className="col-span-3">Category</div>
              <div className="col-span-1"></div>
            </div>

            <div className="space-y-3">
              {subjects.map((s, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => updateSubject(i, "name", e.target.value)}
                      placeholder="e.g. Mathematics"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={s.score}
                      onChange={(e) => updateSubject(i, "score", e.target.value)}
                      placeholder="0-100"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      value={s.credits}
                      onChange={(e) => updateSubject(i, "credits", e.target.value)}
                      placeholder="e.g. 4"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <select
                      value={s.category}
                      onChange={(e) => updateSubject(i, "category", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white capitalize"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {subjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubject(i)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-black text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 shadow-sm"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {submitting ? "Saving..." : "Save Semester"}
            </button>
            <Link href={`/teacher/students/${id}`} className="text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
