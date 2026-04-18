"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../components/auth-context";
import { apiRequest } from "../../../lib/api";
import { User, Lock } from "lucide-react";

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || <span className="text-gray-400 italic">Not set</span>}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { token, user, isStudent, updateUser } = useAuth();

  // Always refresh latest profile from server
  const refreshProfile = useCallback(async () => {
    try {
      const data = await apiRequest("/auth/me", { token });
      updateUser(data.user);
    } catch (_) {}
  }, [token, updateUser]);

  useEffect(() => {
    if (token) refreshProfile();
  }, [token, refreshProfile]);

  const p = user?.profile || {};

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-md border border-gray-200 shadow-sm">
              <User className="h-5 w-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black tracking-tight">Account Profile</h3>
              <p className="text-sm text-gray-500">Your personal information and academic details.</p>
            </div>
          </div>
          {isStudent && (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full">
              <Lock className="h-3.5 w-3.5" />
              Managed by teacher
            </div>
          )}
        </div>

        {/* Read-only display */}
        <div className="p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Full Name" value={user?.name} />
            <Field label="Email Address" value={user?.email} />

            <div className="col-span-2 pt-4 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Academic Details</h4>
              <hr className="mt-2 border-gray-100" />
            </div>

            <Field label="Department / Major" value={p.department} />
            <Field label="Year / Semester" value={p.year} />
            <Field label="Target GPA" value={p.targetGpa !== undefined && p.targetGpa !== "" ? String(p.targetGpa) : null} />
            <Field label="Weekly Study Hours" value={p.weeklyStudyHours !== undefined && p.weeklyStudyHours !== "" ? `${p.weeklyStudyHours} hrs/week` : null} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Learning Goal</p>
            <p className="text-sm font-medium text-gray-900 leading-relaxed">
              {p.learningGoal || <span className="text-gray-400 italic">Not set</span>}
            </p>
          </div>

          {isStudent && (
            <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg p-4">
              Your profile is managed by your teacher. To update any information, please contact them directly.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
