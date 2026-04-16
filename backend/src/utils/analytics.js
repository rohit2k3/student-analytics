function round(value, precision = 2) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function inferSubjectCategory(subjectName) {
  const normalized = subjectName.toLowerCase();

  if (/(lab|practical|project|workshop)/.test(normalized)) {
    return "practical";
  }

  if (/(dsa|data structure|algorithm|math|programming|coding)/.test(normalized)) {
    return "problem-solving";
  }

  if (/(dbms|os|network|theory|history|economics|management)/.test(normalized)) {
    return "theory";
  }

  return "other";
}

function summarizeSubjects(semesterResults) {
  const aggregate = new Map();

  semesterResults.forEach((semester) => {
    semester.subjects.forEach((subject) => {
      const key = subject.name.trim().toLowerCase();
      const current = aggregate.get(key) || {
        name: subject.name,
        totalScore: 0,
        count: 0,
        category: subject.category || inferSubjectCategory(subject.name),
      };

      current.totalScore += subject.score;
      current.count += 1;
      aggregate.set(key, current);
    });
  });

  return Array.from(aggregate.values())
    .map((item) => ({
      subject: item.name,
      category: item.category,
      averageScore: round(item.totalScore / item.count),
    }))
    .sort((a, b) => b.averageScore - a.averageScore);
}

function buildTrend(semesterResults) {
  return semesterResults
    .map((semester) => {
      const subjectAverage =
        semester.subjects.reduce((sum, s) => sum + s.score, 0) / semester.subjects.length;

      return {
        semesterId: semester._id.toString(),
        semesterLabel: semester.semesterLabel,
        percentage: round(
          typeof semester.percentage === "number" ? semester.percentage : subjectAverage
        ),
        gpa: typeof semester.gpa === "number" ? round(semester.gpa) : null,
        createdAt: semester.createdAt,
      };
    })
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

function analyzePerformance(semesterResults) {
  if (!Array.isArray(semesterResults) || semesterResults.length === 0) {
    return {
      subjectBreakdown: [],
      strongSubjects: [],
      weakSubjects: [],
      trend: [],
      overallPercentage: 0,
      overallGpa: null,
      patternInsights: ["Add semester results to unlock analytics."],
    };
  }

  const subjectBreakdown = summarizeSubjects(semesterResults);
  const weakSubjects = subjectBreakdown.filter((s) => s.averageScore < 60);
  const strongSubjects = subjectBreakdown.filter((s) => s.averageScore >= 75);

  const trend = buildTrend(semesterResults);
  const overallPercentage =
    trend.reduce((sum, row) => sum + row.percentage, 0) / trend.length;

  const gpaValues = trend.filter((row) => typeof row.gpa === "number").map((row) => row.gpa);
  const overallGpa = gpaValues.length
    ? round(gpaValues.reduce((sum, gpa) => sum + gpa, 0) / gpaValues.length)
    : null;

  const categoryBuckets = subjectBreakdown.reduce(
    (acc, subject) => {
      if (subject.category in acc) {
        acc[subject.category].push(subject.averageScore);
      }
      return acc;
    },
    {
      theory: [],
      practical: [],
      "problem-solving": [],
      other: [],
    }
  );

  const insights = [];
  if (categoryBuckets["problem-solving"].length) {
    const avg =
      categoryBuckets["problem-solving"].reduce((sum, value) => sum + value, 0) /
      categoryBuckets["problem-solving"].length;
    if (avg < 60) {
      insights.push("Consistently weak in problem-solving subjects.");
    }
  }

  if (categoryBuckets.theory.length && categoryBuckets.practical.length) {
    const theoryAvg =
      categoryBuckets.theory.reduce((sum, value) => sum + value, 0) /
      categoryBuckets.theory.length;
    const practicalAvg =
      categoryBuckets.practical.reduce((sum, value) => sum + value, 0) /
      categoryBuckets.practical.length;

    if (theoryAvg - practicalAvg >= 10) {
      insights.push("Theory performance is stronger than practical execution.");
    }

    if (practicalAvg - theoryAvg >= 10) {
      insights.push("Practical performance is stronger than theory retention.");
    }
  }

  if (trend.length > 1) {
    const first = trend[0].percentage;
    const latest = trend[trend.length - 1].percentage;
    if (latest > first + 3) {
      insights.push("Overall trend is improving across semesters.");
    } else if (latest < first - 3) {
      insights.push("Overall trend is declining; intervention is needed.");
    } else {
      insights.push("Overall trend is stable; focus on weak areas for growth.");
    }
  }

  if (!insights.length) {
    insights.push("Performance is balanced; keep refining weak topics.");
  }

  return {
    subjectBreakdown,
    strongSubjects,
    weakSubjects,
    trend,
    overallPercentage: round(overallPercentage),
    overallGpa,
    patternInsights: insights,
  };
}

module.exports = {
  analyzePerformance,
  inferSubjectCategory,
};
