import React from "react";
import { Smile } from "lucide-react";
import { format } from "date-fns";

const MessageBubble = ({
  message,
  idx,
  isOwn,
  showReactionsFor,
  setShowReactionsFor,
  addReaction
}) => {
  const isPending = !!message.localId && !message._id;

  return (
    <div className={`flex w-full ${isOwn ? "justify-end" : "justify-start"} mb-1 group`}>
      <div className={`relative max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        
        {/* Chat Bubble - Reduced Padding for Thinner Look */}
        <div
          className={`px-3 py-2 rounded-2xl shadow-[1px_1px_0px_rgba(0,0,0,0.05)] border text-[15px] leading-relaxed relative transition-all duration-200
            ${isOwn 
                ? "bg-[#FADA7A] text-slate-900 rounded-tr-sm border-yellow-400/30" 
                : "bg-white text-slate-800 rounded-tl-sm border-slate-200"
            }
            ${isPending ? "opacity-70" : "opacity-100"}`}
          style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
        >
          {message.content}
        </div>

        {/* Time & Action Row */}
        <div className={`flex items-center gap-2 mt-1 px-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[10px] text-slate-400 select-none">
            {message.timestamp ? format(new Date(message.timestamp), "h:mm a") : "..."}
          </span>
          
          {/* Reaction Trigger (Visible on Hover) */}
          <button
            onClick={() => setShowReactionsFor(idx)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded-full"
          >
            <Smile className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Reactions Display */}
        {message.reactions?.length > 0 && (
          <div className={`absolute -bottom-2 ${isOwn ? "right-0" : "left-0"} flex gap-1 z-10 translate-y-1/2`}>
            {message.reactions.slice(-3).map((r, i) => (
              <div key={i} className="px-1.5 py-0.5 bg-white border border-slate-100 rounded-full text-[10px] shadow-sm animate-in zoom-in">
                {r}
              </div>
            ))}
          </div>
        )}

        {/* Emoji Picker */}
        {showReactionsFor === idx && (
          <div className={`absolute -top-10 ${isOwn ? "right-0" : "left-0"} flex gap-1 bg-white p-1.5 rounded-full shadow-xl border border-gray-100 z-20 animate-in slide-in-from-bottom-2 fade-in`}>
            {["👍", "🔥", "😂", "❤️", "🤔"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  addReaction(idx, emoji);
                  setShowReactionsFor(null);
                }}
                className="p-1 hover:scale-125 transition-transform text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;