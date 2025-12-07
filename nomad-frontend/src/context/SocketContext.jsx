import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import io from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth(); 
  const [socket, setSocket] = useState(null);

  useEffect(() => {
  
    if (!user || !token) return;

    const SOCKET_URL = import.meta.env.VITE_CHAT_SOCKET_URL || "http://localhost:4000"; 
    //console.log("🔌 Attempting to connect to Socket at:", SOCKET_URL);

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      auth: {
        token: token 
      },
      
      transports: ["websocket", "polling"], 
    });

    // 3. Add Event Listeners for Debugging
    newSocket.on("connect", () => {
      //console.log("✅ Socket Connected! ID:", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
     // console.error("❌ Socket Connection Error:", err.message);
      
    });

    newSocket.on("disconnect", (reason) => {
      //console.warn("⚠️ Socket Disconnected:", reason);
    });

    setSocket(newSocket);

    return () => {
      //console.log("🛑 Cleaning up socket connection...");
      newSocket.close();
      setSocket(null);
    };
  }, [user, token]); 

  const clearUnread = useCallback((friendEmail) => {
      if(socket) socket.emit("clear_unread", { friendEmail });
  }, [socket]);

  const value = useMemo(() => ({
    socket,
    clearUnread
  }), [socket, clearUnread]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};