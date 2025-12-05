import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import axios from 'axios'; // We use direct axios for the Node.js history endpoint
import Navbar from '../components/layout/Navbar';
import { Send, Hash, User, Loader2 } from 'lucide-react';

const Chat = () => {
    const { socket, isConnected } = useSocket();
    const { user } = useAuth();
    const location = useLocation();
    
    // State
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [room, setRoom] = useState("global_lobby");
    const [chatPartner, setChatPartner] = useState(null); // If private chat
    const [loadingHistory, setLoadingHistory] = useState(true);
    
    const messagesEndRef = useRef(null);

    // 1. Initialize Room Logic
    useEffect(() => {
        // Did we come here from the Friends page?
        if (location.state?.friendId && user?.userId) {
            const friendId = location.state.friendId;
            const myId = user.userId;
            
            // Create unique room ID: Sort IDs so it's always the same for both users
            // Result: "private_uuidA_uuidB"
            const roomId = [myId, friendId].sort().join("_");
            
            setRoom(roomId);
            setChatPartner(location.state.username);
        } else {
            setRoom("global_lobby");
            setChatPartner(null);
        }
    }, [location.state, user]);

    // 2. Load History & Join Room
    useEffect(() => {
        if (!socket || !room) return;

        const loadHistoryAndJoin = async () => {
            setLoadingHistory(true);
            try {
                // Fetch last 50 messages from Node.js Service
                // Note: Direct call to Node service (Port 3000 -> 4000 usually, but check your Chat Service port)
                // Assuming Chat Service runs on 4000 based on previous setup
                const res = await axios.get(`http://localhost:4000/api/chat/history/${room}`);
                setMessages(res.data);
            } catch (err) {
                console.error("Failed to load history", err);
            } finally {
                setLoadingHistory(false);
            }

            // Join via Socket
            socket.emit("join_room", room);
        };

        loadHistoryAndJoin();

        // Listen for live messages
        const handleReceive = (data) => {
            setMessages((prev) => [...prev, data]);
        };

        socket.on("receive_message", handleReceive);

        return () => {
            socket.off("receive_message", handleReceive);
            // Optional: Leave room logic if backend supports it
        };
    }, [socket, room]);

    // 3. Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (currentMessage.trim() !== "" && socket) {
            const messageData = {
                room: room,
                message: currentMessage,
            };
            await socket.emit("send_message", messageData);
            setCurrentMessage("");
        }
    };

    return (
        <div className="min-h-screen bg-yellow-50 flex flex-col pb-24 md:pb-0 md:pt-24">
            <Navbar />

            <div className="flex-1 max-w-4xl w-full mx-auto md:px-4 flex flex-col h-[calc(100vh-180px)]">
                
                {/* Chat Header */}
                <div className="bg-white border-b-2 border-black p-4 flex justify-between items-center md:rounded-t-3xl md:border-2 md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sticky top-0 z-30">
                    <div className="flex items-center">
                        <div className={`w-12 h-12 border-2 border-black rounded-full flex items-center justify-center mr-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${chatPartner ? 'bg-pink-300' : 'bg-green-400'}`}>
                            {chatPartner ? <User className="text-white w-6 h-6" /> : <Hash className="text-white w-6 h-6" />}
                        </div>
                        <div>
                            <h2 className="font-black text-xl text-gray-900">
                                {chatPartner ? chatPartner : "Global Lobby"}
                            </h2>
                            <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                {isConnected ? "Live Signal" : "Connecting..."}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-white/80 space-y-4 md:border-x-2 md:border-black scroll-smooth">
                    {loadingHistory && (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                    )}
                    
                    {messages.map((msg, index) => {
                        const isMe = msg.sender === user?.username || msg.sender === user?.email || msg.sender === user?.userId;
                        
                        return (
                            <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[75%] p-3 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-transform hover:-translate-y-1 ${
                                    isMe 
                                    ? "bg-black text-white rounded-tr-none" 
                                    : "bg-white text-gray-900 rounded-tl-none"
                                }`}>
                                    {!isMe && <p className="text-[10px] font-bold text-pink-500 mb-1 uppercase tracking-wider">{msg.sender}</p>}
                                    <p className="font-bold text-sm md:text-base leading-relaxed">{msg.content}</p>
                                    <p className={`text-[10px] text-right mt-1 font-medium ${isMe ? 'text-gray-400' : 'text-gray-400'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white md:rounded-b-3xl md:border-2 md:border-t-0 md:border-black md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sticky bottom-20 md:bottom-auto">
                    <form onSubmit={sendMessage} className="flex space-x-2">
                        <input
                            type="text"
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            placeholder={chatPartner ? `Message ${chatPartner}...` : "Broadcast to everyone..."}
                            className="input-sketch w-full bg-gray-50 border-2 border-black rounded-xl focus:ring-0 focus:bg-white transition"
                        />
                        <button 
                            type="submit" 
                            disabled={!currentMessage.trim()}
                            className="btn-sketch bg-pink-400 text-white p-3 aspect-square flex items-center justify-center hover:bg-pink-500 disabled:opacity-50 disabled:shadow-none"
                        >
                            <Send className="w-6 h-6" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chat;