const express = require("express");
const authMiddleware = require("../middleware/auth");
const { login, register, me, updateProfile, seedTeacher } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/seed-teacher", seedTeacher);
router.get("/me", authMiddleware, me);
router.put("/me", authMiddleware, updateProfile);

module.exports = router;

