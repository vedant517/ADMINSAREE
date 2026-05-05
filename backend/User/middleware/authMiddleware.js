import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  let token = null;
  
  try {
    // ── Priority 1: Authorization header (Bearer token from localStorage) ──
    const authHeader = req.headers.authorization;

    // ── Priority 2: httpOnly cookie (set by server on login) ──
    const cookieToken = req.cookies?.token;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (cookieToken) {
      token = cookieToken;
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