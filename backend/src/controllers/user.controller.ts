import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { HTTPSTATUS } from "../config/http-config.js";
import { findByIdUserService, getUsersService, updateAvatarService } from "../services/user.service.js";

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

export const updateAvatarController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const { avatar } = req.body;
    
    const user = await updateAvatarService(userId, avatar);

    return res.status(HTTPSTATUS.OK).json({
      message: "Avatar updated successfully",
      user,
    });
  }
);