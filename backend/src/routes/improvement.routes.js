const express = require("express");
const authMiddleware = require("../middleware/auth");
const { getImprovement } = require("../controllers/improvement.controller");

const router = express.Router();

router.get("/", authMiddleware, getImprovement);

module.exports = router;
