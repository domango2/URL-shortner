import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/user.model";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "urlshortnersecretkey";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

export async function register(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email и пароль обязательны" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Пользователь с таким email уже существует" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      email,
      password: hashedPassword,
    });

    return res
      .status(201)
      .json({ message: "Пользователь зарегистрирован", userId: newUser.id });
  } catch (error) {
    console.error("Ошибка в register:", error);
    return res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email и пароль обязательны" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Неверные email или пароль" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Неверные email или пароль" });
    }

    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({ message: "Успешный вход", token });
  } catch (error) {
    console.error("Ошибка в login", error);
    return res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
}
