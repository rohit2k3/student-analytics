const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: { type: [String], default: [] },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const assignedQuizSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subject: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    questions: { type: [questionSchema], default: [] },
    status: {
      type: String,
      enum: ["pending", "submitted"],
      default: "pending",
    },
    userAnswers: { type: [String], default: [] },
    score: { type: Number, default: null },
    total: { type: Number, default: null },
    percentage: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssignedQuiz", assignedQuizSchema);
