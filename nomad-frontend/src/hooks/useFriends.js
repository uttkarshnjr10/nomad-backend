import { useEffect, useState } from "react";
import { friendApi } from "../services/api";

export default function useFriends() {
  const [friends, setFriends] = useState([]);
  const [activeFriend, setActiveFriend] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showReactionsFor, setShowReactionsFor] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await friendApi.getFriends();
        setFriends(res.data || []);
      } catch (e) {}
    };
    fetch();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("nomad_active_chat");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setActiveFriend({ email: parsed.friendEmail, username: parsed.username || parsed.friendEmail });
      } catch {}
    }
  }, []);

  return { friends, setFriends, activeFriend, setActiveFriend, isSidebarOpen, setIsSidebarOpen, showReactionsFor, setShowReactionsFor };
}
