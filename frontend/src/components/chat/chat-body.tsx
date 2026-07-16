import { useChat } from "@/hooks/use-chat";
import { useSocket } from "@/hooks/use-socket";
import type { MessageType } from "@/types/chat.type";
import { useEffect, useRef } from "react";
import ChatBodyMessage from "./chat-body-message";
import { useAuth } from "@/hooks/use-auth";
import { mapIds } from "@/lib/helper";

interface Props {
  chatId: string | null;
  messages: MessageType[];
  onReply: (message: MessageType) => void;
}
const ChatBody = ({ chatId, messages, onReply }: Props) => {
  const { socket } = useSocket();
  const { addNewMessage, markMessagesAsRead } = useChat();
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chatId) return;
    if (!socket) return;

    const handleNewMessage = (msg: MessageType) => addNewMessage(chatId, mapIds(msg));

    socket.on("message:new", handleNewMessage);
    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [socket, chatId, addNewMessage]);

  useEffect(() => {
    if (!messages.length) return;
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

    if (socket && chatId && user?._id) {
      const unreadIds = messages
        .filter(
          (m) => m.sender?._id !== user._id && !m.readByIds?.includes(user._id)
        )
        .map((m) => m._id);

      if (unreadIds.length > 0) {
        socket.emit("message:read", { chatId, messageIds: unreadIds });
        markMessagesAsRead(chatId, unreadIds, user._id);
      }
    }
  }, [messages, socket, chatId, user, markMessagesAsRead]);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col px-3 py-2">
      {messages.map((message) => (
        <ChatBodyMessage
          key={message._id}
          message={message}
          onReply={onReply}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatBody;