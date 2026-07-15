import "dotenv/config";
import path from "path";
import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import passport from "passport";
import { Env } from "./config/env-config.js";
import { asyncHandler } from "./middlewares/asyncHandler.middleware.js";
import { HTTPSTATUS } from "./config/http-config.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import connectDatabase from "./config/database.config.js";
import { initializeSocket } from "./lib/socket.js"
import appRoutes from "./routes/index.js";
import "./config/passport.config.js";

const app = express();
const server = http.createServer(app);

//socket
initializeSocket(server);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: Env.FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.use(passport.initialize());

app.get(
  "/health",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(HTTPSTATUS.OK).json({
      message: "Server is healthy",
      status: "OK",
    });
  })
);

app.use("/api", appRoutes);

if (Env.NODE_ENV === "production") {
  const clientPath = path.resolve(process.cwd(), "../client/dist");

  //Serve static files
  app.use(express.static(clientPath));

  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

app.use(errorHandler);

server.listen(Env.PORT, async () => {
  await connectDatabase();
  console.log(`Server running on port ${Env.PORT} in ${Env.NODE_ENV} mode`);
});