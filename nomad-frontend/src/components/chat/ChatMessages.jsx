import React, { useRef, useEffect, useLayoutEffect, useMemo } from "react";
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
  
  // Track if this is the initial mount/load for this chat session
  const isFirstLoad = useRef(true);

  const safeMessages = useMemo(() => Array.isArray(messages) ? messages : [], [messages]);

  // Reset first load when message list is empty (switching chats)
  useEffect(() => {
    if (safeMessages.length === 0) {
        isFirstLoad.current = true;
    }
  }, [safeMessages.length]);

  // 1. Maintain scroll position when loading HISTORY (scrolling up)
  useLayoutEffect(() => {
    if (containerRef.current && prevHeightRef.current > 0 && !isLoading) {
      const newHeight = containerRef.current.scrollHeight;
      containerRef.current.scrollTop = newHeight - prevHeightRef.current;
      prevHeightRef.current = 0;
    }
  }, [safeMessages.length, isLoading]);

  // 2. Capture height before loading more history
  useEffect(() => {
    if (isLoading && containerRef.current) {
      prevHeightRef.current = containerRef.current.scrollHeight;
    }
  }, [isLoading]);

  // 3. Smart Auto-Scroll Logic
  useEffect(() => {
    if (!isLoading && bottomRef.current && safeMessages.length > 0) {
      const lastMsg = safeMessages[safeMessages.length - 1];
      
      // Case A: Initial Load -> Instant Jump (No Animation)
      if (isFirstLoad.current) {
        bottomRef.current.scrollIntoView({ behavior: "auto" });
        isFirstLoad.current = false;
      } 
      // Case B: New Message Arrived -> Smooth Scroll
      else {
        // Only scroll if message is from me OR if it's very recent (a new arrival)
        const isNew = (Date.now() - new Date(lastMsg.timestamp).getTime()) < 2000;
        if (lastMsg.sender === userEmail || isNew) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  }, [safeMessages, isLoading, userEmail]);

  const handleScroll = (e) => {
    // Only trigger load more if we are at the top and not already loading
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
      {/* Loading Spinner for History */}
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