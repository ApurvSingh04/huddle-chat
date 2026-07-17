import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";
import { loginService, registerService } from "../services/auth.service.js";
import { clearJwtAuthCookie, setJwtAuthCookie } from "../utils/cookie.js";
import { HTTPSTATUS } from "../config/http-config.js";

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body;

    const user = await registerService(body);
    const userId = user.id;
    const tokenVersion = user.tokenVersion;

    const { res: cookieRes, token } = setJwtAuthCookie({
      res,
      userId,
      tokenVersion,
    });
    
    return cookieRes
      .status(HTTPSTATUS.CREATED)
      .json({
        message: "User created & login successfully",
        user,
        token,
      });
  }
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body;

    const user = await loginService(body);
    const userId = user.id;
    const tokenVersion = user.tokenVersion;
    
    const { res: cookieRes, token } = setJwtAuthCookie({
      res,
      userId,
      tokenVersion,
    });
    
    return cookieRes
      .status(HTTPSTATUS.OK)
      .json({
        message: "User login successfully",
        user,
        token,
      });
  }
);

export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    return clearJwtAuthCookie(res).status(HTTPSTATUS.OK).json({
      message: "User logout successfully",
    });
  }
);

export const authStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    return res.status(HTTPSTATUS.OK).json({
      message: "Authenticated User",
      user,
    });
  }
);