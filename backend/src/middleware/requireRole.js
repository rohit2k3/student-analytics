function requireTeacher(req, res, next) {
  if (!req.user || req.user.role !== "teacher") {
    return res.status(403).json({ message: "Access denied: teacher role required" });
  }
  return next();
}

function requireStudent(req, res, next) {
  if (!req.user || req.user.role !== "student") {
    return res.status(403).json({ message: "Access denied: student role required" });
  }
  return next();
}

module.exports = { requireTeacher, requireStudent };
