import { Router } from "express";
import {
  loginController,
  logoutController,
  registerController,
  authStatusController,
} from "../controllers/auth.controller.js";
import { passportAuthenticateJwt } from "../config/passport.config.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";

const authRoutes = Router()
  .post("/register", validate(registerSchema), registerController)
  .post("/login", validate(loginSchema), loginController)
  .post("/logout", logoutController)
  .get("/status", passportAuthenticateJwt, authStatusController);

export default authRoutes;