import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

export const chatService = {
  getHistory: async (roomId, beforeTimestamp, token) => {
    const query = beforeTimestamp ? `?before=${beforeTimestamp}` : "";
    const response = await axios.get(
      `${API_BASE}/api/chat/history/${encodeURIComponent(roomId)}${query}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
};