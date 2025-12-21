import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
});

const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(` Content Service running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log(" MongoDB Connection failed !!! ", err);
    });