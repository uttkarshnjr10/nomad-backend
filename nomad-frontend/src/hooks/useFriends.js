import { useEffect, useState } from "react";
import { friendApi } from "../services/api";

export default function useFriends() {
  const [friends, setFriends] = useState([]);
  const [activeFriend, setActiveFriend] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showReactionsFor, setShowReactionsFor] = useState(null);

  //  fetch Friends
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await friendApi.getFriends();
        setFriends(res.data || []);
      } catch (e) {
          console.error("Failed to fetch friends", e);
      }
    };
    fetch();
  }, []);

  //  load Active Friend from Local Storage on Mount
  useEffect(() => {
    const saved = localStorage.getItem("nomad_active_chat");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) setActiveFriend(parsed);
      } catch (e) {
          console.error("Failed to parse active chat", e);
      }
    }
  }, []);

  //  Save Active Friend to Local Storage whenever it changes
  useEffect(() => {
    if (activeFriend) {
        const friendToSave = {
            _id: activeFriend._id,
            email: activeFriend.email,
            username: activeFriend.username
        };
        localStorage.setItem("nomad_active_chat", JSON.stringify(friendToSave));
    }
  }, [activeFriend]);

  return { 
      friends, 
      setFriends, 
      activeFriend, 
      setActiveFriend, 
      isSidebarOpen, 
      setIsSidebarOpen, 
      showReactionsFor, 
      setShowReactionsFor 
  };
}