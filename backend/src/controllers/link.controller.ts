import { Request, Response } from "express";
import * as linkService from "../services/link.service";

export async function createShortLink(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = (req as any).userId as number;
    const { originalUrl } = req.body;
    if (!userId) throw { status: 401, message: "Неавторизован" };

    const data = await linkService.createShortLink(userId, originalUrl);
    res.status(data.shortCode ? 201 : 200).json({
      message: data.shortCode
        ? "Ссылка успешно сокращена"
        : "Ссылка уже сокращалась",
      data,
    });
  } catch (err: any) {
    console.error("Ошибка в createShortLink:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Внутренняя ошибка сервера" });
  }
}

export async function getUserLinks(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId as number;
    if (!userId) throw { status: 401, message: "Неавторизован" };

    const links = await linkService.getUserLinks(userId);
    res.json({ links });
  } catch (err: any) {
    console.error("Ошибка в getUserLinks:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Внутренняя ошибка сервера" });
  }
}

export async function deleteLink(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId as number;
    const id = Number(req.params.id);
    await linkService.deleteUserLink(userId, id);
    res.json({ message: "Ссылка удалена" });
  } catch (err: any) {
    console.error("Ошибка в deleteLink:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Внутренняя ошибка сервера" });
  }
}

export async function redirectToOriginal(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { shortCode } = req.params;
    const url = await linkService.resolveAndLogClick(shortCode, req);
    res.redirect(url);
  } catch (err: any) {
    console.error("Ошибка в redirectToOriginal:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Внутренняя ошибка сервера" });
  }
}
