import React, { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";

const ChatMessages = ({
  messages,
  userEmail,
  onLoadMore,
  hasMore,
  isLoading,
  showReactionsFor,
  setShowReactionsFor,
  addReaction
}) => {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const prevHeightRef = useRef(0);

  const safeMessages = Array.isArray(messages) ? messages : [];

  useEffect(() => {
    if (isLoading && containerRef.current) {
      prevHeightRef.current = containerRef.current.scrollHeight;
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && prevHeightRef.current > 0 && containerRef.current) {
      const newHeight = containerRef.current.scrollHeight;
      containerRef.current.scrollTop = newHeight - prevHeightRef.current;
      prevHeightRef.current = 0;
    }
  }, [safeMessages.length, isLoading]);

  useEffect(() => {
    if (!isLoading && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [safeMessages.length, isLoading]);

  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && hasMore && !isLoading) {
      onLoadMore();
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#f7f7fb] scroll-smooth"
    >
      {isLoading && (
        <div className="w-full flex justify-center py-4">
           <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-indigo-600"></div>
        </div>
      )}

      {safeMessages.map((msg, index) => (
        <MessageBubble
          key={msg._id || msg.localId || index}
          message={msg}
          idx={index}
          isOwn={msg.sender === userEmail}
          showReactionsFor={showReactionsFor}
          setShowReactionsFor={setShowReactionsFor}
          addReaction={addReaction}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;