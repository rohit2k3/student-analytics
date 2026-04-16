const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    profile: {
      department: {
        type: String,
        default: "",
      },
      year: {
        type: String,
        default: "",
      },
      targetGpa: {
        type: Number,
        min: 0,
        max: 10,
      },
      weeklyStudyHours: {
        type: Number,
        min: 0,
      },
      learningGoal: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
