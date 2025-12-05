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

app.use(cors({ origin: "*" }));
app.use(express.json());

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

connectDB();

// --------------------------
// CHAT HISTORY API
// --------------------------
app.get("/api/chat/history/:room", async (req, res) => {
    try {
        const { room } = req.params;
        console.log("🗂 Fetching chat history for ROOM:", room);
        const messages = await Message.find({ room }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        console.error("❌ History error:", error);
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

// --------------------------
// SOCKET.IO AUTH MIDDLEWARE
// --------------------------
io.use(socketAuth);

// --------------------------
// MAIN SOCKET LOGIC
// --------------------------
io.on("connection", (socket) => {
    console.log("=====================================");
    console.log("🔌 NEW SOCKET CONNECTED");
    console.log("Decoded Token User:", socket.user);
    console.log("Handshake Auth:", socket.handshake.auth);

    const userEmail = socket.user?.sub;
    const userId = socket.user?.userId;

    console.log(`📧 Connected Email: ${userEmail}`);
    console.log(`🆔 Connected User ID: ${userId}`);

    // Join a personal room (used for notifications)
    socket.join(userEmail);
    console.log(`📨 Joined personal notification room → ${userEmail}`);

    // --------------------------
    // JOIN ROOM
    // --------------------------
    socket.on("join_room", (room) => {
        console.log("🚪 JOIN_ROOM called with:", room);
        socket.join(room);
        console.log(`👥 ${userEmail} joined chat room: ${room}`);
    });

    // --------------------------
    // SEND MESSAGE
    // --------------------------
    socket.on("send_message", async (data) => {

        console.log("=====================================");
        console.log("📨 SEND_MESSAGE RECEIVED:");
        console.log("Raw Data:", data);

        try {
            const { room, message } = data;
            const senderEmail = userEmail;

            console.log("ROOM:", room);
            console.log("MESSAGE:", message);
            console.log("SENDER EMAIL:", senderEmail);

            // Save message
            const newMessage = await Message.create({
                sender: senderEmail,
                room,
                content: message,
                type: "TEXT",
                timestamp: new Date()
            });

            console.log("💾 Message saved:", newMessage);

            // Emit to people inside the room
            io.to(room).emit("receive_message", newMessage);
            console.log("📤 Broadcasted message to chat room:", room);

            // Determine recipient
            const parts = room.split("_");
            const recipientEmail = parts.find(email => email !== senderEmail);

            console.log("Recipient calculated:", recipientEmail);

            if (recipientEmail) {
                io.to(recipientEmail).emit("notification", {
                    senderEmail,
                    content: message,
                    room
                });
                console.log(`🔔 Notification sent to: ${recipientEmail}`);
            } else {
                console.log("⚠ No valid recipient found for this room.");
            }

        } catch (err) {
            console.error("❌ Error at send_message:", err);
        }
    });

});

// --------------------------
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Chat Service running on port ${PORT}`);
});
