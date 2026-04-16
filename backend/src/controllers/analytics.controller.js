const SemesterResult = require("../models/SemesterResult");
const { analyzePerformance } = require("../utils/analytics");

async function getAnalytics(req, res) {
  const semesterResults = await SemesterResult.find({ userId: req.user.id })
    .sort({ createdAt: 1 })
    .lean();

  const analytics = analyzePerformance(semesterResults);

  return res.json(analytics);
}

module.exports = {
  getAnalytics,
};
