import { Request, Response } from "express";
import { Link } from "../models/link.model";
import { ClickStat } from "../models/clickstat.model";
import { timeStamp } from "console";

export async function getStatsByShortCode(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = (req as any).userId as number;
    const { shortCode } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Неавторизованы" });
      return;
    }

    if (!shortCode) {
      res.status(400).json({ message: "Код ссылки не указан" });
      return;
    }

    const link = await Link.findOne({ where: { shortCode } });
    if (!link) {
      res.status(404).json({ message: "Ссылка не найдена" });
      return;
    }
    if (link.userId !== userId) {
      res.status(403).json({ message: "Доступ запрещён" });
      return;
    }

    const clicks = await ClickStat.findAll({
      where: { linkId: link.id },
      order: [["timestamp", "DESC"]],
    });

    const stats = clicks.map((c) => ({
      timestamp: c.timestamp,
      ip: c.ip,
      region: c.region,
      browser: c.browser,
      browserVersion: c.browserVersion,
      os: c.os,
    }));

    res.json({ shortCode, stats });
    return;
  } catch (error) {
    console.error("Ошибка в getStatsByShortCode:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
    return;
  }
}
