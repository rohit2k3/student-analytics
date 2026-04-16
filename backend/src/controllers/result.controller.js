const SemesterResult = require("../models/SemesterResult");
const { inferSubjectCategory } = require("../utils/analytics");

function normalizeSubjects(subjects) {
  return subjects
    .filter((subject) => subject?.name)
    .map((subject) => ({
      name: subject.name.trim(),
      score: Number(subject.score),
      credits: Number(subject.credits || 0),
      category: subject.category || inferSubjectCategory(subject.name),
    }));
}

async function createResult(req, res) {
  const { semesterLabel, subjects, gpa, percentage } = req.body;

  if (!semesterLabel || !Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({ message: "Semester label and subjects are required" });
  }

  const normalizedSubjects = normalizeSubjects(subjects);

  if (normalizedSubjects.some((s) => Number.isNaN(s.score) || s.score < 0 || s.score > 100)) {
    return res.status(400).json({ message: "Each subject score must be between 0 and 100" });
  }

  const created = await SemesterResult.create({
    userId: req.user.id,
    semesterLabel,
    subjects: normalizedSubjects,
    gpa: typeof gpa === "number" ? gpa : undefined,
    percentage: typeof percentage === "number" ? percentage : undefined,
  });

  return res.status(201).json(created);
}

async function listResults(req, res) {
  const items = await SemesterResult.find({ userId: req.user.id }).sort({ createdAt: 1 }).lean();
  return res.json({ results: items });
}

async function getResultById(req, res) {
  const item = await SemesterResult.findOne({
    _id: req.params.id,
    userId: req.user.id,
  }).lean();

  if (!item) {
    return res.status(404).json({ message: "Semester result not found" });
  }

  return res.json(item);
}

async function updateResult(req, res) {
  const { semesterLabel, subjects, gpa, percentage } = req.body;

  if (!semesterLabel || !Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({ message: "Semester label and subjects are required" });
  }

  const normalizedSubjects = normalizeSubjects(subjects);
  if (normalizedSubjects.some((s) => Number.isNaN(s.score) || s.score < 0 || s.score > 100)) {
    return res.status(400).json({ message: "Each subject score must be between 0 and 100" });
  }

  const updated = await SemesterResult.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    {
      semesterLabel,
      subjects: normalizedSubjects,
      gpa: typeof gpa === "number" ? gpa : undefined,
      percentage: typeof percentage === "number" ? percentage : undefined,
    },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) {
    return res.status(404).json({ message: "Semester result not found" });
  }

  return res.json(updated);
}

module.exports = {
  createResult,
  listResults,
  getResultById,
  updateResult,
};
