const SemesterResult = require("../models/SemesterResult");
const { analyzePerformance } = require("../utils/analytics");
const { generateRecommendations } = require("../services/gemini.service");

async function getRecommendations(req, res) {
  const semesterResults = await SemesterResult.find({ userId: req.user.id })
    .sort({ createdAt: 1 })
    .lean();

  const analytics = analyzePerformance(semesterResults);
  const recommendations = await generateRecommendations(analytics);

  return res.json({
    recommendations,
    weakSubjects: analytics.weakSubjects,
    patternInsights: analytics.patternInsights,
  });
}

module.exports = {
  getRecommendations,
};
