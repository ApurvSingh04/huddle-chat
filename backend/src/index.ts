import "dotenv/config"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { Env } from "./config/env-config.js";
import { HTTPSTATUS } from "./config/http-config.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import connectDatabase from "./config/database.config.js";

const app = express();

app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({extended: true}))
app.use(cors({
    origin: Env.FRONTEND_ORIGIN,
    credentials: true,
}));

app.get("/health", (req, res) => {
    return res.status(HTTPSTATUS.OK).json({
        message: "Health OK",
        status: "OK"
    })
});

app.use(errorHandler);

app.listen(Env.PORT, async () =>{
    await connectDatabase();
    console.log(`Server running on port ${Env.PORT} in ${Env.NODE_ENV} mode`)
});

