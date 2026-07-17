import { type Request, type Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { HTTPSTATUS } from "../config/http-config.js";
import { prisma } from "../config/database.config.js";
import { Env } from "../config/env-config.js";
import bcrypt from "bcryptjs";

export const startAiChatController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id as string;

    if (!Env.AI_USER_ID) {
      return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message: "AI configuration is missing on the server.",
      });
    }

    let aiUser = await prisma.user.findUnique({
      where: { id: Env.AI_USER_ID },
    });

    if (!aiUser) {
      const password = process.env.AI_USER_PASSWORD || "secure-random-password-123!";
      const hashedPassword = await bcrypt.hash(password, 10);
      
      aiUser = await prisma.user.create({
        data: {
          id: Env.AI_USER_ID, 
          name: "Huddle AI",
          email: "ai@huddle.com",
          password: hashedPassword,
          avatar: "",
        },
      });
    }

    let chat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        participantIds: {
          hasEvery: [userId, aiUser.id],
        },
      },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          isGroup: false,
          participantIds: [userId, aiUser.id],
          createdById: userId,
        },
      });
    }

    return res.status(HTTPSTATUS.OK).json({
      message: "AI Chat initialized",
      chatId: chat.id,
      aiUser: {
        id: aiUser.id,
        name: aiUser.name,
        avatar: aiUser.avatar,
      },
    });
  }
);