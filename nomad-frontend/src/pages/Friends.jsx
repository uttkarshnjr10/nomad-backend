import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import { friendApi } from '../services/api';
import { Search, UserPlus, Check, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Friends = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();

  const loadRequests = async () => {
    try {
      const res = await friendApi.getRequests();
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === 'requests') {
          const res = await friendApi.getRequests();
          setRequests(res.data);
        }
        if (activeTab === 'friends') {
          const res = await friendApi.getFriends();
          setFriends(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    try {
      const res = await friendApi.search(query);
      setResults(res.data);
    } catch (err) {
      toast.error('Search failed');
    }
  };

  const sendRequest = async (id) => {
    try {
      await friendApi.sendRequest(id);
      toast.success('Friend request sent!');
      setResults(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      toast.error('Failed to send request');
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      await friendApi.acceptRequest(requestId);
      toast.success('Friend added!');
      loadRequests();
    } catch (err) {
      toast.error('Failed to accept');
    }
  };

  const startChat = (friendId, username) => {
    navigate('/chat', { state: { friendId, username } });
  };

  return (
    <div className="h-screen w-full flex flex-col bg-yellow-50 overflow-hidden">
      
      <div className="shrink-0 z-50">
        <Navbar />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-20">

          {/* Tabs */}
          <div className="flex space-x-2 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-6 py-2 rounded-xl font-black border-2 border-black ${
                activeTab === 'friends'
                  ? 'bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white'
              }`}
            >
              My Friends
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-2 rounded-xl font-black border-2 border-black ${
                activeTab === 'requests'
                  ? 'bg-pink-400 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white'
              }`}
            >
              Requests
              {requests.length > 0 && (
                <span className="ml-2 bg-white text-black px-2 rounded-full text-xs">
                  {requests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className={`px-6 py-2 rounded-xl font-black border-2 border-black ${
                activeTab === 'search'
                  ? 'bg-blue-400 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white'
              }`}
            >
              Find People
            </button>
          </div>

          {/* SEARCH */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search username..."
                  className="input-sketch w-full bg-white"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit" className="btn-sketch bg-black text-white px-4">
                  <Search className="w-5 h-5" />
                </button>
              </form>

              {results.map(user => (
                <div key={user.id} className="card-sketch p-4 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full border-2 border-black flex items-center justify-center font-bold">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold">{user.username}</h3>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => sendRequest(user.id)}
                    className="btn-sketch bg-green-400 p-2"
                  >
                    <UserPlus className="w-5 h-5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {requests.length === 0 && (
                <p className="text-center font-bold text-gray-500">No pending requests</p>
              )}
              {requests.map(req => (
                <div key={req.id} className="card-sketch p-4 flex justify-between items-center bg-pink-50">
                  <div className="font-bold">{req.sender.username}</div>
                  <button
                    onClick={() => acceptRequest(req.id)}
                    className="btn-sketch bg-black text-white px-4 py-2 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Accept
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* FRIENDS */}
          {activeTab === 'friends' && (
            <div className="space-y-4">
              {friends.length === 0 && (
                <p className="text-center font-bold text-gray-500">
                  You are traveling alone.
                </p>
              )}
              {friends.map(friend => (
                <div key={friend.id} className="card-sketch p-4 flex justify-between items-center">
                  <div className="font-bold text-lg">{friend.username}</div>
                  <button
                    onClick={() => startChat(friend.id, friend.username)}
                    className="btn-sketch bg-white p-3 text-blue-500"
                  >
                    <MessageCircle className="w-6 h-6" />
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Friends;
