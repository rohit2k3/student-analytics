const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");

function signToken(userId) {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET is missing in environment variables");
  }

  return jwt.sign({ userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

function formatUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || "student",
    profile: user.profile || {},
  };
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken(user._id.toString());

  return res.json({ token, user: formatUser(user) });
}

function me(req, res) {
  return res.json({ user: req.user });
}

async function updateProfile(req, res) {
  const { name, profile } = req.body;

  const updates = {};
  if (typeof name === "string" && name.trim()) {
    updates.name = name.trim();
  }

  if (profile && typeof profile === "object") {
    updates.profile = {
      department: typeof profile.department === "string" ? profile.department : "",
      year: typeof profile.year === "string" ? profile.year : "",
      targetGpa:
        profile.targetGpa === "" || typeof profile.targetGpa === "undefined"
          ? undefined
          : Number(profile.targetGpa),
      weeklyStudyHours:
        profile.weeklyStudyHours === "" || typeof profile.weeklyStudyHours === "undefined"
          ? undefined
          : Number(profile.weeklyStudyHours),
      learningGoal: typeof profile.learningGoal === "string" ? profile.learningGoal : "",
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  }).lean();

  return res.json({ user: formatUser(user) });
}

// One-time endpoint to create the first teacher account.
// Only works when no teacher exists yet (first-run safety).
async function seedTeacher(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must have at least 6 characters" });
  }

  const existingTeacher = await User.findOne({ role: "teacher" });
  if (existingTeacher) {
    return res.status(403).json({ message: "A teacher account already exists. Use the teacher panel to manage accounts." });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role: "teacher" });

  const token = signToken(user._id.toString());
  return res.status(201).json({ token, user: formatUser(user) });
}

module.exports = {
  login,
  me,
  updateProfile,
  seedTeacher,
};

