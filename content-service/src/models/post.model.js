import mongoose, { Schema } from "mongoose";

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
        fuel: {
            likes: { type: Number, default: 0 },
            comments: { type: Number, default: 0 },
            shares: { type: Number, default: 0 }
        },

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