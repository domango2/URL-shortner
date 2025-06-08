import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;
const DB_NAME = process.env.DB_NAME || "url_shortner_db";
const DB_USER = process.env.DB_USER || "postgres";
const DB_PASS = process.env.DB_PASS || "postgres";

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",
  logging: false,
});

export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("Успешно подключились к PostgreSQL через Sequelize");
  } catch (error) {
    console.log("Ошибка подключения к базе данных:", error);
    process.exit(1);
  }
}
