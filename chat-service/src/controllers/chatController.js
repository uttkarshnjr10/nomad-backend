import { Message } from "../models/message.model.js";

export const getChatHistory = async (req, res) => {
    try {
        const { room } = req.params;
        const { before } = req.query;
        const limit = 20;

        const query = { room };

        if (before) {
            query.timestamp = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean();

        res.json(messages.reverse());
    } catch (error) {
        console.error("History error:", error);
        res.status(500).json({ error: "Failed to fetch history" });
    }
};