import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
    username: { type: String, required: true }, 
    content: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now }
});

const postSchema = new Schema(
    {
        userId: {
            type: String, 
            required: true,
            index: true
        },
        username: {
            type: String,
            required: true
        },
        contentUrl: {
            type: String, 
            required: true
        },
        caption: {
            type: String,
            trim: true
        },
        location: {
            type: {
                type: String,
                enum: ['Point'], 
                required: true
            },
            coordinates: {
                type: [Number], 
                required: true
            }
        },
        likes: [{ type: String }], 
        comments: [commentSchema],
        
        journey: [
            {
                city: String,
                arrivedAt: Date
            }
        ]
    },
    {
        timestamps: true
    }
);

postSchema.index({ location: "2dsphere" });

export const Post = mongoose.model("Post", postSchema);