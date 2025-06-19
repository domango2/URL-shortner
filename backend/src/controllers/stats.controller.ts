import { Request, Response } from "express";
import * as statsService from "../services/stats.service";

export async function getStatsByShortCode(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = (req as any).userId as number;
    const shortCode = req.params.shortCode;
    if (!userId) throw { status: 401, message: "Неавторизован" };

    const stats = await statsService.getStats(userId, shortCode);
    res.json({ shortCode, stats });
  } catch (err: any) {
    console.error("Ошибка в getStatsByShortCode:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Внутренняя ошибка сервера" });
  }
}
