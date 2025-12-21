import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db/index.js";
import { socketAuth } from "./middlewares/socketAuth.js";
import chatRoutes from "./routes/chatRoutes.js";
import { handleSocketConnection } from "./handlers/socketHandler.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

    app.use(
        cors({
            origin: process.env.CLIENT_URL,
            credentials: true
        })
    );

    app.use(express.json());

    app.use("/api/chat", chatRoutes);

    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    connectDB();

    io.use(socketAuth);

    io.on("connection", (socket) => {
        handleSocketConnection(io, socket);
    });

    const PORT = process.env.PORT || 4000;
    httpServer.listen(PORT, () => {
        console.log(`Chat Service running on port ${PORT}`);
    });