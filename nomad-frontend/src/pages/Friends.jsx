import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import { friendApi } from '../services/api';
import { Search, UserPlus, Check, MessageCircle, User } from 'lucide-react';
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
            console.log(err);
        }
    };

    const sendRequest = async (id) => {
        try {
            await friendApi.sendRequest(id);
            toast.success('Friend request sent!');
            setResults(prev => prev.filter(u => u.id !== id));
        } catch (err) {
            toast.error(err.response?.data || 'Failed to send request');
        }
    };

    const acceptRequest = async (requestId) => {
        try {
            await friendApi.acceptRequest(requestId);
            toast.success('Friend added!');
            loadRequests();
        } catch (err) {
            toast.error('Failed to accept');
            console.log(err);
        }
    };

    const startChat = (friendId, username) => {
        navigate('/chat', { state: { friendId, username } });
    };

    return (
        <div className="min-h-screen bg-yellow-50 pb-24 md:pt-24">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4">
                <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveTab('friends')}
                        className={`px-6 py-2 rounded-xl font-black border-2 border-black transition ${activeTab === 'friends' ? 'bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-gray-50'}`}
                    >
                        My Friends
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-6 py-2 rounded-xl font-black border-2 border-black transition ${activeTab === 'requests' ? 'bg-pink-400 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-gray-50'}`}
                    >
                        Requests
                        {requests.length > 0 && <span className="ml-2 bg-white text-black px-2 rounded-full text-xs">{requests.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`px-6 py-2 rounded-xl font-black border-2 border-black transition ${activeTab === 'search' ? 'bg-blue-400 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-gray-50'}`}
                    >
                        Find People
                    </button>
                </div>

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

                        <div className="space-y-4">
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
                                    <button onClick={() => sendRequest(user.id)} className="btn-sketch bg-green-400 p-2 hover:bg-green-500">
                                        <UserPlus className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            ))}
                            {results.length === 0 && query && <p className="text-center text-gray-400 font-bold">No nomads found.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div className="space-y-4">
                        {requests.length === 0 && (
                            <div className="text-center py-10">
                                <div className="text-4xl mb-2">📭</div>
                                <p className="font-bold text-gray-500">No pending requests</p>
                            </div>
                        )}
                        {requests.map(req => (
                            <div key={req.id} className="card-sketch p-4 flex justify-between items-center bg-pink-50">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-white rounded-full border-2 border-black flex items-center justify-center font-bold">
                                        {req.sender.username[0].toUpperCase()}
                                    </div>
                                    <span className="font-bold">{req.sender.username}</span>
                                </div>
                                <button onClick={() => acceptRequest(req.id)} className="btn-sketch bg-black text-white px-4 py-2 flex items-center space-x-2 text-sm">
                                    <Check className="w-4 h-4" /> <span>Accept</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'friends' && (
                    <div className="space-y-4">
                        {friends.length === 0 && (
                            <div className="text-center py-10">
                                <div className="text-4xl mb-2">🌵</div>
                                <p className="font-bold text-gray-500">You are traveling alone.</p>
                                <button onClick={() => setActiveTab('search')} className="text-blue-500 font-bold underline mt-2">Find a companion</button>
                            </div>
                        )}
                        {friends.map(friend => (
                            <div key={friend.id} className="card-sketch p-4 flex justify-between items-center hover:bg-white transition">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-yellow-200 rounded-full border-2 border-black flex items-center justify-center font-black text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        {friend.username[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{friend.username}</h3>
                                        <div className="flex items-center text-xs font-bold text-green-500">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                                            Online
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => startChat(friend.id, friend.username)} className="btn-sketch bg-white p-3 hover:bg-blue-50 text-blue-500">
                                    <MessageCircle className="w-6 h-6" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Friends;
