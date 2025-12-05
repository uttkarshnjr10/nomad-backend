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
    console.log("SocketProvider effect: token:", token, "user:", user);

    if (token && user?.email && !socket) {
      const newSocket = io("http://localhost:4000", {
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
        console.error("⛔ connect_error:", err && err.message ? err.message : err);
      });

      newSocket.on("error", (err) => {
        console.error("⚠ socket error:", err);
      });

      newSocket.on("notification", (data) => {
        console.log("🔔 notification received:", data);
        const sender = data.senderEmail || data.sender;
        if (!sender) return;
        setUnreadMessages((prev) => ({ ...prev, [sender]: (prev[sender] || 0) + 1 }));
      });

      setSocket(newSocket);
    }

    if (!token && socket) {
      console.log("token cleared, disconnecting socket");
      socket.disconnect();
      setSocket(null);
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
