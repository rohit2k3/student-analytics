"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../../components/auth-context";
import { apiRequest } from "../../../../../lib/api";
import { UserPlus, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const DEPARTMENTS = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "Electrical", "Mathematics", "Physics", "Chemistry", "Commerce", "Arts", "Other"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Postgraduate"];

export default function AddStudentPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    department: "", year: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest("/teacher/students", {
        method: "POST",
        token,
        body: {
          name: form.name,
          email: form.email,
          password: form.password,
          profile: { department: form.department, year: form.year },
        },
      });
      setSuccess("Student account created successfully!");
      setTimeout(() => router.push("/teacher/students"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/teacher/students" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create a student account they can use to log in</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-8">
        {error && (
          <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100 mb-6">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-100 mb-6">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            {success}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g. Rohit Sharma"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="student@college.edu"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Password */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-400">Share this with the student so they can log in</p>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
              <select
                value={form.department}
                onChange={(e) => handleChange("department", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Year</label>
              <select
                value={form.year}
                onChange={(e) => handleChange("year", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="">Select year</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <UserPlus className="h-4 w-4" />
              {submitting ? "Creating..." : "Create Student Account"}
            </button>
            <Link href="/teacher/students" className="text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
