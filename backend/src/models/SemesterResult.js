const mongoose = require("mongoose");

const subjectResultSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    credits: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      enum: ["theory", "practical", "problem-solving", "other"],
      default: "theory",
    },
  },
  { _id: false }
);

const semesterResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    semesterLabel: {
      type: String,
      required: true,
      trim: true,
    },
    subjects: {
      type: [subjectResultSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one subject is required",
      },
    },
    gpa: {
      type: Number,
      min: 0,
      max: 10,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SemesterResult", semesterResultSchema);
