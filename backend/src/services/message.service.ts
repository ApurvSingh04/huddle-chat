import { prisma } from "../config/database.config.js";
import { BadRequestException } from "../utils/app-error.js";
import type { SendMessageSchemaType } from "../validators/message.validator.js";

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

  const message = await prisma.message.create({
    data: {
      content: content ?? null,
      image: image ?? null,
      chatId,
      senderId: userId,
      replyToId: replyToId ?? null,
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
      lastMessageId: message.id,
    },
  });

  return { message };
};
