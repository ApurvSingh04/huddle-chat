import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config.js";
import { getUsersController, updateAvatarController } from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updateAvatarSchema } from "../validators/user.validator.js";

const userRoutes = Router()
  .use(passportAuthenticateJwt)
  .get("/all", getUsersController)
  .put("/avatar", validate(updateAvatarSchema), updateAvatarController);

export default userRoutes;
