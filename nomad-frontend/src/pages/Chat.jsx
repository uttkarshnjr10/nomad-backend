import React from "react";
import Navbar from "../components/layout/Navbar";
import FriendsSidebar from "../components/chat/FriendsSidebar";
import ChatHeader from "../components/chat/ChatHeader";
import ChatMessages from "../components/chat/ChatMessages";
import ChatInput from "../components/chat/ChatInput";
import TypingIndicator from "../components/chat/TypingIndicator";
import useChatLogic from "../hooks/useChatLogic";
import useFriends from "../hooks/useFriends";

const Chat = () => {
  const { friends, isSidebarOpen, setIsSidebarOpen, activeFriend, showReactionsFor, setShowReactionsFor } =
    useFriends();
  const {
    user,
    dark,
    setDark,
    messages,
    message,
    setMessage,
    sendMessage,
    handleTyping,
    isTyping,
    addReaction,
    messagesEndRef,
    friendsListRef,
  } = useChatLogic();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-b from-[#fffdf7] to-[#f7f7fb]">
      <Navbar dark={dark} onToggleDark={() => setDark((d) => !d)} />

      <div className="flex-1 flex w-full max-w-7xl mx-auto md:pt-20 p-3 gap-4 overflow-hidden">
        <div
          className={`absolute md:relative z-20 h-full bg-white rounded-2xl flex flex-col transition-all duration-300 shadow-md border
            ${isSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0 md:w-0 overflow-hidden"}`}
        >
          <div className="p-4 bg-[#C7E8FF] rounded-t-2xl flex items-center justify-between border-b border-black/10">
            <h2 className="font-extrabold tracking-wide text-indigo-900 text-lg">Companions</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 bg-white rounded-full">
              ✕
            </button>
          </div>

          <div ref={friendsListRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-white">
            <FriendsSidebar friends={friends} activeFriend={activeFriend} />
          </div>
        </div>

        {!isSidebarOpen && (
          <button onClick={() => setIsSidebarOpen(true)} className="absolute left-3 top-28 bg-black text-white p-2 rounded-r-xl md:hidden">
            ➤
          </button>
        )}

        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-lg border overflow-hidden">
          {activeFriend ? (
            <>
              <ChatHeader activeFriend={activeFriend} onToggleSidebar={() => setIsSidebarOpen((v) => !v)} />

              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FFFDF7]">
                <ChatMessages
                  messages={messages}
                  userEmail={user?.email}
                  showReactionsFor={showReactionsFor}
                  setShowReactionsFor={setShowReactionsFor}
                  addReaction={addReaction}
                />

                {isTyping && <TypingIndicator name={activeFriend.username} />}

                <div ref={messagesEndRef} />
              </div>

              <ChatInput
                value={message}
                onChange={(v) => {
                  setMessage(v);
                  handleTyping();
                }}
                onSend={sendMessage}
              />
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
