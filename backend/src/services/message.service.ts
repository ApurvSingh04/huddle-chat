import { prisma } from "../config/database.config.js";
import { Env } from "../config/env-config.js"
import { BadRequestException } from "../utils/app-error.js";
import type { SendMessageSchemaType } from "../validators/message.validator.js";
import cloudinary from "../config/cloudinary.config.js";
import {
  emitLastMessageToParticipants,
  emitNewMessageToChatRoom,
} from "../lib/socket.js";
import {generateAiResponse } from "./ai.service.js"


export const sendMessageService = async (
  userId: string,
  body: SendMessageSchemaType
) => {
  const { chatId, content, image, replyToId } = body;

  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      participantIds: {
        has: userId,
      },
    },
  });

  if (!chat) {
    throw new BadRequestException("Chat not found or you are not a participant");
  }

  let imageUrl = image || null;

  if (image) {
    const uploadRes = await cloudinary.uploader.upload(image);
    imageUrl = uploadRes.secure_url;
  }

  const userMessage = await prisma.message.create({
    data: {
      content: content || null,
      image: imageUrl,
      chatId,
      senderId: userId,
      replyToId: replyToId || null,
    },
    include: {
      sender: {
        select: { id: true, name: true, avatar: true },
      },
      replyTo: {
        select: {
          content: true,
          image: true,
          sender: {
            select: { id: true, name: true, avatar: true },
          },
        },
      },
    },
  });

  await prisma.chat.update({
    where: { id: chatId },
    data: {
      lastMessageId: userMessage.id,
    },
  });

  emitNewMessageToChatRoom(userId, chatId, userMessage);
  const allParticipantIds = chat.participantIds;
  emitLastMessageToParticipants(allParticipantIds, chatId, userMessage);
  
  const aiUserId = Env.AI_USER_ID;

  if (aiUserId && chat.participantIds.includes(aiUserId) && userId !== aiUserId && content) {
    const aiUser = await prisma.user.findUnique({
      where: { id: aiUserId },
      select: { id: true }
    });

    if (aiUser) {
      processAiReply(chatId, content, aiUserId).catch((err) => {
        console.error("Failed to process AI reply", err);
      });
    }
  }

  return { message: userMessage };
};

async function processAiReply(chatId: string, prompt: string, aiUserId: string) {
  const aiTextResponse = await generateAiResponse(prompt);

  const aiMessage = await prisma.message.create({
    data: {
      content: aiTextResponse,
      chatId,
      senderId: aiUserId,
    },
    include: {
      sender: {
        select: { id: true, name: true, avatar: true },
      },
    },
  });

  const chat = await prisma.chat.update({
    where: { id: chatId },
    data: { lastMessageId: aiMessage.id },
  });
  emitNewMessageToChatRoom(aiUserId, chatId, aiMessage);
  emitLastMessageToParticipants(chat.participantIds, chatId, aiMessage);
}
