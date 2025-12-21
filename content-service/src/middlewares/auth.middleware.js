import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized: No token provided");
        }

        const secretKey = process.env.JWT_SECRET;

        const decodedToken = jwt.verify(token, secretKey);

        req.user = {
            username: decodedToken.sub,
        };

        next();
    } catch (error) {
        console.log("JWT Verification Failed:", error.message);
        throw new ApiError(401, "Invalid or expired token");
    }
});
