import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { 
    createPost, 
    getFeed, 
    toggleLike, 
    addComment 
} from "../controllers/post.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
    .post(upload.single("file"), createPost);

router.route("/feed")
    .get(getFeed);

router.route("/:postId/like")
    .post(toggleLike);

router.route("/:postId/comment")
    .post(addComment);

export default router;