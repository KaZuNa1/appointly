import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const authMiddleware = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const header = req.headers.authorization;

    if (!header)
      return res.status(401).json({ message: "Token required" });

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded; // { id, email, role }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

export const optionalAuthMiddleware = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const header = req.headers.authorization;

    if (header) {
      const token = header.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // { id, email, role }
    }
    // If no token, just continue without setting req.user
    next();
  } catch (err) {
    // Invalid token, continue without user
    next();
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
};
