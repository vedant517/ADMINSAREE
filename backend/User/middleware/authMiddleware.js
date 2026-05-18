import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  let token = null;
  
  try {
    // ── 1. Try httpOnly cookie first (local dev) ──
    token = req.cookies?.token;

    // ── 2. Fallback to Authorization Bearer header (Render / cross-origin) ──
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      _id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error details:", {
      message: err.message,
      token: token ? (token.substring(0, 10) + "...") : "MISSING",
      secret: process.env.JWT_SECRET ? "PRESENT" : "MISSING"
    });
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};


export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user?.role || 'unknown'} is not authorized to access this route`,
      });
    }
    next();
  };
};