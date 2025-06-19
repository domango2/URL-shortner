import axios from "axios";
import UAParser from "ua-parser-js";
import { Link } from "../models/link.model";
import { ClickStat } from "../models/clickstat.model";
import { generateUniqueShortCode } from "../utils/generateShortCode";

export interface ShortLinkData {
  originalUrl: string;
  shortCode: string;
}

export async function createShortLink(
  userId: number,
  originalUrl: string
): Promise<ShortLinkData> {
  if (!originalUrl) {
    throw { status: 400, message: "Поле originalUrl обязательно" };
  }

  const existing = await Link.findOne({ where: { userId, originalUrl } });
  if (existing) {
    return { originalUrl: existing.originalUrl, shortCode: existing.shortCode };
  }

  const checkFn = async (code: string) =>
    !!(await Link.findOne({ where: { shortCode: code } }));
  const shortCode = await generateUniqueShortCode(checkFn, 10);

  const link = await Link.create({ userId, originalUrl, shortCode });
  return { originalUrl: link.originalUrl, shortCode: link.shortCode };
}

export async function getUserLinks(userId: number) {
  return await Link.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
    attributes: ["id", "originalUrl", "shortCode", "createdAt"],
  });
}

export async function deleteUserLink(
  userId: number,
  linkId: number
): Promise<void> {
  const link = await Link.findByPk(linkId);
  if (!link || link.userId !== userId) {
    throw { status: 404, message: "Не найдено или нет доступа" };
  }
  await link.destroy();
}

export async function resolveAndLogClick(
  shortCode: string,
  req: any
): Promise<string> {
  const link = await Link.findOne({ where: { shortCode } });
  if (!link) throw { status: 404, message: "Ссылка не найдена" };

  let ip =
    (req.headers["x-forwarded-for"] as string) ||
    req.socket.remoteAddress ||
    "";
  if (ip.includes(",")) ip = ip.split(",")[0].trim();
  ip = ip.replace(/^::ffff:/, "");

  const ua = req.headers["user-agent"] || "";
  const parser = new (UAParser as any).default(ua);
  const { name: browser = "Unknown", version: browserVersion = "" } =
    parser.getBrowser();
  const { name: os = "Unknown", version: osVersion = "" } = parser.getOS();
  const userAgent = browserVersion ? `${browser} ${browserVersion}` : browser;
  const osInfo = osVersion ? `${os} ${osVersion}` : os;

  let region = "Unknown";
  try {
    const geo = await axios.get(`http://ip-api.com/json/${ip}`);
    if (geo.data.status === "success") {
      const { country = "", city = "" } = geo.data;
      region = city ? `${country}, ${city}` : country;
    }
  } catch (_) {}

  ClickStat.create({
    linkId: link.id,
    ip,
    region,
    browser,
    browserVersion,
    os: osInfo,
  }).catch(console.error);

  return link.originalUrl;
}
