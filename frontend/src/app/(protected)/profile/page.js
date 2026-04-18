"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../components/auth-context";
import { apiRequest } from "../../../lib/api";
import { Loader2, User, Save, CheckCircle2, AlertCircle } from "lucide-react";

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

  const inputClass = "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus-ring bg-white transition-colors disabled:bg-gray-50 disabled:text-gray-500";
  const labelClass = "block text-sm font-semibold text-gray-900 mb-1.5";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-5 flex items-center gap-3">
          <div className="p-2 bg-white rounded-md border border-gray-200 shadow-sm">
            <User className="h-5 w-5 text-black" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-black tracking-tight">Account Profile</h3>
            <p className="text-sm text-gray-500">Manage your personal information and academic goals.</p>
          </div>
        </div>

        <form className="p-6 space-y-6" onSubmit={onSubmit}>
          
          {message && (
             <div className="rounded-md bg-emerald-50 p-4 border border-emerald-100 flex items-start gap-3">
               <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
               <div className="text-sm text-emerald-800 font-medium">{message}</div>
             </div>
          )}
          
          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-100 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800 font-medium">{error}</div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <label>
              <span className={labelClass}>Full Name</span>
              <input
                className={inputClass}
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="John Doe"
              />
            </label>
            <label>
              <span className={labelClass}>Email Address</span>
              <input className={inputClass} disabled value={form.email} />
            </label>
            
            <div className="col-span-2 pt-4 pb-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400">Academic Details</h4>
              <hr className="mt-2 border-gray-100" />
            </div>

            <label>
              <span className={labelClass}>Department / Major</span>
              <input
                className={inputClass}
                value={form.profile.department}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    profile: { ...prev.profile, department: event.target.value },
                  }))
                }
                placeholder="e.g. Computer Science"
              />
            </label>
            <label>
              <span className={labelClass}>Year / Semester</span>
              <input
                className={inputClass}
                value={form.profile.year}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, profile: { ...prev.profile, year: event.target.value } }))
                }
                placeholder="e.g. Senior"
              />
            </label>
            <label>
              <span className={labelClass}>Target GPA Goal</span>
              <input
                className={inputClass}
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
                placeholder="e.g. 3.8"
              />
            </label>
            <label>
              <span className={labelClass}>Target Weekly Study Hours</span>
              <input
                className={inputClass}
                type="number"
                min={0}
                value={form.profile.weeklyStudyHours}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    profile: { ...prev.profile, weeklyStudyHours: event.target.value },
                  }))
                }
                placeholder="e.g. 15"
              />
            </label>
          </div>

          <label className="block">
            <span className={labelClass}>Primary Learning Goal</span>
            <textarea
              className={`${inputClass} min-h-[120px] resize-y`}
              value={form.profile.learningGoal}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  profile: { ...prev.profile, learningGoal: event.target.value },
                }))
              }
              placeholder="What are you trying to accomplish this year?"
            />
          </label>

          <div className="pt-4 flex justify-end">
            <button 
              className="inline-flex items-center gap-2 bg-black text-white text-sm font-semibold px-6 py-2.5 rounded-md hover:bg-gray-900 disabled:opacity-50 transition-colors focus-ring" 
              type="submit" 
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {loading ? "Saving Profile..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
