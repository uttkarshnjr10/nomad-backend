import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Post } from "../models/post.model.js";

const createPost = asyncHandler(async (req, res) => {
    const { caption, latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        throw new ApiError(400, "GPS Coordinates are required");
    }

    const localFilePath = req.file?.path;
    if (!localFilePath) {
        throw new ApiError(400, "Image/Video file is required");
    }

    const post = await Post.create({
        userId: req.user.username,
        username: req.user.username,
        contentUrl: localFilePath,
        caption,
        location: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        fuel: { likes: 0, comments: 0, shares: 0 }
    });

    return res.status(201).json(
        new ApiResponse(201, post, "Drop created successfully!")
    );
});

const getFeed = asyncHandler(async (req, res) => {
    const { lat, lng, radius = 5000 } = req.query;

    if (!lat || !lng) {
        throw new ApiError(400, "Current location (lat, lng) is required to view the feed");
    }

    const posts = await Post.find({
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [parseFloat(lng), parseFloat(lat)]
                },
                $maxDistance: parseInt(radius)
            }
        }
    });

    return res.status(200).json(
        new ApiResponse(200, posts, `Found ${posts.length} drops near you`)
    );
});

const toggleLike = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    if (!mongoose.isValidObjectId(postId)) {
        throw new ApiError(400, "Invalid Post ID");
    }

    
    const post = await Post.findByIdAndUpdate(
        postId,
        { 
            $inc: { "fuel.likes": 1 } // Increment likes by 1
        },
        { new: true } // Return the updated document
    );

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    return res.status(200).json(
        new ApiResponse(200, post, "Fuel added! (+1km range)")
    );
});

export { createPost, getFeed, toggleLike };