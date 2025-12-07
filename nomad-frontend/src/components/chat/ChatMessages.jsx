import React, { useRef, useLayoutEffect, useState } from "react";
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
  const containerRef = useRef(null);
  const previousScrollHeightRef = useRef(0);
  const isFirstLoad = useRef(true);

  // Ensure safe array
  const safeMessages = Array.isArray(messages) ? messages : [];

  // SCROLL LOGIC
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const { scrollHeight, scrollTop, clientHeight } = containerRef.current;
    const currentScrollHeight = scrollHeight;

    // 1. Handling "Load Previous" (History)
    // If height increased significantly AND we have a record of previous height
    if (previousScrollHeightRef.current > 0 && currentScrollHeight > previousScrollHeightRef.current) {
      const diff = currentScrollHeight - previousScrollHeightRef.current;
      containerRef.current.scrollTop = diff; // Maintain visual position
      previousScrollHeightRef.current = 0;   // Reset
    } 
    // 2. Handling New Messages / Initial Load
    else {
      const lastMessage = safeMessages[safeMessages.length - 1];
      const isOwnMessage = lastMessage?.sender === userEmail;

      // Calculate if user was near the bottom before the new message arrived
      // We assume "near" is within 150px of the bottom (approx height of a message bubble)
      // Note: Since this runs after render, scrollHeight includes the NEW message. 
      // So we check if we are essentially looking at the bottom minus the new content.
      const distanceFromBottom = currentScrollHeight - scrollTop - clientHeight;
      const wasNearBottom = distanceFromBottom < 200; 

      if (isFirstLoad.current || isOwnMessage || wasNearBottom) {
        containerRef.current.scrollTop = currentScrollHeight;
      }
    }

    isFirstLoad.current = false;
  }, [safeMessages, userEmail]); 

  // Handle Scrolling to Top (Trigger Load More)
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight } = e.target;
    // If we hit the top, have more data, and aren't currently loading
    if (scrollTop === 0 && hasMore && !isLoading) {
      previousScrollHeightRef.current = scrollHeight; // Snapshot height before fetch
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
          <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Messages */}
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
      
      {/* Empty State */}
      {safeMessages.length === 0 && !isLoading && (
        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
          <span className="text-4xl mb-2">👋</span>
          <p>No messages yet. Start the conversation!</p>
        </div>
      )}
      
      <div id="scroll-bottom-anchor" />
    </div>
  );
};

export default ChatMessages;