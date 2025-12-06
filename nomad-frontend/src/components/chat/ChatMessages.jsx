import React from "react";
import { Smile } from "lucide-react";

export default function ChatMessages({ messages, userEmail, showReactionsFor, setShowReactionsFor, addReaction }) {
  return (
    <>
      {messages.map((msg, idx) => {
        const isMe = msg.sender === userEmail;
        const isPending = !!msg.localId && !msg._id;
        return (
          <div key={msg._id || msg.localId || idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
            <div className="relative max-w-[78%] transform transition-all duration-300 ease-out">
              <div
                  className={`px-4 py-3 rounded-2xl shadow-[3px_3px_0px_#d0d0d0] border text-sm bubble-pop cute-hover
                    ${isMe ? "bg-[#FADA7A] rounded-tr-none border-yellow-300" : "bg-white rounded-tl-none border-gray-200"}
                    ${isPending ? "opacity-80 scale-98" : "opacity-100"}`}
                style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
              >
                <div className="whitespace-pre-wrap break-words">{msg.content}</div>

                <div className="flex items-center justify-end gap-2 mt-2">
                  <span className="text-[10px] opacity-60">{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>

                  <button
                    onClick={() => setShowReactionsFor(idx)}
                    className="text-[12px] text-slate-600 hover:text-slate-800 p-1 rounded-full"
                    aria-label="react"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="absolute -bottom-8 left-0 flex gap-2">
                {msg.reactions?.slice(-3).map((r, i) => (
                  <div key={i} className="px-2 py-1 bg-white border rounded-full text-xs shadow-sm">{r}</div>
                ))}
              </div>

              {showReactionsFor === idx && (
                <div className="absolute -top-10 left-0 flex gap-2 bg-white p-2 rounded-full shadow-md border">
                  {["👍", "🔥", "😂", "❤️", "🤔"].map((emoji) => (
                    <button key={emoji} onClick={() => { addReaction(idx, emoji); setShowReactionsFor(null); }} className="p-1 text-lg">
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
