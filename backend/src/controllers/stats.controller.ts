import { Request, Response } from "express";
import { Link } from "../models/link.model";
import { ClickStat } from "../models/clickstat.model";
import { timeStamp } from "console";

export async function getStatsByShortCode(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as number;
    const { shortCode } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Неавторизованы" });
    }

    if (!shortCode) {
      return res.status(400).json({ message: "Код ссылки не указан" });
    }

    const link = await Link.findOne({ where: { shortCode } });
    if (!link) {
      return res.status(404).json({ message: "Ссылка не найдена" });
    }
    if (link.userId !== userId) {
      return res.status(403).json({ message: "Доступ запрещён" });
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

    return res.json({ shortCode, stats });
  } catch (error) {
    console.error("Ошибка в getStatsByShortCode:", error);
    return res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
}
