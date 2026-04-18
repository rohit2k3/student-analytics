const cors = require("cors");
const express = require("express");
const env = require("./config/env");
const { ensureDbConnected } = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const resultRoutes = require("./routes/result.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const recommendationRoutes = require("./routes/recommendation.routes");
const quizRoutes = require("./routes/quiz.routes");
const improvementRoutes = require("./routes/improvement.routes");
const teacherRoutes = require("./routes/teacher.routes");

const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", ensureDbConnected);

app.use("/api/auth", authRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/improvement", improvementRoutes);
app.use("/api/teacher", teacherRoutes);

app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || "Unexpected server error",
  });
});

module.exports = app;

