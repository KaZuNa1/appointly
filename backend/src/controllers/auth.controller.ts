import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../config/db";
import { Role } from "@prisma/client";
import { logLogin } from "../utils/audit";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/email";

const generateToken = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "5d" } // Auto logout after 5 days
  );
};

const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const getTokenExpiry = () => {
  return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
};

// ----------------------
// 1. REGISTER USER
// ----------------------
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password)
      return res.status(400).json({ msg: "Бүх талбарыг бөглөнө үү." });

    // Password validation: minimum 8 characters, must contain number and letter
    if (password.length < 8)
      return res.status(400).json({ msg: "Нууц үг дор хаяж 8 тэмдэгттэй байх ёстой." });

    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);

    if (!hasNumber || !hasLetter)
      return res.status(400).json({ msg: "Нууц үг үсэг болон тоо агуулсан байх ёстой." });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists)
      return res.status(400).json({ msg: "Имэйл бүртгэлтэй байна." });

    const hashed = await bcrypt.hash(password, 10);
    const verificationToken = generateVerificationToken();
    const tokenExpiry = getTokenExpiry();

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashed,
        role: Role.CUSTOMER,
        emailVerified: false,
        verificationToken,
        tokenExpiry,
        lastVerificationEmailSent: new Date()
      }
    });

    // Send verification email
    try {
      await sendVerificationEmail({
        email: user.email,
        fullName: user.fullName,
        verificationToken
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue even if email fails - user can resend later
    }

    return res.status(201).json({
      msg: "Бүртгэл амжилттай! Имэйл хаягаа баталгаажуулна уу.",
      requiresVerification: true,
      email: user.email
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
      nickname,
      category,
      phone,
      address,
      city,
      district
    } = req.body;

    if (!fullName || !email || !password || !businessName || !nickname || !category || !phone)
      return res.status(400).json({ msg: "Бүх шаардлагатай талбарыг бөглөнө үү." });

    // Password validation: minimum 8 characters, must contain number and letter
    if (password.length < 8)
      return res.status(400).json({ msg: "Нууц үг дор хаяж 8 тэмдэгттэй байх ёстой." });

    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);

    if (!hasNumber || !hasLetter)
      return res.status(400).json({ msg: "Нууц үг үсэг болон тоо агуулсан байх ёстой." });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists)
      return res.status(400).json({ msg: "Имэйл бүртгэлтэй байна." });

    const hashed = await bcrypt.hash(password, 10);
    const verificationToken = generateVerificationToken();
    const tokenExpiry = getTokenExpiry();

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashed,
        role: Role.PROVIDER,
        emailVerified: false,
        verificationToken,
        tokenExpiry,
        lastVerificationEmailSent: new Date()
      }
    });

    const provider = await prisma.businessProvider.create({
      data: {
        userId: user.id,
        businessName,
        nickname,
        category,
        phone,
        address,
        city,
        district
      }
    });

    // Send verification email
    try {
      await sendVerificationEmail({
        email: user.email,
        fullName: user.fullName,
        verificationToken
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue even if email fails - user can resend later
    }

    return res.status(201).json({
      msg: "Бизнес амжилттай бүртгэгдлээ! Имэйл хаягаа баталгаажуулна уу.",
      requiresVerification: true,
      email: user.email
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

    // Check if user has a password (not Google OAuth user)
    if (!user.password) {
      return res.status(400).json({ msg: "Энэ имэйл Google-ээр бүртгэгдсэн байна. Google-ээр нэвтэрнэ үү." });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(400).json({ msg: "Нууц үг буруу байна." });

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        msg: "Имэйл хаяг баталгаажаагүй байна. Баталгаажуулах имэйлээ шалгана уу.",
        requiresVerification: true,
        email: user.email
      });
    }

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
// 5. UPDATE PROFILE (fullName, phone, address, city, district)
// ----------------------
export const updateProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { fullName, phone, address, city, district } = req.body;

    // Build update data object with only provided fields
    const updateData: any = {};

    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (district !== undefined) updateData.district = district;

    // At least one field must be provided
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ msg: "Шинэчлэх мэдээлэл оруулна уу." });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { providerProfile: true }
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

    // Check if user is Google OAuth user (no password)
    if (!user.password || user.provider === 'GOOGLE') {
      return res.status(400).json({
        msg: "Та Google-ээр нэвтэрсэн тул нууц үгээ энд өөрчлөх боломжгүй. Google аккаунтаасаа удирдана уу."
      });
    }

    // Verify current password
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return res.status(400).json({ msg: "Одоогийн нууц үг буруу байна." });
    }

    // Validate new password: minimum 8 characters, must contain number and letter
    if (newPassword.length < 8) {
      return res.status(400).json({ msg: "Нууц үг дор хаяж 8 тэмдэгттэй байх ёстой." });
    }

    const hasNumber = /\d/.test(newPassword);
    const hasLetter = /[a-zA-Z]/.test(newPassword);

    if (!hasNumber || !hasLetter) {
      return res.status(400).json({ msg: "Нууц үг үсэг болон тоо агуулсан байх ёстой." });
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

// ----------------------
// 8. UPDATE AVATAR
// ----------------------
export const updateAvatar = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({ msg: "Avatar URL оруулна уу." });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      include: { providerProfile: true }
    });

    return res.status(200).json({ msg: "Зураг амжилттай солигдлоо!", user });
  } catch (err) {
    console.error("UPDATE AVATAR ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
};

// ----------------------
// 9. VERIFY EMAIL
// ----------------------
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ msg: "Токен оруулна уу." });
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token }
    });

    if (!user) {
      return res.status(400).json({ msg: "Токен буруу эсвэл хүчингүй байна." });
    }

    // Check if token expired
    if (user.tokenExpiry && user.tokenExpiry < new Date()) {
      return res.status(400).json({ msg: "Токен хугацаа дууссан байна. Дахин илгээлгэнэ үү." });
    }

    // Check if already verified
    if (user.emailVerified) {
      // Already verified - return success with token (no error flash)
      return res.status(200).json({
        msg: "Имэйл аль хэдийн баталгаажсан байна.",
        user: user,
        token: generateToken(user),
        alreadyVerified: true
      });
    }

    // Verify email
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        tokenExpiry: null
      },
      include: { providerProfile: true }
    });

    return res.status(200).json({
      msg: "Имэйл амжилттай баталгаажлаа!",
      user: updatedUser,
      token: generateToken(updatedUser)
    });
  } catch (err) {
    console.error("VERIFY EMAIL ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
};

// ----------------------
// 10. RESEND VERIFICATION EMAIL
// ----------------------
export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Имэйл оруулна уу." });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ msg: "Хэрэглэгч олдсонгүй." });
    }

    if (user.emailVerified) {
      return res.status(400).json({ msg: "Имэйл аль хэдийн баталгаажсан байна." });
    }

    // Rate limiting: Check if last email was sent within 20 minutes (3 emails per hour)
    if (user.lastVerificationEmailSent) {
      const timeSinceLastEmail = Date.now() - user.lastVerificationEmailSent.getTime();
      const twentyMinutesInMs = 20 * 60 * 1000;

      if (timeSinceLastEmail < twentyMinutesInMs) {
        const remainingTime = Math.ceil((twentyMinutesInMs - timeSinceLastEmail) / 60000);
        return res.status(429).json({
          msg: `Хэт олон хүсэлт илгээсэн байна. ${remainingTime} минутын дараа дахин оролдоно уу.`
        });
      }
    }

    // Generate new token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = getTokenExpiry();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        tokenExpiry,
        lastVerificationEmailSent: new Date()
      }
    });

    // Send verification email
    try {
      await sendVerificationEmail({
        email: user.email,
        fullName: user.fullName,
        verificationToken
      });

      return res.status(200).json({
        msg: "Баталгаажуулах имэйл дахин илгээгдлээ!"
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return res.status(500).json({ msg: "Имэйл илгээхэд алдаа гарлаа." });
    }
  } catch (err) {
    console.error("RESEND VERIFICATION ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
};

// ----------------------
// 11. FORGOT PASSWORD
// ----------------------
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Имэйл оруулна уу." });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal if email exists for security
      return res.status(200).json({
        msg: "Хэрэв имэйл бүртгэлтэй бол нууц үг сэргээх имэйл илгээгдлээ."
      });
    }

    // Rate limiting: Check if last reset email was sent within 20 minutes
    if (user.lastResetEmailSent) {
      const timeSinceLastEmail = Date.now() - user.lastResetEmailSent.getTime();
      const twentyMinutesInMs = 20 * 60 * 1000;

      if (timeSinceLastEmail < twentyMinutesInMs) {
        const remainingTime = Math.ceil((twentyMinutesInMs - timeSinceLastEmail) / 60000);
        return res.status(429).json({
          msg: `Хэт олон хүсэлт илгээсэн байна. ${remainingTime} минутын дараа дахин оролдоно уу.`
        });
      }
    }

    // Generate reset token
    const resetToken = generateVerificationToken();
    const resetExpiry = getTokenExpiry();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiry: resetExpiry,
        lastResetEmailSent: new Date()
      }
    });

    // Send password reset email
    try {
      await sendPasswordResetEmail({
        email: user.email,
        fullName: user.fullName,
        resetToken
      });

      return res.status(200).json({
        msg: "Нууц үг сэргээх имэйл илгээгдлээ!"
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return res.status(500).json({ msg: "Имэйл илгээхэд алдаа гарлаа." });
    }
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
};

// ----------------------
// 12. RESET PASSWORD
// ----------------------
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ msg: "Бүх талбарыг бөглөнө үү." });
    }

    // Validate new password: minimum 8 characters, must contain number and letter
    if (newPassword.length < 8) {
      return res.status(400).json({ msg: "Нууц үг дор хаяж 8 тэмдэгттэй байх ёстой." });
    }

    const hasNumber = /\d/.test(newPassword);
    const hasLetter = /[a-zA-Z]/.test(newPassword);

    if (!hasNumber || !hasLetter) {
      return res.status(400).json({ msg: "Нууц үг үсэг болон тоо агуулсан байх ёстой." });
    }

    const user = await prisma.user.findFirst({
      where: { resetPasswordToken: token },
      include: { providerProfile: true }
    });

    if (!user) {
      return res.status(400).json({ msg: "Токен буруу эсвэл хүчингүй байна." });
    }

    // Check if token expired
    if (user.resetPasswordExpiry && user.resetPasswordExpiry < new Date()) {
      return res.status(400).json({ msg: "Токен хугацаа дууссан байна. Дахин илгээлгэнэ үү." });
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetPasswordToken: null,
        resetPasswordExpiry: null
      },
      include: { providerProfile: true }
    });

    return res.status(200).json({
      msg: "Нууц үг амжилттай солигдлоо!",
      user: updatedUser,
      token: generateToken(updatedUser)
    });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return res.status(500).json({ msg: "Сервер алдаа гарлаа." });
  }
};

// ----------------------
// 13. GOOGLE OAUTH CALLBACK
// ----------------------
export const googleCallback = async (req: any, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
    }

    // Generate JWT token
    const token = generateToken(user);

    // Log the login action
    await logLogin(user.id, { email: user.email, method: 'GOOGLE' });

    // Redirect to frontend with token
    return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (err) {
    console.error("GOOGLE CALLBACK ERROR:", err);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};
