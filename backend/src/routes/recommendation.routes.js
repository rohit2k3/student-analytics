const express = require("express");
const authMiddleware = require("../middleware/auth");
const { getRecommendations } = require("../controllers/recommendation.controller");

const router = express.Router();

router.get("/", authMiddleware, getRecommendations);

module.exports = router;
