import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { createPost, getFeed, toggleLike } from "../controllers/post.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
    .post(upload.single("file"), createPost);

router.route("/feed")
    .get(getFeed);

router.route("/:postId/like")
    .post(toggleLike);

export default router;