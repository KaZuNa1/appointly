// ========================================
// Auth Service
// Business logic (DB operations only)
// ========================================

import { prisma } from "../config/db";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export class AuthService {

  // REGISTER CUSTOMER
  static async registerUser(fullName: string, email: string, password: string) {
    // Check if email already exists
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new Error("Энэ имэйл бүртгэлтэй байна.");
    }

    const hashed = await bcrypt.hash(password, 10);

    // Create user
    return prisma.user.create({
      data: {
        fullName,
        email,
        password: hashed,
        role: Role.CUSTOMER,
      },
    });
  }

  // REGISTER BUSINESS PROVIDER
  static async registerBusiness(
    fullName: string,
    email: string,
    password: string,
    businessName: string,
    category: string,
    phone?: string
  ) {
    // Check if email already exists
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new Error("Энэ имэйлтэй бизнес эсвэл хэрэглэгч аль хэдийн бүртгэлтэй байна.");
    }

    const hashed = await bcrypt.hash(password, 10);

    // Create user entry with PROVIDER role
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashed,
        role: Role.PROVIDER,
      },
    });

    // Create provider profile
    await prisma.businessProvider.create({
      data: {
        userId: user.id,
        businessName,
        nickname: businessName, // Use businessName as default nickname
        category,
        phone,
      },
    });

    return user;
  }

  // LOGIN (both customer + provider)
  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        providerProfile: true,
      },
    });

    if (!user) {
      throw new Error("Имэйл эсвэл нууц үг буруу байна.");
    }

    // Check if user has a password (not Google OAuth user)
    if (!user.password) {
      throw new Error("Энэ имэйл Google-ээр бүртгэгдсэн байна. Google-ээр нэвтэрнэ үү.");
    }

    const passOk = await bcrypt.compare(password, user.password);
    if (!passOk) {
      throw new Error("Имэйл эсвэл нууц үг буруу байна.");
    }

    return user;
  }

}
