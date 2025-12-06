import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: { type: String, required: true }, 
    room: { type: String, required: true },   
    content: { type: String, required: true },
    type: { 
        type: String, 
        enum: ["TEXT", "THEME_CHANGE"], 
        default: "TEXT" 
    },
    timestamp: { type: Date, default: Date.now }
});

messageSchema.index({ room: 1, timestamp: 1 });

export const Message = mongoose.model("Message", messageSchema);