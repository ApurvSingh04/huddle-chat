import type { Request, Response, NextFunction } from "express";

type AsyncHandlerMiddleware = (
    req: Request, 
    res: Response, 
    next: NextFunction
) => Promise<void>;

export const asyncHandler = (fn: AsyncHandlerMiddleware) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            next(error);
        }
    };
};  