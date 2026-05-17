const express = require("express");
const authMiddleware = require("../middleware/auth");
const { requireTeacher } = require("../middleware/requireRole");
const {
  createStudent,
  listStudents,
  getStudent,
  updateStudent,
  addSemesterForStudent,
  updateSemesterForStudent,
  deleteSemesterForStudent,
  assignQuiz,
  assignQuizBulk,
  listQuizzesForStudent,
  listAllAssignedQuizzes,
  updateAssignedQuiz,
  deleteAssignedQuiz,
} = require("../controllers/teacher.controller");

const router = express.Router();

// All teacher routes require auth + teacher role
router.use(authMiddleware, requireTeacher);

// Students
router.get("/students", listStudents);
router.post("/students", createStudent);
router.get("/students/:id", getStudent);
router.put("/students/:id", updateStudent);

// Semesters for a specific student
router.post("/students/:id/semesters", addSemesterForStudent);
router.put("/semesters/:semesterId", updateSemesterForStudent);
router.delete("/semesters/:semesterId", deleteSemesterForStudent);

// Quizzes for a specific student
router.post("/students/:id/quiz", assignQuiz);
router.get("/students/:id/quizzes", listQuizzesForStudent);
router.get("/quizzes", listAllAssignedQuizzes);
router.post("/quizzes/assign", assignQuizBulk);
router.put("/quizzes/:quizId", updateAssignedQuiz);
router.delete("/quizzes/:quizId", deleteAssignedQuiz);

module.exports = router;
