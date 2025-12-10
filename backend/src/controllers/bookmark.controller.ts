import { Request, Response } from "express";
import { prisma } from "../config/db";

// ----------------------
// 1. ADD BOOKMARK
// ----------------------
export const addBookmark = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { providerId } = req.body;

    if (!providerId) {
      return res.status(400).json({ msg: "Provider ID шаардлагатай." });
    }

    // Check if user is a customer
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { providerProfile: true },
    });

    if (user?.role === "PROVIDER") {
      return res.status(403).json({ msg: "Зөвхөн хэрэглэгчид бизнес хадгалах боломжтой." });
    }

    // Check if provider exists
    const provider = await prisma.businessProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return res.status(404).json({ msg: "Бизнес олдсонгүй." });
    }

    // Check if already bookmarked (handled by unique constraint, but check first for better error message)
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_providerId: {
          userId,
          providerId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ msg: "Та энэ бизнесийг аль хэдийн хадгалсан байна." });
    }

    // Create bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        userId,
        providerId,
      },
    });

    res.status(201).json({
      msg: "Бизнес амжилттай хадгалагдлаа!",
      bookmark,
    });
  } catch (error: any) {
    console.error("Add bookmark error:", error.message);
    res.status(500).json({ msg: "Бизнес хадгалахад алдаа гарлаа." });
  }
};

// ----------------------
// 2. REMOVE BOOKMARK
// ----------------------
export const removeBookmark = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { providerId } = req.params;

    // Find bookmark
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_providerId: {
          userId,
          providerId,
        },
      },
    });

    if (!bookmark) {
      return res.status(404).json({ msg: "Хадгалсан бизнес олдсонгүй." });
    }

    // Delete bookmark
    await prisma.bookmark.delete({
      where: { id: bookmark.id },
    });

    res.json({ msg: "Бизнес хадгалгаас хасагдлаа." });
  } catch (error: any) {
    console.error("Remove bookmark error:", error.message);
    res.status(500).json({ msg: "Бизнес хасахад алдаа гарлаа." });
  }
};

// ----------------------
// 3. GET USER'S BOOKMARKS
// ----------------------
export const getBookmarks = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        provider: {
          include: {
            user: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
            services: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ bookmarks });
  } catch (error: any) {
    console.error("Get bookmarks error:", error.message);
    res.status(500).json({ msg: "Хадгалсан бизнесүүд татахад алдаа гарлаа." });
  }
};

// ----------------------
// 4. CHECK IF BOOKMARKED
// ----------------------
export const checkBookmark = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { providerId } = req.params;

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_providerId: {
          userId,
          providerId,
        },
      },
    });

    res.json({ isBookmarked: !!bookmark });
  } catch (error: any) {
    console.error("Check bookmark error:", error.message);
    res.status(500).json({ msg: "Шалгахад алдаа гарлаа." });
  }
};

// ----------------------
// 5. GET BOOKMARK COUNT FOR PROVIDER
// ----------------------
export const getBookmarkCount = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;

    const count = await prisma.bookmark.count({
      where: { providerId },
    });

    res.json({ count });
  } catch (error: any) {
    console.error("Get bookmark count error:", error.message);
    res.status(500).json({ msg: "Тоо тоолоход алдаа гарлаа." });
  }
};
