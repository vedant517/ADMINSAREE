import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  let token = null;
  
  try {
    // ── Strictly read from httpOnly cookie ──
    token = req.cookies?.token;

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