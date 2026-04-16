const express = require("express");
const authMiddleware = require("../middleware/auth");
const { generateQuizForWeakSubject, submitQuiz } = require("../controllers/quiz.controller");

const router = express.Router();

router.use(authMiddleware);
router.post("/generate", generateQuizForWeakSubject);
router.post("/submit", submitQuiz);

module.exports = router;
