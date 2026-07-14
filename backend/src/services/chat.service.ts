import type { CreateChatSchemaType } from "../validators/chat.validator.js";
import { prisma } from "../config/database.config.js";
import { BadRequestException, NotFoundException } from "../utils/app-error.js";
// import { emitNewChatToParticpants } from "../lib/socket.js"; // Uncomment when socket is implemented

export const createChatService = async (
  userId: string,
  body: CreateChatSchemaType
) => {
  const { participantId, isGroup, participants, groupName } = body;

  let chat;
  let allParticipantIds: string[] = [];

  if (isGroup && participants?.length && groupName) {
    allParticipantIds = [userId, ...participants];
    chat = await prisma.chat.create({
      data: {
        participantIds: allParticipantIds,
        isGroup: true,
        groupName,
        createdById: userId,
      },
      include: {
        participants: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });
  } else if (participantId) {
    const otherUser = await prisma.user.findUnique({ where: { id: participantId } });
    if (!otherUser) throw new NotFoundException("User not found");

    allParticipantIds = [userId, participantId];
    
    // Find existing chat with exactly these two participants
    const existingChat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        participantIds: {
          hasEvery: allParticipantIds,
        },
      },
      include: {
        participants: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    if (existingChat) return existingChat;

    chat = await prisma.chat.create({
      data: {
        participantIds: allParticipantIds,
        isGroup: false,
        createdById: userId,
      },
      include: {
        participants: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });
  }

  // Implement websocket
  /*
  const particpantIdStrings = chat?.participants?.map((p) => p.id);
  if (particpantIdStrings) {
    // emitNewChatToParticpants(particpantIdStrings, chat);
  }
  */

  return chat;
};

export const getUserChatsService = async (userId: string) => {
  const chats = await prisma.chat.findMany({
    where: {
      participantIds: {
        has: userId,
      },
    },
    include: {
      participants: {
        select: { id: true, name: true, avatar: true },
      },
      lastMessage: {
        include: {
          sender: {
            select: { id: true, name: true, avatar: true },
          },
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
  return chats;
};

export const getSingleChatService = async (chatId: string, userId: string) => {
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      participantIds: {
        has: userId,
      },
    },
    include: {
      participants: {
        select: { id: true, name: true, avatar: true },
      },
    },
  });

  if (!chat) {
    throw new BadRequestException(
      "Chat not found or you are not authorized to view this chat"
    );
  }

  const messages = await prisma.message.findMany({
    where: { chatId },
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
    orderBy: {
      createdAt: 'asc',
    },
  });

  return {
    chat,
    messages,
  };
};

export const validateChatParticipant = async (
  chatId: string,
  userId: string
) => {
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      participantIds: {
        has: userId,
      },
    },
  });
  if (!chat) throw new BadRequestException("User not a participant in chat");
  return chat;
};
