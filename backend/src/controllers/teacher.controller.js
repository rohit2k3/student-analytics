const bcrypt = require("bcryptjs");
const User = require("../models/User");
const SemesterResult = require("../models/SemesterResult");
const AssignedQuiz = require("../models/AssignedQuiz");
const { generateQuiz } = require("../services/gemini.service");
const { inferSubjectCategory } = require("../utils/analytics");
const courseMap = require("../data/course-map.json");

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

  let initialSubjects = null;
  let initialSemesterLabel = null;

  const hasCourseInfo = profile?.course || profile?.department || profile?.semester;
  if (hasCourseInfo && !(profile?.course && profile?.department && profile?.semester)) {
    return res.status(400).json({ message: "Course, department, and semester are required together" });
  }

  if (profile?.course && profile?.department && profile?.semester) {
    const semesterLabel = profile.semester.startsWith("Semester") ? profile.semester : `Semester ${profile.semester}`;
    const courseEntry = courseMap[profile.course];
    const deptEntry = courseEntry?.[profile.department];
    const subjectTemplate = deptEntry?.[semesterLabel];

    if (!subjectTemplate || subjectTemplate.length === 0) {
      return res.status(400).json({ message: "No subjects found for the selected course, department, and semester" });
    }

    initialSemesterLabel = semesterLabel;
    initialSubjects = subjectTemplate.map((s) => ({
      name: s.name,
      score: 0,
      credits: Number(s.credits || 0),
      category: s.category || inferSubjectCategory(s.name),
    }));
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

  if (initialSubjects && initialSemesterLabel) {
    await SemesterResult.create({
      userId: student._id,
      semesterLabel: initialSemesterLabel,
      subjects: initialSubjects,
    });
  }

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
      course: profile.course || student.profile?.course || "",
      department: profile.department || student.profile?.department || "",
      semester: profile.semester || student.profile?.semester || "",
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

function normalizeQuizQuestions(questions) {
  const normalized = questions.map((q) => ({
    question: String(q.question || "").trim(),
    options: Array.isArray(q.options) ? q.options.map((o) => String(o).trim()).filter(Boolean) : [],
    answer: String(q.answer || "").trim(),
  }));

  const invalid = normalized.some((q) =>
    !q.question || q.options.length < 2 || !q.answer || !q.options.includes(q.answer)
  );

  if (invalid) {
    return { error: "Each question needs text, at least 2 options, and an answer that matches an option" };
  }

  return { questions: normalized };
}

function getPerformanceTag(percentage) {
  if (percentage == null || Number.isNaN(Number(percentage))) return "Not Rated";
  const value = Number(percentage);
  if (value >= 80) return "Outstanding";
  if (value >= 60) return "Above Average";
  if (value >= 40) return "Average";
  return "Below Average";
}

function parseDueAt(dueAt) {
  if (!dueAt) return null;
  const parsed = new Date(dueAt);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

async function assignQuiz(req, res) {
  const { subject, topic, difficulty = "medium", level = "intermediate", questions, dueAt, mandatory } = req.body;

  if (!subject || !topic) {
    return res.status(400).json({ message: "Subject and topic are required" });
  }

  const student = await User.findOne({ _id: req.params.id, role: "student", createdBy: req.user.id });
  if (!student) return res.status(404).json({ message: "Student not found" });

  let quizQuestions = [];

  if (Array.isArray(questions) && questions.length > 0) {
    const normalized = normalizeQuizQuestions(questions);
    if (normalized.error) {
      return res.status(400).json({ message: normalized.error });
    }
    quizQuestions = normalized.questions;
  } else {
    quizQuestions = await generateQuiz({ subject, topic, difficulty, level });
  }

  const quiz = await AssignedQuiz.create({
    teacherId: req.user.id,
    studentId: req.params.id,
    subject,
    topic,
    difficulty,
    questions: quizQuestions,
    status: "pending",
    dueAt: parseDueAt(dueAt),
    mandatory: Boolean(mandatory),
  });

  return res.status(201).json(quiz);
}

async function assignQuizBulk(req, res) {
  const {
    subject,
    topic,
    difficulty = "medium",
    level = "intermediate",
    scope,
    category,
    studentIds,
    questions,
    dueAt,
    mandatoryMode,
    mandatoryCategory,
  } = req.body;

  if (!subject || !topic) {
    return res.status(400).json({ message: "Subject and topic are required" });
  }

  const validScopes = ["all", "category", "selected"];
  if (!validScopes.includes(scope)) {
    return res.status(400).json({ message: "scope must be one of all, category, selected" });
  }

  let quizQuestions = [];
  if (Array.isArray(questions) && questions.length > 0) {
    const normalized = normalizeQuizQuestions(questions);
    if (normalized.error) {
      return res.status(400).json({ message: normalized.error });
    }
    quizQuestions = normalized.questions;
  } else {
    quizQuestions = await generateQuiz({ subject, topic, difficulty, level });
  }

  let students = [];
  if (scope === "all") {
    students = await User.find({ role: "student", createdBy: req.user.id }).select("_id").lean();
  } else if (scope === "selected") {
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: "studentIds are required for selected scope" });
    }
    students = await User.find({ _id: { $in: studentIds }, role: "student", createdBy: req.user.id })
      .select("_id")
      .lean();
  } else if (scope === "category") {
    const allowedCategories = ["Outstanding", "Above Average", "Average", "Below Average", "Not Rated"];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const owned = await User.find({ role: "student", createdBy: req.user.id }).select("_id").lean();
    const withTag = await Promise.all(
      owned.map(async (s) => {
        const results = await SemesterResult.find({ userId: s._id }).lean();
        const percentages = results.map((r) => r.percentage).filter((p) => p != null);
        const avgPct = percentages.length
          ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
          : null;
        return { id: s._id, tag: getPerformanceTag(avgPct) };
      })
    );
    students = withTag
      .filter((s) => s.tag === category)
      .map((s) => ({ _id: s.id, avgPercentage: null, tag: s.tag }));
  }

  if (!students.length) {
    return res.status(404).json({ message: "No students found for this assignment" });
  }

  let tagMap = {};
  if (mandatoryMode === "category") {
    const tagged = await Promise.all(
      students.map(async (s) => {
        const results = await SemesterResult.find({ userId: s._id }).lean();
        const percentages = results.map((r) => r.percentage).filter((p) => p != null);
        const avgPct = percentages.length
          ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
          : null;
        return { id: s._id, tag: getPerformanceTag(avgPct) };
      })
    );
    tagMap = tagged.reduce((acc, item) => {
      acc[item.id.toString()] = item.tag;
      return acc;
    }, {});
  }

  const validMandatoryModes = ["optional", "all", "category"];
  if (mandatoryMode && !validMandatoryModes.includes(mandatoryMode)) {
    return res.status(400).json({ message: "mandatoryMode must be optional, all, or category" });
  }

  const mandatoryCategories = ["Outstanding", "Above Average", "Average", "Below Average", "Not Rated"];
  if (mandatoryMode === "category" && !mandatoryCategories.includes(mandatoryCategory)) {
    return res.status(400).json({ message: "Invalid mandatory category" });
  }

  const dueAtValue = parseDueAt(dueAt);

  const quizzes = await AssignedQuiz.insertMany(
    students.map((s) => {
      let isMandatory = false;
      if (mandatoryMode === "all") isMandatory = true;
      if (mandatoryMode === "category") {
        const tag = s.tag || tagMap[s._id.toString()] || getPerformanceTag(s.avgPercentage);
        isMandatory = tag === mandatoryCategory;
      }
      return {
      teacherId: req.user.id,
      studentId: s._id,
      subject,
      topic,
      difficulty,
      questions: quizQuestions,
      status: "pending",
      dueAt: dueAtValue,
      mandatory: isMandatory,
    };})
  );

  return res.status(201).json({ count: quizzes.length });
}

async function listQuizzesForStudent(req, res) {
  const student = await User.findOne({ _id: req.params.id, role: "student", createdBy: req.user.id });
  if (!student) return res.status(404).json({ message: "Student not found" });

  const quizzes = await AssignedQuiz.find({ studentId: req.params.id, teacherId: req.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return res.json({ quizzes });
}

async function listAllAssignedQuizzes(req, res) {
  const quizzes = await AssignedQuiz.find({ teacherId: req.user.id })
    .populate("studentId", "name email")
    .sort({ createdAt: -1 })
    .lean();

  const mapped = quizzes.map((quiz) => ({
    ...quiz,
    student: quiz.studentId
      ? { id: quiz.studentId._id, name: quiz.studentId.name, email: quiz.studentId.email }
      : null,
  }));

  return res.json({ quizzes: mapped });
}

async function updateAssignedQuiz(req, res) {
  const { subject, topic, difficulty, questions, dueAt, mandatory } = req.body;

  const quiz = await AssignedQuiz.findOne({ _id: req.params.quizId, teacherId: req.user.id });
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });
  if (quiz.status !== "pending") {
    return res.status(400).json({ message: "Only pending quizzes can be edited" });
  }

  if (typeof subject === "string" && subject.trim()) quiz.subject = subject.trim();
  if (typeof topic === "string" && topic.trim()) quiz.topic = topic.trim();
  if (typeof difficulty === "string") quiz.difficulty = difficulty;

  if (typeof mandatory !== "undefined") quiz.mandatory = Boolean(mandatory);

  if (typeof dueAt !== "undefined") {
    const parsed = parseDueAt(dueAt);
    if (dueAt && !parsed) {
      return res.status(400).json({ message: "Invalid due date" });
    }
    quiz.dueAt = parsed;
  }

  if (Array.isArray(questions) && questions.length > 0) {
    const normalized = normalizeQuizQuestions(questions);
    if (normalized.error) {
      return res.status(400).json({ message: normalized.error });
    }
    quiz.questions = normalized.questions;
  }

  await quiz.save();
  return res.json(quiz);
}

async function deleteAssignedQuiz(req, res) {
  const quiz = await AssignedQuiz.findOne({ _id: req.params.quizId, teacherId: req.user.id });
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });

  await AssignedQuiz.findByIdAndDelete(req.params.quizId);
  return res.json({ message: "Quiz deleted" });
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
  assignQuizBulk,
  listQuizzesForStudent,
  listAllAssignedQuizzes,
  updateAssignedQuiz,
  deleteAssignedQuiz,
};
