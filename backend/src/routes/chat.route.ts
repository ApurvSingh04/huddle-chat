import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config.js";
import {
  createChatController,
  getSingleChatController,
  getUserChatsController,
} from "../controllers/chat.controller.js";
import { sendMessageController } from "../controllers/message.controller.js";
import { startAiChatController } from "../controllers/ai.controller.js";
const chatRoutes = Router()
  .use(passportAuthenticateJwt)
  .post("/create", createChatController)
  .post("/message/send", sendMessageController) 
  .post("/ai", startAiChatController)
  .get("/all", getUserChatsController)
  .get("/:id", getSingleChatController);

export default chatRoutes;
