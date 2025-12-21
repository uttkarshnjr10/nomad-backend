import React from "react";

const ChatHeader = ({ activeFriend, onToggleSidebar }) => {
  const displayName = 
    activeFriend?.username || 
    activeFriend?.fullName || 
    activeFriend?.name || 
    activeFriend?.email?.split('@')[0] || 
    "Companion";

  const initial = displayName ? displayName[0].toUpperCase() : "?";

  return (
    <div className="flex items-center justify-between px-4 py-3 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 h-16 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile Back Button */}
        <button 
          onClick={onToggleSidebar}
          className="md:hidden text-slate-500 hover:text-indigo-600 transition-colors p-1"
        >
          <span className="text-xl">←</span>
        </button>

        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
            {initial}
          </div>
          {/* Online Status Indicator */}
          <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${activeFriend?.online ? 'bg-green-500' : 'bg-gray-300'}`}></div>
        </div>

        {/* Name & Status */}
        <div className="flex flex-col">
          <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight">
            {displayName}
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">
            {activeFriend?.online ? "Active Now" : "Offline"}
          </span>
        </div>
      </div>

      {/* Icons */}
      <div className="flex items-center gap-2 text-slate-400">
         <button className="hover:bg-slate-50 p-2 rounded-full transition-all">📞</button>
         <button className="hover:bg-slate-50 p-2 rounded-full transition-all">📹</button>
      </div>
    </div>
  );
};

export default ChatHeader;