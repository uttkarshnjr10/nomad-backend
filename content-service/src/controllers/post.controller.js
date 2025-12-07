import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { postService } from "../services/post.service.js";
import { createPostSchema, commentSchema, queryFeedSchema } from "../validators/post.validator.js";
import { MESSAGES } from "../constants.js";

const createPost = asyncHandler(async (req, res) => {
    // validation
    const validation = createPostSchema.safeParse(req.body);
    if (!validation.success) {
        throw new ApiError(400, validation.error.errors[0].message);
    }
    
    if (!req.file) throw new ApiError(400, "Media file is required");

    const normalizedPath = req.file.path.replace(/\\/g, "/");

    // service Call
    const post = await postService.createPost({
        username: req.user.username,
        caption: validation.data.caption,
        filePath: normalizedPath, 
        lat: validation.data.latitude,
        lng: validation.data.longitude
    });

    return res.status(201).json(
        new ApiResponse(201, post, MESSAGES.POST_CREATED)
    );
});

const getFeed = asyncHandler(async (req, res) => {
    const validation = queryFeedSchema.safeParse(req.query);
    if (!validation.success) throw new ApiError(400, "Invalid location coordinates");

    const posts = await postService.getFeed(validation.data);

    return res.status(200).json(
        new ApiResponse(200, posts, MESSAGES.POST_FOUND)
    );
});

const toggleLike = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const result = await postService.toggleLike(postId, req.user.username);
    
    return res.status(200).json(
        new ApiResponse(200, result, result.isLiked ? MESSAGES.LIKE_ADDED : MESSAGES.LIKE_REMOVED)
    );
});

const addComment = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const validation = commentSchema.safeParse(req.body);
    
    if (!validation.success) throw new ApiError(400, validation.error.errors[0].message);

    const comments = await postService.addComment(postId, req.user.username, validation.data.content);

    return res.status(200).json(
        new ApiResponse(200, comments, MESSAGES.COMMENT_ADDED)
    );
});

export { createPost, getFeed, toggleLike, addComment };