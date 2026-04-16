"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../components/auth-context";
import { apiRequest } from "../../../lib/api";

function toFormData(user) {
  return {
    name: user?.name || "",
    email: user?.email || "",
    profile: {
      department: user?.profile?.department || "",
      year: user?.profile?.year || "",
      targetGpa: user?.profile?.targetGpa ?? "",
      weeklyStudyHours: user?.profile?.weeklyStudyHours ?? "",
      learningGoal: user?.profile?.learningGoal || "",
    },
  };
}

export default function ProfilePage() {
  const { token, user, updateUser } = useAuth();
  const [form, setForm] = useState(() => toFormData(user));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(toFormData(user));
  }, [user]);

  const refreshProfile = useCallback(async () => {
    const data = await apiRequest("/auth/me", { token });
    updateUser(data.user);
  }, [token, updateUser]);

  useEffect(() => {
    if (token) {
      refreshProfile().catch(() => {});
    }
  }, [token, refreshProfile]);

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const data = await apiRequest("/auth/me", {
        method: "PUT",
        token,
        body: {
          name: form.name,
          profile: {
            ...form.profile,
            targetGpa: form.profile.targetGpa === "" ? "" : Number(form.profile.targetGpa),
            weeklyStudyHours:
              form.profile.weeklyStudyHours === ""
                ? ""
                : Number(form.profile.weeklyStudyHours),
          },
        },
      });

      updateUser(data.user);
      setMessage("Profile updated successfully.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="spa-panel p-6">
      <h3 className="spa-title text-lg font-bold text-amber-900">Profile</h3>
      <p className="mt-1 text-sm text-stone-600">Maintain your academic profile and goals.</p>

      <form className="mt-4 space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <label>
            <span className="mb-1 block text-sm font-semibold">Name</span>
            <input
              className="spa-input"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold">Email</span>
            <input className="spa-input" disabled value={form.email} />
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold">Department</span>
            <input
              className="spa-input"
              value={form.profile.department}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  profile: { ...prev.profile, department: event.target.value },
                }))
              }
            />
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold">Year / Semester</span>
            <input
              className="spa-input"
              value={form.profile.year}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, profile: { ...prev.profile, year: event.target.value } }))
              }
            />
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold">Target GPA</span>
            <input
              className="spa-input"
              type="number"
              min={0}
              max={10}
              step="0.01"
              value={form.profile.targetGpa}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  profile: { ...prev.profile, targetGpa: event.target.value },
                }))
              }
            />
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold">Weekly Study Hours</span>
            <input
              className="spa-input"
              type="number"
              min={0}
              value={form.profile.weeklyStudyHours}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  profile: { ...prev.profile, weeklyStudyHours: event.target.value },
                }))
              }
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Learning Goal</span>
          <textarea
            className="spa-input min-h-24"
            value={form.profile.learningGoal}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                profile: { ...prev.profile, learningGoal: event.target.value },
              }))
            }
          />
        </label>

        <button className="spa-button" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </button>

        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </form>
    </section>
  );
}
