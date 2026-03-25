import jwt from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET || "default";

export const requiredAuthMiddleware = (req, res, next) => {
  try {
    const token = req.header("auth-token");
    if (!token) {
      return res.status(401).json({ success: false, message: "Access Denied" });
    }
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    console.log("JWT Error:", error);
    res.status(401).json({ success: false, message: "Internal Server Error" });
  }
};
