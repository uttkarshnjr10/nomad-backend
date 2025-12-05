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


app.get("/api/chat/history/:room", async (req, res) => {
    try {
        const { room } = req.params;
        // Fetch last 50 messages, sorted by time
        const messages = await Message.find({ room })
            .sort({ timestamp: 1 }) 
            .limit(50);
        
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

// 3. Socket Logic
io.use(socketAuth);

io.on("connection", (socket) => {
    console.log(`🔌 Connected: ${socket.user.sub}`);

    socket.on("join_room", (room) => {
        socket.join(room);
        console.log(`Joined Room: ${room}`);
    });

    socket.on("send_message", async (data) => {
        const { room, message } = data;
        
        // save to DB
        const newMessage = await Message.create({
            sender: socket.user.sub, // username/Email from Token
            room: room,
            content: message,
            type: "TEXT"
        });

        // broadcast with the saved object 
        io.to(room).emit("receive_message", newMessage);
    });

    socket.on("change_theme", async (data) => {
        const { room, theme } = data;
        await Message.create({
            sender: socket.user.sub,
            room: room,
            content: theme,
            type: "THEME_CHANGE"
        });
        io.to(room).emit("theme_updated", { theme, updatedBy: socket.user.sub });
    });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log(` Chat Service running on port ${PORT}`);
});