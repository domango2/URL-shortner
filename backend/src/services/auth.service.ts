import bcrypt from "bcrypt";
import { User } from "../models/user.model";
import { signToken } from "../utils/jwt";

export async function registerUser(
  email: string,
  password: string
): Promise<number> {
  if (!email || !password) {
    throw { status: 400, message: "Email и пароль обязательны" };
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw { status: 409, message: "Пользователь с таким email уже существует" };
  }

  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  const user = await User.create({ email, password: hash });
  return user.id;
}

export async function loginUser(
  email: string,
  password: string
): Promise<string> {
  if (!email || !password) {
    throw { status: 400, message: "Email и пароль обязательны" };
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw { status: 401, message: "Неверные email или пароль" };
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw { status: 401, message: "Неверные email или пароль" };
  }

  return signToken({ userId: user.id, email: user.email });
}
