const express = require("express");
const authMiddleware = require("../middleware/auth");
const { generateQuizForWeakSubject, submitQuiz, listAssignedQuizzes, submitAssignedQuiz } = require("../controllers/quiz.controller");

const router = express.Router();

router.use(authMiddleware);
router.post("/generate", generateQuizForWeakSubject);
router.post("/submit", submitQuiz);

// Teacher-assigned quiz routes (student side)
router.get("/assigned", listAssignedQuizzes);
router.post("/assigned/:quizId/submit", submitAssignedQuiz);

module.exports = router;

