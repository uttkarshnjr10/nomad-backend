import { Home, MessageSquare, PlusSquare, LogOut, Compass, Users } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext'; 

const Navbar = () => {
    const { logout, user } = useAuth();
    const { totalUnread } = useSocket(); 
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) =>
        location.pathname === path
            ? "text-pink-500 bg-pink-50"
            : "text-gray-600 hover:bg-gray-50";

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <nav className="hidden md:flex w-full h-16 bg-white border-b-2 border-black z-50 shrink-0 justify-between items-center px-8">
                <div className="flex items-center space-x-2">
                    <div className="bg-pink-400 border-2 border-black p-1 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Compass className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tighter">
                        Nomad<span className="text-pink-500">.</span>
                    </h1>
                </div>

                <div className="flex space-x-6">
                    <Link to="/" className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 border-2 border-transparent hover:border-black ${isActive('/')}`}>
                        <Home className="w-5 h-5" /> <span>Feed</span>
                    </Link>

                    <Link to="/friends" className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 border-2 border-transparent hover:border-black ${isActive('/friends')}`}>
                        <Users className="w-5 h-5" /> <span>Friends</span>
                    </Link>

                    <Link to="/chat" className={`relative px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 border-2 border-transparent hover:border-black ${isActive('/chat')}`}>
                        <MessageSquare className="w-5 h-5" /> <span>Chat</span>
                        {totalUnread > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                {totalUnread}
                            </span>
                        )}
                    </Link>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="w-6 h-6 bg-yellow-300 rounded-full border border-black flex items-center justify-center text-xs font-bold">
                            {user?.username?.[0]?.toUpperCase() || "U"}
                        </div>
                        <span className="font-bold text-sm">{user?.username}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 hover:text-red-500 transition border-2 border-transparent hover:border-black rounded-xl"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            <div className="md:hidden fixed bottom-0 w-full bg-white border-t-2 border-black z-50 flex justify-around items-center py-3 pb-safe">
                <Link to="/" className={`p-2 rounded-xl ${isActive('/')}`}>
                    <Home className="w-7 h-7" />
                </Link>

                <Link to="/friends" className={`p-2 rounded-xl ${isActive('/friends')}`}>
                    <Users className="w-7 h-7" />
                </Link>

                <div className="relative -top-6">
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="bg-pink-400 border-2 border-black p-4 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white transform active:scale-95 transition"
                    >
                        <PlusSquare className="w-8 h-8" />
                    </button>
                </div>

                <Link to="/chat" className={`relative p-2 rounded-xl ${isActive('/chat')}`}>
                    <MessageSquare className="w-7 h-7" />
                    {totalUnread > 0 && (
                        <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full border border-white">
                            {totalUnread}
                        </span>
                    )}
                </Link>
            </div>
        </>
    );
};

export default Navbar;
