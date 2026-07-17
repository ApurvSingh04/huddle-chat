import jwt from "jsonwebtoken";
import type { Response } from "express";
import { Env } from "../config/env-config.js";

type Time = `${number}${"s" | "m" | "h" | "d" | "w" | "y"}`;
type Cookie = {
  res: Response;
  userId: string;
  tokenVersion: number;
};

export const setJwtAuthCookie = ({ res, userId, tokenVersion }: Cookie) => {
    const payload = { userId, tokenVersion };
    const expiresIn = Env.JWT_EXPIRES_IN as Time;
    const token = jwt.sign(payload, Env.JWT_SECRET, {
    audience: ["user"],
    expiresIn: expiresIn || "7d",
    });

    res.cookie("accessToken", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: Env.NODE_ENV === "production",
    sameSite: Env.NODE_ENV === "production" ? "none" : "lax",
    });

    return { res, token };
};

export const clearJwtAuthCookie = (res: Response) =>
  res.clearCookie("accessToken", { 
    path: "/",
    secure: Env.NODE_ENV === "production",
    sameSite: Env.NODE_ENV === "production" ? "none" : "lax",
  });
