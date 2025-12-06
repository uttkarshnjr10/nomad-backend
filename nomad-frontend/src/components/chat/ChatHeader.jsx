import React from "react";

export default function ChatHeader({ activeFriend, onToggleSidebar }) {
  return (
    <div className="p-4 bg-[#C7E8FF] border-b border-black/10 flex items-center gap-3">
      <button onClick={onToggleSidebar} className="md:hidden p-2 bg-white rounded-lg border shadow">
        ☰
      </button>
      <div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center font-bold">
        {activeFriend.username?.[0]?.toUpperCase() || activeFriend.email?.[0]?.toUpperCase()}
      </div>
      <div>
        <div className="font-bold tracking-wide">{activeFriend.username}</div>
        <div className="text-xs text-slate-600">{activeFriend.email}</div>
      </div>
      <div className="ml-auto text-sm text-slate-600">Online</div>
    </div>
  );
}
