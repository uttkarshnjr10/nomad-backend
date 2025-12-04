import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { socketAuth } from "./middlewares/socketAuth.js";
import { Message } from "./models/message.model.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

connectDB();

io.use(socketAuth);

io.on("connection", (socket) => {
    console.log(`🔌 User Connected: ${socket.user.sub} (Socket ID: ${socket.id})`);

    socket.on("join_room", (room) => {
        socket.join(room);
        console.log(`User ${socket.user.sub} joined room: ${room}`);
    });
e
    socket.on("send_message", async (data) => {
       
        const { room, message } = data;

        // Save to DB
        const newMessage = await Message.create({
            sender: socket.user.sub,
            room: room,
            content: message,
            type: "TEXT"
        });

        // Broadcast to everyone in that room including sender
        io.to(room).emit("receive_message", newMessage);
    });

    // Theme Switching
    socket.on("change_theme", async (data) => {
        const { room, theme } = data;
        // Save this system event to DB history
        await Message.create({
            sender: socket.user.sub,
            room: room,
            content: theme,
            type: "THEME_CHANGE"
        });

        // Broadcast "theme_updated" to everyone so their UI changes color instantly
        io.to(room).emit("theme_updated", { theme, updatedBy: socket.user.sub });
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log(` Chat Service running on port ${PORT}`);
});