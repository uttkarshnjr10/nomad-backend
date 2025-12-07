import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { FEED_LIMIT, FEED_RADIUS_DEFAULT } from "../constants.js";

class PostService {
    async createPost({ username, caption, filePath, lat, lng }) {
        const normalizedPath = filePath.replace(/\\/g, "/");
        
        const post = await Post.create({
            userId: username, 
            username,
            contentUrl: normalizedPath,
            caption,
            location: {
                type: "Point",
                coordinates: [lng, lat]
            },
            likes: [],
            comments: []
        });
        
        return post;
    }

    async getFeed({ lat, lng, radius = FEED_RADIUS_DEFAULT }) {
        return await Post.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    $maxDistance: radius
                }
            }
        })
        .sort({ createdAt: -1 })
        .limit(FEED_LIMIT);
    }

    async toggleLike(postId, username) {
        const post = await Post.findById(postId);
        if (!post) throw new ApiError(404, "Post not found");

        const isLiked = post.likes.includes(username);
        
        if (isLiked) {
            post.likes.pull(username);
        } else {
            post.likes.push(username);
        }
        
        await post.save();
        
        return {
            likesCount: post.likes.length,
            isLiked: !isLiked,
            likes: post.likes
        };
    }

    async addComment(postId, username, content) {
        const post = await Post.findByIdAndUpdate(
            postId,
            {
                $push: {
                    comments: {
                        username,
                        content,
                        createdAt: new Date()
                    }
                }
            },
            { new: true }
        );

        if (!post) throw new ApiError(404, "Post not found");
        return post.comments;
    }
}

export const postService = new PostService();