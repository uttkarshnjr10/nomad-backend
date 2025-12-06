import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState({});
  const totalUnread = Object.values(unreadMessages).reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }

    if (token && user?.email) {
      console.log("Initializing socket...");
      
      const newSocket = io(import.meta.env.VITE_CHAT_SOCKET_URL, {
        auth: { token },
        transports: ["websocket"], 
        upgrade: true,
      });

      newSocket.on("connect", () => {
        console.log("🟢 Socket connected:", newSocket.id);
        setIsConnected(true);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("🔴 Socket disconnected:", reason);
        setIsConnected(false);
      });

      newSocket.on("connect_error", (err) => {
        console.error("⚠ connect_error:", err.message);
      });

      newSocket.on("notification", (data) => {
        console.log("🔔 Notification:", data);
        const sender = data.senderEmail || data.sender;
        if (!sender) return;
        setUnreadMessages((prev) => ({ ...prev, [sender]: (prev[sender] || 0) + 1 }));
      });

      setSocket(newSocket);

      return () => {
        console.log("Cleaning up socket...");
        newSocket.disconnect();
      };
    }
  }, [token, user]); 

  const clearUnread = (friendEmail) => {
    setUnreadMessages((prev) => {
      const next = { ...prev };
      delete next[friendEmail];
      return next;
    });
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, totalUnread, clearUnread }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);