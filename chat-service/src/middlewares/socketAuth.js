import jwt from "jsonwebtoken";

export const socketAuth = (socket, next) => {
  try {
   // console.log(" socketAuth called, handshake.auth:", socket.handshake.auth);

    const token = socket.handshake.auth?.token;
    if (!token) {
     // console.log(" socketAuth: No token provided in handshake.auth");
      return next(new Error("Not authorized: no token"));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
   //   console.log(" socketAuth: JWT verify failed ->", err.message);
      return next(new Error("Invalid token"));
    }

    //console.log(" socketAuth: decoded token:", decoded);

    socket.user = {
      sub: decoded.sub,
      userId: decoded.userId,
      email: decoded.sub,
    };

    return next();
  } catch (err) {
   // console.log(" socketAuth unexpected error:", err);
    return next(new Error("Authentication error"));
  }
};
