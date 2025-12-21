import React from "react";
import CuteSendIcon from "./CuteSendIcon";

export default function ChatInput({ value, onChange, onSend }) {
  return (
    <form onSubmit={onSend} className="p-4 border-t bg-white flex gap-3 items-center">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write something sweet..."
        className="flex-1 rounded-2xl px-4 py-3 border border-black/10 bg-white focus:ring-2 focus:ring-yellow-300 placeholder:italic"
      />

      <button
        type="submit"
        className="send-wiggle group bg-[#6C63FF] hover:bg-[#5950d1] text-white px-4 py-2 rounded-2xl flex items-center gap-2 transform transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <span className="w-6 h-6"><CuteSendIcon /></span>
        <div className="sparkle"></div>
        <span className="font-semibold tracking-wide">Send</span>
      </button>
    </form>
  );
}
