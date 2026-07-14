import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { HTTPSTATUS } from "../config/http-config.js";
import { findByIdUserService, getUsersService } from "../services/user.service.js";

export const userProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    
    const user = await findByIdUserService(userId as string);

    return res.status(HTTPSTATUS.OK).json({
      message: "User profile retrieved successfully",
      user,
    });
  }
);

export const getUsersController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    
    const users = await getUsersService(userId as string);

    return res.status(HTTPSTATUS.OK).json({
      message: "Users retrieved successfully",
      users,
    });
  }
);