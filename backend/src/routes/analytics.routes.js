const express = require("express");
const authMiddleware = require("../middleware/auth");
const { getAnalytics } = require("../controllers/analytics.controller");

const router = express.Router();

router.get("/", authMiddleware, getAnalytics);

module.exports = router;
