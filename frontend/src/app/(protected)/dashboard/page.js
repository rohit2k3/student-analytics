"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../../../components/auth-context";
import { apiRequest } from "../../../lib/api";
import { FileStack, Activity, GraduationCap, TrendingUp, BookOpen, AlertCircle, BrainCircuit } from "lucide-react";

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resultsCount, setResultsCount] = useState(0);
  const [analytics, setAnalytics] = useState({
    subjectBreakdown: [],
    strongSubjects: [],
    weakSubjects: [],
    trend: [],
    overallPercentage: 0,
    overallGpa: null,
    patternInsights: [],
  });
  const [improvement, setImprovement] = useState({
    improvementPercentage: 0,
    baselineWeakScore: 0,
    quizWeakScore: 0,
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [resultsData, analyticsData, improvementData] = await Promise.all([
          apiRequest("/results", { token }),
          apiRequest("/analytics", { token }),
          apiRequest("/improvement", { token }),
        ]);
        setResultsCount(resultsData.results.length);
        setAnalytics(analyticsData);
        setImprovement(improvementData);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadData();
    }
  }, [token]);

  const pieData = [
    { name: "Strong Subjects", value: analytics.strongSubjects.length },
    { name: "Weak Subjects", value: analytics.weakSubjects.length },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-indigo-600">
          <Activity className="h-8 w-8 animate-spin" />
          <p className="text-sm font-medium">Crunching the numbers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Greeting Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-indigo-600 px-6 py-8 shadow-sm">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white">Always striving for better, {user?.name?.split(' ')[0] || "Student"}!</h2>
          <p className="mt-2 max-w-2xl text-indigo-100">
            Here's an overview of your academic performance across all tracked semesters. Use the insights below to focus your study time effectively.
          </p>
        </div>
        {/* Background decorative elements */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-500 opacity-50 blur-3xl"></div>
        <div className="absolute right-32 bottom-0 -mb-16 h-48 w-48 rounded-full bg-purple-500 opacity-30 blur-2xl"></div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Total Semesters</p>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <FileStack className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900">{resultsCount}</p>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Overall Accuracy</p>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900">{analytics.overallPercentage}%</p>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Overall GPA</p>
            <div className="p-2 bg-purple-50 rounded-lg">
              <GraduationCap className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900">{analytics.overallGpa ?? "N/A"}</p>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Quiz Improvement</p>
            <div className={`p-2 rounded-lg ${improvement.improvementPercentage >= 0 ? "bg-green-50" : "bg-red-50"}`}>
              <TrendingUp className={`h-5 w-5 ${improvement.improvementPercentage >= 0 ? "text-green-600" : "text-red-500"}`} />
            </div>
          </div>
          <p className={`mt-4 text-3xl font-bold ${improvement.improvementPercentage >= 0 ? "text-green-600" : "text-red-500"}`}>
            {improvement.improvementPercentage >= 0 ? "+" : ""}
            {improvement.improvementPercentage}%
          </p>
        </div>
      </div>

      {/* Main Charts Section */}
      <section className="grid gap-6 xl:grid-cols-3">
        {/* Subject Breakdown Bar Chart */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm xl:col-span-2 flex flex-col">
          <div className="border-b border-gray-50 px-6 py-4">
            <h3 className="font-semibold text-gray-900">Average Subject Scores</h3>
          </div>
          <div className="h-[350px] p-4 text-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.subjectBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="averageScore" name="Avg Score" radius={[4, 4, 0, 0]} barSize={40}>
                  {analytics.subjectBreakdown.map((entry) => (
                    <Cell
                      key={`bar-${entry.subject}`}
                      fill={entry.averageScore < 60 ? "#ef4444" : "#4f46e5"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strength Distribution Pie Chart */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col">
          <div className="border-b border-gray-50 px-6 py-4">
            <h3 className="font-semibold text-gray-900">Subject Mastery</h3>
          </div>
          <div className="h-[350px] p-4 text-sm flex items-center justify-center">
            {analytics.strongSubjects.length === 0 && analytics.weakSubjects.length === 0 ? (
               <div className="text-gray-400 flex flex-col items-center gap-2">
                 <BookOpen className="h-8 w-8" />
                 <p>Not enough data yet</p>
               </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={pieData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    stroke="none"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f43f5e" />
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Performance Trend Line Chart */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm xl:col-span-3 flex flex-col">
          <div className="border-b border-gray-50 px-6 py-4">
            <h3 className="font-semibold text-gray-900">Performance Track Over Time</h3>
          </div>
          <div className="h-[300px] p-4 text-sm">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="semesterLabel" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="percentage" 
                  name="Percentage"
                  stroke="#8b5cf6" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#8b5cf6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Pattern Insights List */}
      <section className="rounded-xl border border-gray-100 bg-white shadow-sm p-6 line-clamp-none">
        <div className="flex items-center gap-2 mb-4">
          <BrainCircuit className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">AI Pattern Insights</h3>
        </div>
        {analytics.patternInsights.length === 0 ? (
          <p className="text-gray-500 text-sm">Add more semester results to generate AI insights.</p>
        ) : (
          <ul className="space-y-3">
            {analytics.patternInsights.map((insight, index) => (
              <li key={`insight-${index}`} className="flex gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <span className="text-indigo-500 font-bold shrink-0">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
