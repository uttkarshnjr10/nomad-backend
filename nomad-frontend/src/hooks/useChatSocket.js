import { useEffect } from 'react';

export default function useChatSocket(socket, roomId, setMessages) {
  useEffect(() => {
    if (!socket || !roomId) return;
    
    socket.emit("join_room", roomId);

    const onMessage = (newMsg) => {
       setMessages(prev => [...prev, newMsg]);
    };

    socket.on("receive_message", onMessage);
    
    return () => {
       socket.off("receive_message", onMessage);
    };
  }, [socket, roomId]);
}