import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Admin middleware - requires valid JWT and ADMIN role
export const adminMiddleware = (req: any, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "Нэвтрэх эрх шаардлагатай" });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    // Check if user has ADMIN role
    if (decoded.role !== "ADMIN") {
      return res.status(403).json({ msg: "Админ эрх шаардлагатай" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    return res.status(401).json({ msg: "Хүчингүй эсвэл дууссан токен" });
  }
};
