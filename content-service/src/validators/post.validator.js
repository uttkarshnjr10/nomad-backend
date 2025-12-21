import { z } from "zod";

export const createPostSchema = z.object({
    caption: z.string().optional(),
    latitude: z.string().transform((val) => parseFloat(val)).refine((val) => !isNaN(val), "Invalid latitude"),
    longitude: z.string().transform((val) => parseFloat(val)).refine((val) => !isNaN(val), "Invalid longitude"),
});

export const commentSchema = z.object({
    content: z.string().min(1, "Comment cannot be empty").max(500, "Comment too long"),
});

export const queryFeedSchema = z.object({
    lat: z.string().transform((val) => parseFloat(val)),
    lng: z.string().transform((val) => parseFloat(val)),
    radius: z.string().optional().transform((val) => val ? parseInt(val) : undefined),
});