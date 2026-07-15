import { prisma } from "../config/database.config.js";
import { BadRequestException } from "../utils/app-error.js";
import type { SendMessageSchemaType } from "../validators/message.validator.js";
import cloudinary from "../config/cloudinary.config.js";

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
    // upload the image to cloudinary
    const uploadRes = await cloudinary.uploader.upload(image);
    imageUrl = uploadRes.secure_url;
  }

  const message = await prisma.message.create({
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
      lastMessageId: message.id,
    },
  });

  return { message };
};
