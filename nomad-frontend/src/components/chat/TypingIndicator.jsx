import React from "react";

export default function TypingIndicator({ name }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500 px-3 py-1">
      <span className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-300 typing-dot" />
        <span className="w-2 h-2 rounded-full bg-indigo-300 typing-dot" />
        <span className="w-2 h-2 rounded-full bg-indigo-300 typing-dot" />
      </span>

      <span className="text-sm text-slate-500"> {name} is typing</span>
    </div>
  );
}
