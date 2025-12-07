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
 const { 
    friends, 
    isSidebarOpen, 
    setIsSidebarOpen, 
    activeFriend, 
    setActiveFriend,
    showReactionsFor, 
    setShowReactionsFor 
  } = useFriends();

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
  //  messagesEndRef,
    getHistory,
    hasMore,
    isLoadingHistory,
  } = useChatLogic(activeFriend); 

  const handleFriendSelect = (friend) => {
    setActiveFriend(friend);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#f7f7fb] overflow-hidden">
      <Navbar dark={dark} onToggleDark={() => setDark((d) => !d)} />

      <div className="flex-1 flex w-full max-w-7xl mx-auto md:pt-4 p-0 md:p-3 gap-4 overflow-hidden relative">
        
        {/* Sidebar */}
        <div
          className={`absolute md:relative z-20 h-full bg-white md:rounded-2xl flex flex-col border-r md:border shadow-sm transition-all duration-300 ease-in-out
            ${isSidebarOpen ? "translate-x-0 w-full md:w-80" : "-translate-x-full md:translate-x-0 md:w-0 overflow-hidden"}`}
        >
          <div className="p-4 bg-[#F0F4F8] flex items-center justify-between border-b border-slate-100">
            <h2 className="font-bold text-slate-700 text-lg">Companions</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-500 hover:bg-white rounded-full transition-colors">
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <FriendsSidebar 
                friends={friends} 
                activeFriend={activeFriend} 
                onSelectFriend={handleFriendSelect} 
            />
          </div>
        </div>


        {!isSidebarOpen && !activeFriend && (
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="absolute left-4 top-4 z-10 bg-indigo-600 text-white p-2 rounded-full shadow-lg md:hidden"
          >
            ➤
          </button>
        )}

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-white md:rounded-2xl shadow-sm border overflow-hidden ${!activeFriend ? "hidden md:flex" : "flex"}`}>
          {activeFriend ? (
            <>
              <div className="z-10 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm shrink-0">
                <ChatHeader 
                    activeFriend={activeFriend} 
                    onToggleSidebar={() => setIsSidebarOpen((v) => !v)} 
                />
              </div>

              {/* Messages */}
              <div className="flex-1 flex flex-col overflow-hidden relative">
                <ChatMessages
                  messages={messages}
                  userEmail={user?.email}
                  onLoadMore={() => getHistory(getRoomId(user.email, activeFriend.email), messages[0]?.timestamp)}
                  hasMore={hasMore}
                  isLoading={isLoadingHistory}
                  showReactionsFor={showReactionsFor}
                  setShowReactionsFor={setShowReactionsFor}
                  addReaction={addReaction}
                />
                
                {isTyping && (
                   <div className="absolute bottom-4 left-6 z-20">
                      <TypingIndicator name={activeFriend.username || "Friend"} />
                   </div>
                )}
               {/*<div ref={messagesEndRef} />*/}
              </div>

              <div className="p-3 bg-white border-t border-slate-50 shrink-0">
                <ChatInput
                  value={message}
                  onChange={(v) => {
                    setMessage(v);
                    handleTyping();
                  }}
                  onSend={sendMessage}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-2xl">👋</div>
              <h2 className="text-xl font-semibold text-slate-600">Nomad Chat</h2>
              <p className="text-sm">Select a companion to start exploring</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;