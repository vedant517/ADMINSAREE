import jwt from "jsonwebtoken";

/**
 * Resolve authenticated user id — prefer req.user from protect middleware,
 * then fall back to JWT in httpOnly cookie or Bearer header.
 */
export const resolveAuthUserId = (req) => {
  if (req.user?._id) {
    return String(req.user._id);
  }
  if (req.user?.id) {
    return String(req.user.id);
  }

  let token = req.cookies?.token;
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded?.id ? String(decoded.id) : null;
  } catch {
    return null;
  }
};

export const requireAuthUserId = (req, res) => {
  const userId = resolveAuthUserId(req);
  if (!userId) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return null;
  }
  return userId;
};
