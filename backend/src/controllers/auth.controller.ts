import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";
import { Role } from "@prisma/client";
import { logLogin } from "../utils/audit";

const generateToken = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "24h" } // Auto logout after 24 hours
  );
};

// ----------------------
// 1. REGISTER USER
// ----------------------
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password)
      return res.status(400).json({ msg: "Бүх талбарыг бөглөнө үү." });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists)
      return res.status(400).json({ msg: "Имэйл бүртгэлтэй байна." });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashed,
        role: Role.CUSTOMER
      }
    });

    return res.status(201).json({
      msg: "Амжилттай бүртгэгдлээ!",
      user,
      token: generateToken(user)
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
};

// ----------------------
// 2. REGISTER BUSINESS
// ----------------------
export const registerBusiness = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      password,
      businessName,
      category,
      phone,
      address,
      city,
      district,
      description
    } = req.body;

    if (!fullName || !email || !password || !businessName || !category)
      return res.status(400).json({ msg: "Бүх шаардлагатай талбарыг бөглөнө үү." });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists)
      return res.status(400).json({ msg: "Имэйл бүртгэлтэй байна." });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashed,
        role: Role.PROVIDER
      }
    });

    const provider = await prisma.businessProvider.create({
      data: {
        userId: user.id,
        businessName,
        category,
        phone,
        address,
        city,
        district,
        description
      }
    });

    return res.status(201).json({
      msg: "Бизнес амжилттай бүртгэгдлээ!",
      provider,
      token: generateToken(user)
    });
  } catch (err) {
    console.error("REGISTER BUSINESS ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
};

// ----------------------
// 3. LOGIN
// ----------------------
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ msg: "Имэйл болон нууц үг оруулна уу." });

    const user = await prisma.user.findUnique({
      where: { email },
      include: { providerProfile: true }
    });

    if (!user)
      return res.status(400).json({ msg: "Имэйл буруу байна." });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(400).json({ msg: "Нууц үг буруу байна." });

    // Log the login action
    await logLogin(user.id, { email: user.email });

    return res.status(200).json({
      msg: "Амжилттай нэвтэрлээ!",
      user,
      token: generateToken(user)
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
};

// ----------------------
// 4. GET PROFILE (/me)
// ----------------------
export const getProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { providerProfile: true }
    });

    if (!user)
      return res.status(404).json({ msg: "Хэрэглэгч олдсонгүй." });

    return res.status(200).json({ user });
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
};

// ----------------------
// 5. UPDATE PROFILE (fullName)
// ----------------------
export const updateProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { fullName } = req.body;

    if (!fullName) {
      return res.status(400).json({ msg: "Нэр оруулна уу." });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { fullName }
    });

    return res.status(200).json({ msg: "Амжилттай шинэчлэгдлээ!", user });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
};

// ----------------------
// 6. UPDATE EMAIL
// ----------------------
export const updateEmail = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Имэйл оруулна уу." });
    }

    // Check if email already exists
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists && exists.id !== userId) {
      return res.status(400).json({ msg: "Имэйл бүртгэлтэй байна." });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { email }
    });

    return res.status(200).json({ msg: "Имэйл амжилттай солигдлоо!", user });
  } catch (err) {
    console.error("UPDATE EMAIL ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
};

// ----------------------
// 7. UPDATE PASSWORD
// ----------------------
export const updatePassword = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: "Бүх талбарыг бөглөнө үү." });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ msg: "Хэрэглэгч олдсонгүй." });
    }

    // Verify current password
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return res.status(400).json({ msg: "Одоогийн нууц үг буруу байна." });
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed }
    });

    return res.status(200).json({ msg: "Нууц үг амжилттай солигдлоо!" });
  } catch (err) {
    console.error("UPDATE PASSWORD ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
};
