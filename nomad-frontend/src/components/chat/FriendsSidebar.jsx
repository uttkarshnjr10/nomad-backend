import React from "react";

export default function FriendsSidebar({ friends, activeFriend }) {
  return (
    <>
      {friends.map((friend) => (
        <button
          key={friend.email || friend.id}
          onClick={() => {
            const email = friend.email;
            const username = friend.username || email;
            const payload = { friendEmail: email, username };
            localStorage.setItem("nomad_active_chat", JSON.stringify(payload));
            window.location.reload();
          }}
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
          <div className="ml-auto">
            {friend.online ? <span className="inline-block w-3 h-3 bg-green-500 rounded-full" /> : <span className="inline-block w-3 h-3 bg-gray-300 rounded-full" />}
          </div>
        </button>
      ))}
    </>
  );
}
