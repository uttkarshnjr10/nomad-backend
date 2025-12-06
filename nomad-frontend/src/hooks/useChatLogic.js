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
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("nomad_dark", dark ? "1" : "0");
  }, [dark]);

  const [activeFriend, setActiveFriend] = useState(null);
  const [friends, setFriends] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimer = useRef(null);

  const messagesEndRef = useRef(null);
  const friendsListRef = useRef(null);

  const getHistory = useCallback(
  async (roomId) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL;

      const res = await axios.get(
        `${API_BASE}/api/chat/history/${encodeURIComponent(roomId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(res.data || []);
      setTimeout(() => scrollMessagesToBottom(false), 50);
    } catch (e) {}
  },
  [token]
);


  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await friendApi.getFriends();
        setFriends(res.data || []);
      } catch (e) {
        // console.log('failed to fetch friends', e)
      }
    };
    fetchFriends();
  }, []);

  const scrollMessagesToBottom = (smooth = true) => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => {
    const saved = localStorage.getItem("nomad_active_chat");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setActiveFriend({ email: parsed.friendEmail, username: parsed.username || parsed.friendEmail });
      } catch (e) {
        // console.log('failed to parse saved chat', e)
      }
    }
  }, []);

  useEffect(() => {
    if (!activeFriend?.email || !user?.email) return;
    const roomId = getRoomId(user.email, activeFriend.email);
    getHistory(roomId);
    if (!socket) return;
    socket.emit("join_room", roomId);
    // console.log('socket joined', roomId)

    const handleReceive = (newMsg) => {
      setMessages((prev) => {
        if (newMsg._id && prev.some((m) => m._id === newMsg._id)) return prev;
        if (prev.some((m) => m.timestamp === newMsg.timestamp && m.content === newMsg.content)) return prev;
        return [...prev, newMsg];
      });
      setTimeout(() => scrollMessagesToBottom(true), 50);
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

  const sendMessage = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
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
    // console.log('sent message', msgData.localId)
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
      copy[msgIndex] = { ...item, reactions: [...(item.reactions || []), emoji] };
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
