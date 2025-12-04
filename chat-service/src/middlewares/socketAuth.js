import jwt from "jsonwebtoken";

export const socketAuth = (socket, next) => {
    
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error("Authentication error: No Token"));
    }

    try {
      
        const secretKey = Buffer.from(process.env.JWT_SECRET, "base64");
        
        const decoded = jwt.verify(token, secretKey);
      
        socket.user = decoded; 
        next();
    } catch (err) {
        console.log("Socket Auth Failed:", err.message);
        next(new Error("Authentication error: Invalid Token"));
    }
};