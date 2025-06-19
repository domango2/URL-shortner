import { Link } from "../models/link.model";
import { ClickStat } from "../models/clickstat.model";

export interface ClickDto {
  timestamp: Date;
  ip: string;
  region: string;
  browser: string;
  browserVersion: string;
  os: string;
}

export async function getStats(userId: number, shortCode: string) {
  if (!shortCode) throw { status: 400, message: "Код ссылки не указан" };

  const link = await Link.findOne({ where: { shortCode } });
  if (!link) throw { status: 404, message: "Ссылка не найдена" };
  if (link.userId !== userId) throw { status: 403, message: "Доступ запрещён" };

  const clicks = await ClickStat.findAll({
    where: { linkId: link.id },
    order: [["timestamp", "DESC"]],
  });

  return clicks.map(
    (c): ClickDto => ({
      timestamp: c.timestamp,
      ip: c.ip,
      region: c.region,
      browser: c.browser,
      browserVersion: c.browserVersion,
      os: c.os,
    })
  );
}
