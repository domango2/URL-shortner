import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const userId = await authService.registerUser(email, password);
    res.status(201).json({ message: "Пользователь зарегистрирован", userId });
  } catch (err: any) {
    console.error("Ошибка в register:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Внутренняя ошибка сервера" });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const token = await authService.loginUser(email, password);
    res.json({ message: "Успешный вход", token });
  } catch (err: any) {
    console.error("Ошибка в login:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Внутренняя ошибка сервера" });
  }
}
