import { type Request, type Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { sendMessageSchema } from "../validators/message.validator.js";
import { HTTPSTATUS } from "../config/http-config.js";
import { sendMessageService } from "../services/message.service.js";

export const sendMessageController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const body = sendMessageSchema.parse(req.body);

    const result = await sendMessageService(userId, body);

    return res.status(HTTPSTATUS.OK).json({
        message: "Message sent successfully",
    });
  }
);
