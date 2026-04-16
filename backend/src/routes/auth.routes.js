const express = require("express");
const authMiddleware = require("../middleware/auth");
const { register, login, me, updateProfile } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);
router.put("/me", authMiddleware, updateProfile);

module.exports = router;
