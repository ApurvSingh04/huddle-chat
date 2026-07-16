import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { UnauthorizedException } from "../utils/app-error.js";
import { Env } from "./env-config.js";
import { findByIdUserService } from "../services/user.service.js";
import type { Request } from "express";

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const token = req?.cookies?.accessToken;
          if (!token) return null;
          return token;
        },
      ]),
      secretOrKey: Env.JWT_SECRET,
      audience: ["user"],
      algorithms: ["HS256"],
    },
    async ({ userId }, done) => {
      try {
        if (!userId) {
          return done(null, false);
        }
        
        const user= userId && (await findByIdUserService(userId));
        
        return done(null, user || false);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export const passportAuthenticateJwt = passport.authenticate("jwt", {
  session: false,
});
