import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db/index.js";
import { socketAuth } from "./middlewares/socketAuth.js";
import { Message } from "./models/message.model.js";

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

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true
    }
});

connectDB();

app.get("/api/chat/history/:room", async (req, res) => {
    try {
        const { room } = req.params;
       
        const messages = await Message.find({ room })
            .sort({ timestamp: 1 })
            .limit(500) 
            .lean();
            
        res.json(messages);
    } catch (error) {
        console.error("History fetch error:", error);
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

io.use(socketAuth);

io.on("connection", (socket) => {
    const userEmail = socket.user?.sub;

    socket.join(userEmail);

    socket.on("join_room", (room) => {
        socket.join(room);
    });

    socket.on("send_message", async (data) => {
        try {
            const { room, message } = data;
            const senderEmail = userEmail;

            const newMessage = await Message.create({
                sender: senderEmail,
                room,
                content: message,
                type: "TEXT",
                timestamp: new Date()
            });

            io.to(room).emit("receive_message", newMessage);

            const parts = room.split("--");
            const recipientEmail = parts.find(email => email !== senderEmail);

            if (recipientEmail) {
                io.to(recipientEmail).emit("notification", {
                    senderEmail,
                    content: message,
                    room
                });
            }
        } catch (err) {
            console.error("send_message error:", err);
        }
    });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log(`Chat Service running on port ${PORT}`);
});