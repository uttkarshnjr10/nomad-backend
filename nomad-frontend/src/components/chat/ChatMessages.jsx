import React, { useRef, useLayoutEffect, useEffect } from "react";
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

    const currentScrollHeight = containerRef.current.scrollHeight;

    //  Detect if we just loaded OLDER messages 
    if (previousScrollHeightRef.current > 0 && currentScrollHeight > previousScrollHeightRef.current) {
      const diff = currentScrollHeight - previousScrollHeightRef.current;
      containerRef.current.scrollTop = diff; // Keep visual position stable
      previousScrollHeightRef.current = 0;   // Reset
    } 
    // Detect if this is the INITIAL load or a NEW message at the bottom
    else {
      // Logic: If user was near bottom OR it's the first load, auto-scroll to bottom
      const wasNearBottom = true; // Simplified: Always scroll to bottom on new messages for best chat UX
      
      if (wasNearBottom) {
        containerRef.current.scrollTop = currentScrollHeight;
      }
    }
  }, [safeMessages]); // Trigger whenever messages change

  // 2. Handle Scrolling to Top (Trigger Load More)
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight } = e.target;
    if (scrollTop === 0 && hasMore && !isLoading) {
      previousScrollHeightRef.current = scrollHeight; // Remember height before loading
      onLoadMore();
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#f7f7fb] scroll-smooth"
      style={{ scrollBehavior: "smooth" }} 
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
      
      {/* Invisible element to force bottom scroll if needed */}
      <div id="scroll-bottom-anchor" />
    </div>
  );
};

export default ChatMessages;