import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import getRoomId from "../utils/getRoomId";

export default function useChatLogic(activeFriend) {
  const { user, token } = useAuth();
  const { socket, clearUnread } = useSocket();

  const [dark, setDark] = useState(() => localStorage.getItem("nomad_dark") === "1");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const typingTimer = useRef(null);

  const userEmail = user?.email;
  const friendEmail = activeFriend?.email;

  const roomId = (userEmail && friendEmail) ? getRoomId(userEmail, friendEmail) : null;

  // Fetch History
  const getHistory = useCallback(async (room, beforeTimestamp = null) => {
    if (!token || !room) return;
    try {
      setIsLoadingHistory(true);
      const API_BASE = import.meta.env.VITE_API_URL;
      const query = beforeTimestamp ? `?before=${beforeTimestamp}` : "";

      const res = await axios.get(
        `${API_BASE}/api/chat/history/${encodeURIComponent(room)}${query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let fetchedMessages = Array.isArray(res.data) ? res.data : (res.data?.data || []);

      if (fetchedMessages.length < 20) setHasMore(false);

      setMessages(prev => beforeTimestamp ? [...fetchedMessages, ...prev] : fetchedMessages);
    } catch (error) {
      //console.error("History fetch error:", error);
      if (!beforeTimestamp) setMessages([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [token]);

  // Main Effect: Join Room & Listeners
  useEffect(() => {
    if (!roomId || !userEmail || !socket) return;

    // Reset and Fetch
    setMessages([]);
    setHasMore(true);
    getHistory(roomId);

    if (clearUnread && friendEmail) {
      clearUnread(friendEmail);
    }

    socket.emit("join_room", roomId);

    const handleReceive = (newMsg) => {
      setMessages(prev => {
        // Prevent duplicate messages
        if (newMsg.localId && prev.some(m => m.localId === newMsg.localId)) return prev;
        if (newMsg._id && prev.some(m => m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });
    };

    const handleTypingEvent = (data) => {
      if (data?.sender === friendEmail) {
        setIsTyping(true);
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setIsTyping(false), 1200);
      }
    };

    // Attach Listeners
    socket.on("receive_message", handleReceive);
    socket.on("typing", handleTypingEvent);

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("typing", handleTypingEvent);
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };


  }, [roomId, userEmail, friendEmail, socket, getHistory, clearUnread]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("nomad_dark", dark ? "1" : "0");
  }, [dark]);

  const sendMessage = (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!roomId || !message.trim() || !socket) return;

    const localId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const msgData = {
      room: roomId,
      message,
      sender: userEmail,
      timestamp: new Date().toISOString(),
      localId,
      content: message,
    };

    setMessages(prev => [...prev, msgData]);
    setMessage("");

    socket.emit("send_message", msgData);
  };

  const handleTyping = () => {
    if (!socket || !friendEmail || !userEmail) return;
    socket.emit("typing", { sender: userEmail, receiver: friendEmail });
  };

  const addReaction = (msgIndex, emoji) => {
    setMessages(prev => {
      const copy = [...prev];
      if (!copy[msgIndex]) return prev;
      copy[msgIndex] = { 
        ...copy[msgIndex], 
        reactions: [...(copy[msgIndex].reactions || []), emoji] 
      };
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
    sendMessage,
    handleTyping,
    addReaction,
    getHistory,
    hasMore,
    isLoadingHistory
  };
}