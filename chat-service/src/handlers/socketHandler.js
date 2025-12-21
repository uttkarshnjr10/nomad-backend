import { Message } from "../models/message.model.js";

export const handleSocketConnection = (io, socket) => {
    const userEmail = socket.user?.sub;

    socket.join(userEmail);

    socket.on("join_room", (room) => {
        socket.join(room);
    });

    socket.on("typing", (data) => {
        const { receiver } = data;
        if (receiver) {
            io.to(receiver).emit("typing", data);
        }
    });

    socket.on("send_message", async (data) => {
        try {
            const { room, message, localId } = data;
            const senderEmail = userEmail;

            const newMessage = await Message.create({
                sender: senderEmail,
                room,
                content: message,
                type: "TEXT",
                timestamp: new Date()
            });

            const messageToSend = newMessage.toObject ? newMessage.toObject() : newMessage;
            messageToSend.localId = localId;

            io.to(room).emit("receive_message", messageToSend);

            const parts = room.split("--");
            if (parts.length === 2) {
                const recipientEmail = parts.find(email => email !== senderEmail);
                if (recipientEmail && recipientEmail !== senderEmail) {
                    io.to(recipientEmail).emit("notification", {
                        senderEmail,
                        content: message,
                        room
                    });
                }
            }
        } catch (err) {
            console.error("send_message error:", err);
        }
    });
};