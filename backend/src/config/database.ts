import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import { User } from "../models/user.model";
import { Link } from "../models/link.model";
import { ClickStat } from "../models/clickstat.model";

dotenv.config();

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS, NODE_ENV } = process.env;

export const sequelize = new Sequelize({
  dialect: "postgres",
  host: DB_HOST,
  port: Number(DB_PORT),
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASS,
  logging: NODE_ENV !== "production",
  models: [User, Link, ClickStat],
});

export async function connectDB() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("✅ Успешно подключились к PostgreSQL через Sequelize‑TS");
  } catch (err) {
    console.error("❌ Ошибка подключения к БД:", err);
    process.exit(1);
  }
}
