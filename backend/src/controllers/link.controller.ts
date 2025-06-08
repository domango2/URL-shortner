import { Request, Response } from "express";
import axios from "axios";
import * as UAParser from "ua-parser-js";
import { Link } from "../models/link.model";
import { ClickStat } from "../models/clickstat.model";
import { generateUniqueShortCode } from "../utils/generateShortCode";

export async function createShortLink(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as number;
    const { originalUrl } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Неавторизован" });
    }

    if (!originalUrl) {
      return res.status(400).json({ message: "Поле originalUrl обязательно" });
    }

    const existing = await Link.findOne({ where: { userId, originalUrl } });
    if (existing) {
      return res.status(200).json({
        message: "Ссылка уже сокращалась",
        data: {
          originalUrl: existing.originalUrl,
          shortCode: existing.shortCode,
        },
      });
    }

    const checkFn = async (code: string) => {
      const link = await Link.findOne({ where: { shortCode: code } });
      return !!link;
    };

    const shortCode = await generateUniqueShortCode(checkFn, 10);

    const newLink = await Link.create({ userId, originalUrl, shortCode });

    return res.status(201).json({
      message: "Ссылка успешно сокращена",
      data: {
        originalUrl: newLink.originalUrl,
        shortCode: newLink.shortCode,
      },
    });
  } catch (error) {
    console.error("Ошибка в createShortLink:", error);
    return res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
}

export async function getUserLinks(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as number;
    if (!userId) {
      return res.status(401).json({ message: "Неавторизован" });
    }

    const links = await Link.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      attributes: ["id", "originalUrl", "shortCode", "createdAt"],
    });

    return res.json({ links });
  } catch (error) {
    console.error("Ошибка в getUserLinks:", error);
    return res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
}

export async function deleteLink(req: Request, res: Response) {
  const userId = (req as any).userId as number;
  const { id } = req.params;
  const link = await Link.findByPk(id);
  if (!link || link.userId !== userId)
    return res.status(404).json({ message: "Не найдено или нет доступа" });
  await link.destroy();
  return res.json({ message: "Ссылка удалена" });
}

export async function updateLink(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as number;
    const { id } = req.params;
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: "Поле originalUrl обязательно" });
    }

    const link = await Link.findByPk(id);
    if (!link || link.userId !== userId) {
      return res.status(404).json({ message: "Не найдено или нет доступа" });
    }

    const checkFn = async (code: string) => {
      const existing = await Link.findOne({ where: { shortCode: code } });

      return existing !== null && existing.id !== link.id;
    };
    const newShortCode = await generateUniqueShortCode(checkFn, 6);

    link.originalUrl = originalUrl;
    link.shortCode = newShortCode;
    await link.save();

    return res.json({
      message: "Ссылка обновлена",
      link: {
        id: link.id,
        originalUrl: link.originalUrl,
        shortCode: link.shortCode,
        createdAt: link.createdAt,
      },
    });
  } catch (error) {
    console.error("Ошибка в updateLink:", error);
    return res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
}

export async function redirectToOriginal(req: Request, res: Response) {
  try {
    const { shortCode } = req.params;

    if (!shortCode) {
      return res.status(400).json({ message: "Код ссылки нe указан" });
    }

    const link = await Link.findOne({ where: { shortCode } });
    if (!link) {
      return res.status(404).json({ message: "Ссылка не найдена" });
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
    return res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
}
