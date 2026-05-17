export function getPerformanceTag(percentage) {
  if (percentage == null || Number.isNaN(Number(percentage))) {
    return { label: "Not Rated", tone: "muted" };
  }

  const value = Number(percentage);
  if (value >= 80) {
    return { label: "Outstanding", tone: "emerald" };
  }
  if (value >= 60) {
    return { label: "Above Average", tone: "blue" };
  }
  if (value >= 40) {
    return { label: "Average", tone: "amber" };
  }
  return { label: "Below Average", tone: "rose" };
}

export function getPerformanceTagClasses(tone) {
  switch (tone) {
    case "emerald":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "blue":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "amber":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "rose":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}
