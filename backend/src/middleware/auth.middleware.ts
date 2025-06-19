import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Токен отсутствует" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyToken(token);

    (req as any).userId = payload.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Неверный токен" });
    return;
  }
}
