import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { Server, type Socket } from "socket.io";
import { Env } from "../config/env-config.js";
import { validateChatParticipant } from "../services/chat.service.js";
import { prisma } from "../config/database.config.js";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

let io: Server | null = null;

const onlineUsers = new Map<string, string>();

export const initializeSocket = (httpServer: HTTPServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: Env.FRONTEND_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;

      if (!rawCookie) return next(new Error("Unauthorized"));

      const match = rawCookie.match(/(?:^|;\s*)accessToken=([^;]+)/);
      const token = match ? match[1] : null;

      if (!token) return next(new Error("Unauthorized"));

      const decodedToken = jwt.verify(token, Env.JWT_SECRET) as {
        userId: string;
      };
      if (!decodedToken) return next(new Error("Unauthorized"));

      socket.userId = decodedToken.userId;
      next();
    } catch (error) {
      next(new Error("Internal server error"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    const newSocketId = socket.id;
    if (!socket.userId) {
      socket.disconnect(true);
      return;
    }

    onlineUsers.set(userId, newSocketId);

    io?.emit("online:users", Array.from(onlineUsers.keys()));

    socket.join(`user:${userId}`);

    socket.on(
      "chat:join",
      async (chatId: string, callback?: (err?: string) => void) => {
        try {
          await validateChatParticipant(chatId, userId);
          socket.join(`chat:${chatId}`);
          console.log(`User ${userId} join room chat:${chatId}`);

          callback?.();
        } catch (error) {
          callback?.("Error joining chat");
        }
      }
    );

    socket.on("chat:leave", (chatId: string) => {
      if (chatId) {
        socket.leave(`chat:${chatId}`);
        console.log(`User ${userId} left room chat:${chatId}`);
      }
    });

    socket.on("typing:start", (chatId: string) => {
      if (chatId) {
        socket.to(`chat:${chatId}`).emit("typing:start", { chatId, userId });
      }
    });

    socket.on("typing:stop", (chatId: string) => {
      if (chatId) {
        socket.to(`chat:${chatId}`).emit("typing:stop", { chatId, userId });
      }
    });

    socket.on(
      "message:read",
      async ({ chatId, messageIds }: { chatId: string; messageIds: string[] }) => {
        try {
          if (messageIds?.length > 0) {
            await prisma.$transaction(
              messageIds.map((id) =>
                prisma.message.update({
                  where: { id },
                  data: { readByIds: { push: userId } },
                })
              )
            );
            socket.to(`chat:${chatId}`).emit("message:read", {
              chatId,
              messageIds,
              readByUserId: userId,
            });
          }
        } catch (err) {
          console.error("Error updating read status", err);
        }
      }
    );

    socket.on("disconnect", () => {
      if (onlineUsers.get(userId) === newSocketId) {
        if (userId) onlineUsers.delete(userId);

        io?.emit("online:users", Array.from(onlineUsers.keys()));

        console.log("socket disconnected", {
          userId,
          newSocketId,
        });
      }
    });
  });
};

function getIO() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

export const emitNewChatToParticpants = (
  participantIds: string[] = [],
  chat: any
) => {
  const io = getIO();
  for (const participantId of participantIds) {
    io.to(`user:${participantId}`).emit("chat:new", chat);
  }
};

export const emitNewMessageToChatRoom = (
  senderId: string,
  chatId: string,
  message: any
) => {
  const io = getIO();
  const senderSocketId = onlineUsers.get(senderId?.toString());

  console.log(senderId, "senderId");
  console.log(senderSocketId, "sender socketid exist");
  console.log("All online users:", Object.fromEntries(onlineUsers));

  if (senderSocketId) {
    io.to(`chat:${chatId}`).except(senderSocketId).emit("message:new", message);
  } else {
    io.to(`chat:${chatId}`).emit("message:new", message);
  }
};

export const emitLastMessageToParticipants = (
  participantIds: string[],
  chatId: string,
  lastMessage: any
) => {
  const io = getIO();
  const payload = { chatId, lastMessage };

  for (const participantId of participantIds) {
    io.to(`user:${participantId}`).emit("chat:update", payload);
  }
};
