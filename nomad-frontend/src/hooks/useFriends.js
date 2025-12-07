import { useEffect, useState, useMemo } from "react";
import { friendApi } from "../services/api";

export default function useFriends() {
  const [friends, setFriends] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showReactionsFor, setShowReactionsFor] = useState(null);

  const [activeFriendId, setActiveFriendId] = useState(() => {
    try {
      const saved = localStorage.getItem("nomad_active_chat");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse active chat", e);
      return null;
    }
  });

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await friendApi.getFriends();
        setFriends(res.data || []);
      } catch (e) {
        console.error("Failed to fetch friends", e);
      }
    };
    fetchFriends();
  }, []);

 
  const activeFriend = useMemo(() => {
    if (!activeFriendId) return null;
    const freshData = friends.find(f => f.email === activeFriendId.email);
    return freshData || activeFriendId; 
  }, [friends, activeFriendId]);

  const handleSetActiveFriend = (friend) => {
    setActiveFriendId(friend);
    if (friend) {
      localStorage.setItem("nomad_active_chat", JSON.stringify(friend));
    } else {
      localStorage.removeItem("nomad_active_chat");
    }
  };

  return { 
      friends, 
      setFriends, 
      activeFriend,
      setActiveFriend: handleSetActiveFriend, 
      isSidebarOpen, 
      setIsSidebarOpen, 
      showReactionsFor, 
      setShowReactionsFor 
  };
}