const bcrypt = require("bcryptjs");
const User = require("../models/User");
const SemesterResult = require("../models/SemesterResult");
const AssignedQuiz = require("../models/AssignedQuiz");
const { generateQuiz } = require("../services/gemini.service");
const { inferSubjectCategory } = require("../utils/analytics");

// ─── Students ────────────────────────────────────────────────────────────────

async function createStudent(req, res) {
  const { name, email, password, profile } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must have at least 6 characters" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const student = await User.create({
    name,
    email,
    passwordHash,
    role: "student",
    createdBy: req.user.id,
    profile: profile || {},
  });

  return res.status(201).json({
    student: {
      id: student._id,
      name: student.name,
      email: student.email,
      role: student.role,
      profile: student.profile || {},
    },
  });
}

async function listStudents(req, res) {
  const students = await User.find({ role: "student", createdBy: req.user.id })
    .select("name email profile createdAt")
    .lean();

  // Attach latest GPA for each student
  const enriched = await Promise.all(
    students.map(async (s) => {
      const results = await SemesterResult.find({ userId: s._id }).lean();
      const gpas = results.map((r) => r.gpa).filter((g) => g != null);
      const avgGpa = gpas.length ? (gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(2) : null;
      const percentages = results.map((r) => r.percentage).filter((p) => p != null);
      const avgPct = percentages.length
        ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
        : null;
      return {
        id: s._id,
        name: s.name,
        email: s.email,
        department: s.profile?.department || "",
        year: s.profile?.year || "",
        semesterCount: results.length,
        avgGpa,
        avgPercentage: avgPct,
        createdAt: s.createdAt,
      };
    })
  );

  return res.json({ students: enriched });
}

async function getStudent(req, res) {
  const student = await User.findOne({
    _id: req.params.id,
    role: "student",
    createdBy: req.user.id,
  })
    .select("name email profile createdAt")
    .lean();

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  const results = await SemesterResult.find({ userId: student._id }).sort({ createdAt: 1 }).lean();
  const quizzes = await AssignedQuiz.find({ studentId: student._id, teacherId: req.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return res.json({
    student: {
      id: student._id,
      name: student.name,
      email: student.email,
      profile: student.profile || {},
    },
    results,
    quizzes,
  });
}

async function updateStudent(req, res) {
  const { name, profile } = req.body;

  const student = await User.findOne({
    _id: req.params.id,
    role: "student",
    createdBy: req.user.id,
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  if (typeof name === "string" && name.trim()) student.name = name.trim();
  if (profile && typeof profile === "object") {
    student.profile = {
      department: profile.department || student.profile?.department || "",
      year: profile.year || student.profile?.year || "",
      targetGpa: profile.targetGpa != null ? Number(profile.targetGpa) : student.profile?.targetGpa,
      weeklyStudyHours: profile.weeklyStudyHours != null ? Number(profile.weeklyStudyHours) : student.profile?.weeklyStudyHours,
      learningGoal: profile.learningGoal || student.profile?.learningGoal || "",
    };
  }

  await student.save();

  return res.json({
    student: {
      id: student._id,
      name: student.name,
      email: student.email,
      profile: student.profile || {},
    },
  });
}

// ─── Semesters ────────────────────────────────────────────────────────────────

function normalizeSubjects(subjects) {
  return subjects
    .filter((s) => s?.name)
    .map((s) => ({
      name: s.name.trim(),
      score: Number(s.score),
      credits: Number(s.credits || 0),
      category: s.category || inferSubjectCategory(s.name),
    }));
}

const VALID_SEMESTER_LABELS = [
  "Semester 1", "Semester 2", "Semester 3", "Semester 4",
  "Semester 5", "Semester 6", "Semester 7", "Semester 8",
];

async function addSemesterForStudent(req, res) {
  const { semesterLabel, subjects, gpa, percentage } = req.body;

  if (!semesterLabel || !Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({ message: "Semester label and subjects are required" });
  }

  if (!VALID_SEMESTER_LABELS.includes(semesterLabel)) {
    return res.status(400).json({ message: "Semester label must be one of: Semester 1 through Semester 8" });
  }

  // Verify teacher owns this student
  const student = await User.findOne({ _id: req.params.id, role: "student", createdBy: req.user.id });
  if (!student) return res.status(404).json({ message: "Student not found" });

  // Enforce max 8 semesters
  const existingCount = await SemesterResult.countDocuments({ userId: req.params.id });
  if (existingCount >= 8) {
    return res.status(400).json({ message: "Maximum of 8 semesters allowed per student" });
  }

  // Prevent duplicate semester label
  const duplicate = await SemesterResult.findOne({ userId: req.params.id, semesterLabel });
  if (duplicate) {
    return res.status(409).json({ message: `${semesterLabel} already exists for this student` });
  }

  const normalizedSubjects = normalizeSubjects(subjects);
  if (normalizedSubjects.some((s) => Number.isNaN(s.score) || s.score < 0 || s.score > 100)) {
    return res.status(400).json({ message: "Each subject score must be between 0 and 100" });
  }

  const created = await SemesterResult.create({
    userId: req.params.id,
    semesterLabel,
    subjects: normalizedSubjects,
    gpa: typeof gpa === "number" ? gpa : undefined,
    percentage: typeof percentage === "number" ? percentage : undefined,
  });

  return res.status(201).json(created);
}


async function updateSemesterForStudent(req, res) {
  const { semesterLabel, subjects, gpa, percentage } = req.body;

  if (!semesterLabel || !Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({ message: "Semester label and subjects are required" });
  }

  // Verify semester belongs to one of teacher's students
  const result = await SemesterResult.findById(req.params.semesterId);
  if (!result) return res.status(404).json({ message: "Semester not found" });

  const student = await User.findOne({ _id: result.userId, createdBy: req.user.id });
  if (!student) return res.status(403).json({ message: "Not authorized" });

  const normalizedSubjects = normalizeSubjects(subjects);
  if (normalizedSubjects.some((s) => Number.isNaN(s.score) || s.score < 0 || s.score > 100)) {
    return res.status(400).json({ message: "Each subject score must be between 0 and 100" });
  }

  const updated = await SemesterResult.findByIdAndUpdate(
    req.params.semesterId,
    { semesterLabel, subjects: normalizedSubjects, gpa, percentage },
    { new: true, runValidators: true }
  ).lean();

  return res.json(updated);
}

async function deleteSemesterForStudent(req, res) {
  const result = await SemesterResult.findById(req.params.semesterId);
  if (!result) return res.status(404).json({ message: "Semester not found" });

  const student = await User.findOne({ _id: result.userId, createdBy: req.user.id });
  if (!student) return res.status(403).json({ message: "Not authorized" });

  await SemesterResult.findByIdAndDelete(req.params.semesterId);
  return res.json({ message: "Semester deleted" });
}

// ─── Quizzes ─────────────────────────────────────────────────────────────────

async function assignQuiz(req, res) {
  const { subject, topic, difficulty = "medium", level = "intermediate" } = req.body;

  if (!subject || !topic) {
    return res.status(400).json({ message: "Subject and topic are required" });
  }

  const student = await User.findOne({ _id: req.params.id, role: "student", createdBy: req.user.id });
  if (!student) return res.status(404).json({ message: "Student not found" });

  const questions = await generateQuiz({ subject, topic, difficulty, level });

  const quiz = await AssignedQuiz.create({
    teacherId: req.user.id,
    studentId: req.params.id,
    subject,
    topic,
    difficulty,
    questions,
    status: "pending",
  });

  return res.status(201).json(quiz);
}

async function listQuizzesForStudent(req, res) {
  const student = await User.findOne({ _id: req.params.id, role: "student", createdBy: req.user.id });
  if (!student) return res.status(404).json({ message: "Student not found" });

  const quizzes = await AssignedQuiz.find({ studentId: req.params.id, teacherId: req.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return res.json({ quizzes });
}

module.exports = {
  createStudent,
  listStudents,
  getStudent,
  updateStudent,
  addSemesterForStudent,
  updateSemesterForStudent,
  deleteSemesterForStudent,
  assignQuiz,
  listQuizzesForStudent,
};
