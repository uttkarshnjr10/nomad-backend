import express from "express";
import cors from "cors";
import helmet from "helmet";

import postRouter from './routes/post.routes.js';

const app = express();

app.use(helmet({
    crossOriginResourcePolicy: false,
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use("/public", express.static("public"));

app.use("/api/v1/posts", postRouter);

export { app };