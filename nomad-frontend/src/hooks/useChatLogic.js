import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import getRoomId from "../utils/getRoomId";
import { friendApi } from "../services/api";

export default function useChatLogic() {
  const { user, token } = useAuth();
  const { socket, clearUnread } = useSocket();

  const [dark, setDark] = useState(() => localStorage.getItem("nomad_dark") === "1");
  const [activeFriend, setActiveFriend] = useState(() => {
    const saved = localStorage.getItem("nomad_active_chat");
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      return { email: parsed.friendEmail, username: parsed.username || parsed.friendEmail };
    } catch {
      return null;
    }
  });

  const [friends, setFriends] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const typingTimer = useRef(null);
  const messagesEndRef = useRef(null);
  const friendsListRef = useRef(null);

  const scrollMessagesToBottom = (smooth = true) => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("nomad_dark", dark ? "1" : "0");
  }, [dark]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await friendApi.getFriends();
        setFriends(res.data || []);
        // console.log("friends loaded");
      } catch {}
    };
    fetchFriends();
  }, []);

  const getHistory = useCallback(
    async (roomId) => {
      try {
        const API = import.meta.env.VITE_API_URL;
        const res = await axios.get(`${API}/api/chat/history/${encodeURIComponent(roomId)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data || []);
        setTimeout(() => scrollMessagesToBottom(false), 50);
        // console.log("history loaded");
      } catch {}
    },
    [token]
  );

  useEffect(() => {
    if (!activeFriend?.email || !user?.email) return;

    const roomId = getRoomId(user.email, activeFriend.email);
    getHistory(roomId);

    if (!socket) return;

    socket.emit("join_room", roomId);
    // console.log("joined room", roomId);

    const handleReceive = (newMsg) => {
      setMessages((prev) => {
        const localMatchIndex = prev.findIndex(
          (m) => m.localId && m.localId === newMsg.localId
        );

        if (localMatchIndex !== -1) {
          const copy = [...prev];
          copy[localMatchIndex] = newMsg;
          return copy;
        }

        if (newMsg._id && prev.some((m) => m._id === newMsg._id)) return prev;

        if (
          prev.some(
            (m) =>
              m.content === newMsg.content &&
              Math.abs(new Date(m.timestamp) - new Date(newMsg.timestamp)) < 1000
          )
        ) {
          return prev;
        }

        return [...prev, newMsg];
      });

      setTimeout(() => scrollMessagesToBottom(true), 50);
      // console.log("message received");
    };

    const handleTyping = (data) => {
      if (data?.sender === activeFriend.email) {
        setIsTyping(true);
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setIsTyping(false), 1200);
      }
    };

    socket.on("receive_message", handleReceive);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("typing", handleTyping);
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, [activeFriend, user, socket, getHistory]);

  const sendMessage = (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!message.trim() || !socket || !activeFriend?.email) return;

    const room = getRoomId(user.email, activeFriend.email);
    const localId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const msgData = {
      room,
      message,
      sender: user.email,
      timestamp: new Date().toISOString(),
      localId,
      content: message,
    };

    setMessages((prev) => [...prev, msgData]);

    setMessage("");
    scrollMessagesToBottom(true);

    socket.emit("send_message", msgData);
    // console.log("sent", localId);
  };

  const handleTyping = () => {
    if (!socket || !activeFriend?.email || !user?.email) return;
    socket.emit("typing", { sender: user.email, receiver: activeFriend.email });
  };

  const addReaction = (msgIndex, emoji) => {
    setMessages((prev) => {
      const copy = [...prev];
      const item = copy[msgIndex];
      if (!item) return prev;
      copy[msgIndex] = {
        ...item,
        reactions: [...(item.reactions || []), emoji],
      };
      return copy;
    });
  };

  return {
    user,
    dark,
    setDark,
    friends,
    setFriends,
    activeFriend,
    setActiveFriend,
    isSidebarOpen,
    setIsSidebarOpen,
    message,
    setMessage,
    messages,
    setMessages,
    isTyping,
    messagesEndRef,
    friendsListRef,
    sendMessage,
    handleTyping,
    addReaction,
    clearUnread,
  };
}
