const QuizAttempt = require("../models/QuizAttempt");
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

module.exports = {
  generateQuizForWeakSubject,
  submitQuiz,
};
