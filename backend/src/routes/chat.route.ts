import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config.js";
import {
  createChatController,
  getSingleChatController,
  getUserChatsController,
} from "../controllers/chat.controller.js";
// import { sendMessageController } from "../controllers/message.controller.js";

const chatRoutes = Router()
  .use(passportAuthenticateJwt)
  .post("/create", createChatController)
  // .post("/message/send", sendMessageController) // Uncomment when message controller is implemented
  .get("/all", getUserChatsController)
  .get("/:id", getSingleChatController);

export default chatRoutes;
