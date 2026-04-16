const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ message: "Authentication token missing" });
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.userId).lean();

    if (!user) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      profile: user.profile || {},
    };

    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = authMiddleware;
