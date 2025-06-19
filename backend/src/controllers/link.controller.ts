import { Request, Response } from "express";
import axios from "axios";
import * as UAParser from "ua-parser-js";
import { Link } from "../models/link.model";
import { ClickStat } from "../models/clickstat.model";
import { generateUniqueShortCode } from "../utils/generateShortCode";

export async function createShortLink(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = (req as any).userId as number;
    const { originalUrl } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Неавторизован" });
      return;
    }

    if (!originalUrl) {
      res.status(400).json({ message: "Поле originalUrl обязательно" });
      return;
    }

    const existing = await Link.findOne({ where: { userId, originalUrl } });
    if (existing) {
      res.status(200).json({
        message: "Ссылка уже сокращалась",
        data: {
          originalUrl: existing.originalUrl,
          shortCode: existing.shortCode,
        },
      });
      return;
    }

    const checkFn = async (code: string) => {
      const link = await Link.findOne({ where: { shortCode: code } });
      return !!link;
    };

    const shortCode = await generateUniqueShortCode(checkFn, 10);

    const newLink = await Link.create({ userId, originalUrl, shortCode });

    res.status(201).json({
      message: "Ссылка успешно сокращена",
      data: {
        originalUrl: newLink.originalUrl,
        shortCode: newLink.shortCode,
      },
    });
    return;
  } catch (error) {
    console.error("Ошибка в createShortLink:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
    return;
  }
}

export async function getUserLinks(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId as number;
    if (!userId) {
      res.status(401).json({ message: "Неавторизован" });
      return;
    }

    const links = await Link.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      attributes: ["id", "originalUrl", "shortCode", "createdAt"],
    });

    res.json({ links });
    return;
  } catch (error) {
    console.error("Ошибка в getUserLinks:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
    return;
  }
}

export async function deleteLink(req: Request, res: Response): Promise<void> {
  const userId = (req as any).userId as number;
  const { id } = req.params;
  const link = await Link.findByPk(id);
  if (!link || link.userId !== userId) {
    res.status(404).json({ message: "Не найдено или нет доступа" });
    return;
  }
  await link.destroy();
  res.json({ message: "Ссылка удалена" });
  return;
}

export async function updateLink(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId as number;
    const { id } = req.params;
    const { originalUrl } = req.body;

    if (!originalUrl) {
      res.status(400).json({ message: "Поле originalUrl обязательно" });
      return;
    }

    const link = await Link.findByPk(id);
    if (!link || link.userId !== userId) {
      res.status(404).json({ message: "Не найдено или нет доступа" });
      return;
    }

    const checkFn = async (code: string) => {
      const existing = await Link.findOne({ where: { shortCode: code } });

      return existing !== null && existing.id !== link.id;
    };
    const newShortCode = await generateUniqueShortCode(checkFn, 6);

    link.originalUrl = originalUrl;
    link.shortCode = newShortCode;
    await link.save();

    res.json({
      message: "Ссылка обновлена",
      link: {
        id: link.id,
        originalUrl: link.originalUrl,
        shortCode: link.shortCode,
        createdAt: link.createdAt,
      },
    });
    return;
  } catch (error) {
    console.error("Ошибка в updateLink:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
    return;
  }
}

export async function redirectToOriginal(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { shortCode } = req.params;

    if (!shortCode) {
      res.status(400).json({ message: "Код ссылки нe указан" });
      return;
    }

    const link = await Link.findOne({ where: { shortCode } });
    if (!link) {
      res.status(404).json({ message: "Ссылка не найдена" });
      return;
    }

    res.redirect(link.originalUrl);

    try {
      let ip =
        (req.headers["x-forwarded-for"] as string) ||
        req.socket.remoteAddress ||
        "";

      if (ip.includes(",")) {
        ip = ip.split(",")[0].trim();
      }

      ip = ip.replace(/^::ffff:/, "");

      const ua = req.headers["user-agent"] || "";
      const parser = new (UAParser as any).default(ua);
      const browserInfo = parser.getBrowser();
      const osInfo = parser.getOS();

      let region = "Unknown";

      try {
        const geoRes = await axios.get(`http://ip-api.com/json/${ip}`);
        if (geoRes.data && geoRes.data.status === "success") {
          const country = geoRes.data.country || "";
          const city = geoRes.data.city || "";
          region = city ? `${country}, ${city}` : country;
        }
      } catch (geoError) {
        console.error("Ошибка при запросе GEO-IP:", geoError);
      }

      await ClickStat.create({
        linkId: link.id,
        ip,
        region,
        browser: browserInfo.name || "Unknown",
        browserVersion: browserInfo.version || "Unknown",
        os: osInfo.name ? `${osInfo.name} ${osInfo.version || ""}` : "Unknown",
      });
    } catch (statError) {
      console.error("Ошибка сохранения статистики клика:", statError);
    }
  } catch (error) {
    console.error("Ошибка в redirectToOriginal:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
    return;
  }
}
