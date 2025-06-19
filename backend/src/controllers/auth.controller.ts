import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { signToken } from "../utils/jwt";
import { User } from "../models/user.model";

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email и пароль обязательны" });
      return;
    }

    // TODO: move to it's own service-function
    // function ...(email, password) {...}
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res
        .status(409)
        .json({ message: "Пользователь с таким email уже существует" });
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      email,
      password: hashedPassword,
    });
    // ends here

    res
      .status(201)
      .json({ message: "Пользователь зарегистрирован", userId: newUser.id });
    return;
  } catch (error) {
    console.error("Ошибка в register:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
    return;
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email и пароль обязательны" });
      return;
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "Неверные email или пароль" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ message: "Неверные email или пароль" });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email });

    res.json({ message: "Успешный вход", token });
    return;
  } catch (error) {
    console.error("Ошибка в login", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
    return;
  }
}
