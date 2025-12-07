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
    if (activeFriend) {
        // Fix: Save the entire object to preserve 'fullName', 'name', etc.
        localStorage.setItem("nomad_active_chat", JSON.stringify(activeFriend));
    }
  }, [activeFriend]);

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