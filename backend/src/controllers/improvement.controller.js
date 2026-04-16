const QuizAttempt = require("../models/QuizAttempt");
const SemesterResult = require("../models/SemesterResult");
const { analyzePerformance } = require("../utils/analytics");

function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

async function getImprovement(req, res) {
  const [results, attempts] = await Promise.all([
    SemesterResult.find({ userId: req.user.id }).sort({ createdAt: 1 }).lean(),
    QuizAttempt.find({ userId: req.user.id }).sort({ createdAt: 1 }).lean(),
  ]);

  const analytics = analyzePerformance(results);
  const weakSubjects = analytics.weakSubjects.map((subject) => subject.subject.toLowerCase());

  const weakAttempts = attempts.filter((attempt) =>
    weakSubjects.includes(attempt.subject.toLowerCase())
  );

  const avgWeakSubjectScore = average(analytics.weakSubjects.map((s) => s.averageScore));
  const avgWeakQuizScore = average(weakAttempts.map((attempt) => attempt.percentage));

  const improvementPercentage = avgWeakSubjectScore
    ? Math.round(avgWeakQuizScore - avgWeakSubjectScore)
    : 0;

  const subjectProgress = analytics.weakSubjects.map((subject) => {
    const related = attempts.filter(
      (attempt) => attempt.subject.toLowerCase() === subject.subject.toLowerCase()
    );

    return {
      subject: subject.subject,
      baseline: subject.averageScore,
      quizAverage: related.length ? Math.round(average(related.map((a) => a.percentage))) : 0,
      attempts: related.length,
    };
  });

  return res.json({
    baselineWeakScore: Math.round(avgWeakSubjectScore),
    quizWeakScore: Math.round(avgWeakQuizScore),
    improvementPercentage,
    subjectProgress,
  });
}

module.exports = {
  getImprovement,
};
