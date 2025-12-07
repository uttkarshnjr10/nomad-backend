import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import getRoomId from "../utils/getRoomId";

export default function useChatLogic(activeFriend) {
  const { user, token } = useAuth();
  const { socket, clearUnread } = useSocket();

  const [dark, setDark] = useState(() => localStorage.getItem("nomad_dark") === "1");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("nomad_dark", dark ? "1" : "0");
  }, [dark]);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const typingTimer = useRef(null);
  const messagesEndRef = useRef(null);

  const getHistory = useCallback(async (roomId, beforeTimestamp = null) => {
    if (!token) return;
    try {
      setIsLoadingHistory(true);
      const API_BASE = import.meta.env.VITE_API_URL;
      const query = beforeTimestamp ? `?before=${beforeTimestamp}` : "";

      const res = await axios.get(
        `${API_BASE}/api/chat/history/${encodeURIComponent(roomId)}${query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let fetchedMessages = [];
      if (Array.isArray(res.data)) fetchedMessages = res.data;
      else if (res.data?.data) fetchedMessages = res.data.data;

      if (fetchedMessages.length < 20) setHasMore(false);

      if (beforeTimestamp) {
        setMessages(prev => [...fetchedMessages, ...prev]);
      } else {
        setMessages(fetchedMessages);
        setHasMore(fetchedMessages.length === 20);

        setTimeout(() => {
          const container = document.querySelector(".overflow-y-auto");
          if (container) container.scrollTop = container.scrollHeight;
        }, 100);
      }
    } catch {
      if (!beforeTimestamp) setMessages([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [token]);

  useEffect(() => {
    if (!activeFriend?.email || !user?.email) return;

    const roomId = getRoomId(user.email, activeFriend.email);

    setMessages([]);
    setHasMore(true);
    getHistory(roomId);

    if (clearUnread) clearUnread(activeFriend.email);
    if (!socket) return;

    socket.emit("join_room", roomId);

    const handleReceive = newMsg => {
      setMessages(prev => {
        const localIndex = prev.findIndex(m => m.localId && m.localId === newMsg.localId);
        if (localIndex !== -1) {
          const updated = [...prev];
          updated[localIndex] = newMsg;
          return updated;
        }
        if (newMsg._id && prev.some(m => m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });

      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    };

    const handleTypingEvent = data => {
      if (data?.sender === activeFriend.email) {
        setIsTyping(true);
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setIsTyping(false), 1200);
      }
    };

    socket.on("receive_message", handleReceive);
    socket.on("typing", handleTypingEvent);

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("typing", handleTypingEvent);
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, [activeFriend, user, socket, getHistory]);

  const sendMessage = e => {
    if (e?.preventDefault) e.preventDefault();
    if (!activeFriend?.email) return;
    if (!message.trim()) return;

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

    setMessages(prev => [...prev, msgData]);
    setMessage("");

    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 10);

    socket.emit("send_message", msgData);
  };

  const handleTyping = () => {
    if (!socket || !activeFriend?.email || !user?.email) return;
    socket.emit("typing", { sender: user.email, receiver: activeFriend.email });
  };

  const addReaction = (msgIndex, emoji) => {
    setMessages(prev => {
      const copy = [...prev];
      const m = copy[msgIndex];
      if (!m) return prev;
      copy[msgIndex] = { ...m, reactions: [...(m.reactions || []), emoji] };
      return copy;
    });
  };

  return {
    user,
    dark,
    setDark,
    message,
    setMessage,
    messages,
    isTyping,
    messagesEndRef,
    sendMessage,
    handleTyping,
    addReaction,
    getHistory,
    hasMore,
    isLoadingHistory
  };
}
