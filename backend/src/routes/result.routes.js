const express = require("express");
const authMiddleware = require("../middleware/auth");
const {
	createResult,
	listResults,
	getResultById,
	updateResult,
} = require("../controllers/result.controller");

const router = express.Router();

router.use(authMiddleware);
router.post("/", createResult);
router.get("/", listResults);
router.get("/:id", getResultById);
router.put("/:id", updateResult);

module.exports = router;
