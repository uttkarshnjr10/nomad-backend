import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { friendApi } from "../services/api";
import Navbar from "../components/layout/Navbar";
import { Menu, X, ChevronRight, Smile } from "lucide-react";
import axios from "axios";

/* Cute send icon */
const CuteSendIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="cute-plane">
    <path
      d="M2 12L20 3L14 21L11 13L2 12Z"
      stroke="#1f1f1f"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="#FEEA7B"
    />
  </svg>
);

/* Typing indicator */
const TypingIndicator = ({ name }) => (
  <div className="flex items-center gap-2 text-sm text-slate-500 px-3 py-1">
    <span className="animate-pulse">💬 {name} is typing</span>
  </div>
);

const Chat = () => {
  const { state } = useLocation();
  const { user, token } = useAuth();
  const { socket, clearUnread } = useSocket();

  const [activeFriend, setActiveFriend] = useState(null);
  const [friends, setFriends] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dark, setDark] = useState(() => localStorage.getItem("nomad_dark") === "1");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimer = useRef(null);

  const messagesEndRef = useRef(null);
  const friendsListRef = useRef(null);
  const mainWrapperRef = useRef(null);

  const getRoomId = (a, b) => (a && b ? [a, b].sort().join("_") : null);

  const scrollMessagesToBottom = (smooth = true) => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("nomad_dark", dark ? "1" : "0");
  }, [dark]);

  useEffect(() => {
    const saved = localStorage.getItem("nomad_active_chat");

    if (state?.friend?.email) {
      const fEmail = state.friend.email;
      const fName = state.friend.username || fEmail;
      setActiveFriend({ email: fEmail, username: fName });
      localStorage.setItem("nomad_active_chat", JSON.stringify({ friendEmail: fEmail, username: fName }));
      return;
    }

    if (saved) {
      const parsed = JSON.parse(saved);
      setActiveFriend({ email: parsed.friendEmail, username: parsed.username || parsed.friendEmail });
    }
  }, [state]);

  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await friendApi.getFriends();
        setFriends(res.data);
      } catch (err) {
        console.error("Failed to fetch friends", err);
      }
    };
    fetchFriends();
  }, []);

  useEffect(() => {
    if (!activeFriend?.email || !user?.email) return;

    const roomId = getRoomId(user.email, activeFriend.email);

    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/chat/history/${encodeURIComponent(roomId)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data || []);
        setTimeout(() => scrollMessagesToBottom(false), 50);
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };
    fetchHistory();

    if (!socket) return;

    socket.emit("join_room", roomId);

    const handleReceive = (newMsg) => {
      setMessages((prev) => {
        // Prevent duplicates by _id, timestamp+content fallback
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
  }, [activeFriend, user, token, socket]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket || !activeFriend?.email) return;

    const roomId = getRoomId(user.email, activeFriend.email);
    const localId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const msgData = {
      room: roomId,
      message,
      sender: user.email,
      timestamp: new Date().toISOString(),
      localId,
    };

    // optimistic add (include localId)
    setMessages((prev) => [...prev, { ...msgData, content: message }]);
    setMessage("");
    scrollMessagesToBottom(true);

    socket.emit("send_message", msgData);
  };

  const handleTypingEvent = () => {
    if (!socket || !activeFriend?.email) return;
    socket.emit("typing", { sender: user.email, receiver: activeFriend.email });
  };

  const handleSelectFriend = (friend) => {
    const email = friend.email;
    const username = friend.username || email;
    setActiveFriend({ email, username });
    clearUnread?.(email);
    localStorage.setItem("nomad_active_chat", JSON.stringify({ friendEmail: email, username }));
    if (window.innerWidth < 768) setIsSidebarOpen(false);
    // scroll messages area to top when switching friend (so fetchHistory places messages properly)
    setTimeout(() => scrollMessagesToBottom(false), 120);
  };

  /* extra enhancements (reaction popover) */
  const [showReactionsFor, setShowReactionsFor] = useState(null);
  const reactions = ["👍", "🔥", "😂", "❤️", "🤔"];

  const addReaction = (msgIndex, emoji) => {
    setMessages((prev) => {
      const copy = [...prev];
      const item = copy[msgIndex];
      if (!item) return prev;
      copy[msgIndex] = { ...item, reactions: [...(item.reactions || []), emoji] };
      return copy;
    });
    setShowReactionsFor(null);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-b from-[#fffdf7] to-[#f7f7fb]">
      <Navbar dark={dark} onToggleDark={() => setDark((d) => !d)} />

      <div className="flex-1 flex w-full max-w-7xl mx-auto md:pt-20 p-3 gap-4 overflow-hidden" ref={mainWrapperRef}>
        {/* SIDEBAR */}
        <div
          className={`absolute md:relative z-20 h-full bg-white rounded-2xl flex flex-col transition-all duration-300 shadow-md border
            ${isSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0 md:w-0 overflow-hidden"}`}
        >
          <div className="p-4 bg-[#C7E8FF] rounded-t-2xl flex items-center justify-between border-b border-black/10">
            <h2 className="font-extrabold">Companions</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden">
              <X />
            </button>
          </div>

          <div ref={friendsListRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-white">
            {friends.map((friend) => (
              <button
                key={friend.email || friend.id}
                onClick={() => handleSelectFriend(friend)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-shadow text-left
                  ${activeFriend?.email === friend.email ? "bg-[#E7F0FF] border-indigo-200 shadow-sm" : "bg-white border-gray-200 hover:shadow-sm"}`}
              >
                <div className="w-11 h-11 rounded-full bg-[#FEEA7B] border border-black/10 flex items-center justify-center font-bold text-indigo-900">
                  {(friend.username || friend.email || "U")[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate text-sm">{friend.username || friend.email}</div>
                  <div className="text-xs text-slate-500 truncate">{friend.email}</div>
                </div>
                {/* online dot (simple heuristic: friend.online true) */}
                <div className="ml-auto">
                  {friend.online ? (
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full" />
                  ) : (
                    <span className="inline-block w-3 h-3 bg-gray-300 rounded-full" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {!isSidebarOpen && (
          <button onClick={() => setIsSidebarOpen(true)} className="absolute left-3 top-28 bg-black text-white p-2 rounded-r-xl md:hidden">
            <ChevronRight />
          </button>
        )}

        {/* CHAT MAIN */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-lg border overflow-hidden">
          {activeFriend ? (
            <>
              {/* header */}
              <div className="p-4 bg-[#C7E8FF] border-b border-black/10 flex items-center gap-3">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 bg-white rounded-lg border shadow">
                  <Menu />
                </button>
                <div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center font-bold">
                  {activeFriend.username?.[0]?.toUpperCase() || activeFriend.email?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-bold">{activeFriend.username}</div>
                  <div className="text-xs text-slate-600">{activeFriend.email}</div>
                </div>
                <div className="ml-auto text-sm text-slate-600">Online</div>
              </div>

              {/* messages area (ONLY scrollable area) */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FFFDF7]">
                {messages.map((msg, idx) => {
                  const isMe = msg.sender === user.email;
                  return (
                    <div key={msg._id || msg.localId || idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className="relative max-w-[78%]">
                        <div
                          className={`px-4 py-3 rounded-2xl shadow-[3px_3px_0px_#d0d0d0] border text-sm
                            ${isMe ? "bg-[#FADA7A] rounded-tr-none border-yellow-300" : "bg-white rounded-tl-none border-gray-200"}`}
                        >
                          <div className="whitespace-pre-wrap">{msg.content}</div>

                          <div className="flex items-center justify-end gap-2 mt-2">
                            <span className="text-[10px] opacity-60">{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            <button
                              onClick={() => setShow ? null : null}
                              className="text-[12px] text-slate-600 hover:text-slate-800"
                              aria-label="react"
                            >
                              <Smile className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* reaction popover */}
                        <div className="absolute -bottom-8 left-0 flex gap-2">
                          {msg.reactions?.slice(-3).map((r, i) => (
                            <div key={i} className="px-2 py-1 bg-white border rounded-full text-xs shadow-sm">{r}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isTyping && <TypingIndicator name={activeFriend.username} />}

                <div ref={messagesEndRef} />
              </div>

              {/* input fixed at bottom of chat panel */}
              <form onSubmit={handleSend} className="p-4 border-t bg-white flex gap-3 items-center">
                <input
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    handleTypingEvent();
                  }}
                  placeholder="Write something..."
                  className="flex-1 rounded-2xl px-4 py-3 border border-black/10 bg-white focus:ring-2 focus:ring-yellow-300"
                />

                <button type="submit" className="bg-[#6C63FF] hover:bg-[#5950d1] text-white px-4 py-2 rounded-2xl flex items-center gap-2">
                  <CuteSendIcon />
                  <span className="font-semibold">Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Nomad Chat</h2>
                <p className="text-slate-600 mt-2">Select a companion to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
