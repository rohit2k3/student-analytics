const QuizAttempt = require("../models/QuizAttempt");
const AssignedQuiz = require("../models/AssignedQuiz");
const { generateQuiz } = require("../services/gemini.service");

async function generateQuizForWeakSubject(req, res) {
  const { subject, topic, difficulty = "medium", level = "intermediate" } = req.body;

  if (!subject || !topic) {
    return res.status(400).json({ message: "Subject and topic are required" });
  }

  const questions = await generateQuiz({
    subject,
    topic,
    difficulty,
    level,
  });

  return res.json({
    subject,
    topic,
    difficulty,
    questions,
  });
}

async function submitQuiz(req, res) {
  const { subject, topic, difficulty = "medium", questions, userAnswers } = req.body;

  if (!subject || !topic || !Array.isArray(questions) || !Array.isArray(userAnswers)) {
    return res.status(400).json({ message: "Invalid quiz payload" });
  }

  let correct = 0;
  questions.forEach((question, index) => {
    if ((userAnswers[index] || "").trim() === (question.answer || "").trim()) {
      correct += 1;
    }
  });

  const total = questions.length || 1;
  const percentage = Math.round((correct / total) * 100);

  const attempt = await QuizAttempt.create({
    userId: req.user.id,
    subject,
    topic,
    difficulty,
    questions,
    userAnswers,
    score: correct,
    total,
    percentage,
  });

  return res.status(201).json({
    attemptId: attempt._id,
    score: correct,
    total,
    percentage,
  });
}

async function listAssignedQuizzes(req, res) {
  const now = new Date();
  await AssignedQuiz.updateMany(
    { studentId: req.user.id, status: "pending", dueAt: { $lt: now } },
    { $set: { status: "missed" } }
  );
  const quizzes = await AssignedQuiz.find({ studentId: req.user.id })
    .sort({ createdAt: -1 })
    .lean();
  return res.json({ quizzes });
}

async function submitAssignedQuiz(req, res) {
  const { userAnswers } = req.body;

  if (!Array.isArray(userAnswers)) {
    return res.status(400).json({ message: "userAnswers must be an array" });
  }

  const quiz = await AssignedQuiz.findOne({ _id: req.params.quizId, studentId: req.user.id });
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });
  if (quiz.status === "submitted") return res.status(400).json({ message: "Quiz already submitted" });
  if (quiz.status === "missed") return res.status(400).json({ message: "Quiz deadline has passed" });
  if (quiz.dueAt && quiz.dueAt.getTime() < Date.now()) {
    quiz.status = "missed";
    await quiz.save();
    return res.status(400).json({ message: "Quiz deadline has passed" });
  }

  let correct = 0;
  quiz.questions.forEach((q, i) => {
    if ((userAnswers[i] || "").trim() === (q.answer || "").trim()) correct += 1;
  });

  const total = quiz.questions.length || 1;
  const percentage = Math.round((correct / total) * 100);

  quiz.userAnswers = userAnswers;
  quiz.score = correct;
  quiz.total = total;
  quiz.percentage = percentage;
  quiz.status = "submitted";
  await quiz.save();

  return res.json({ score: correct, total, percentage });
}

module.exports = {
  generateQuizForWeakSubject,
  submitQuiz,
  listAssignedQuizzes,
  submitAssignedQuiz,
};

