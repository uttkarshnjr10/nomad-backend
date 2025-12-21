import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { UserPlus, Sparkles } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await register(formData);

        if (result.success) {
            toast.success("Account created! Please login.");
            navigate('/login');
        } else {
            toast.error(result.message || "Registration failed");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-blue-100 to-purple-100 p-6 relative">

            {/* Floating Pastel Blobs */}
            <div className="absolute w-72 h-72 bg-purple-300/40 blur-3xl rounded-full top-10 left-10"></div>
            <div className="absolute w-64 h-64 bg-pink-300/40 blur-3xl rounded-full bottom-10 right-10"></div>
            <div className="absolute w-52 h-52 bg-blue-300/40 blur-3xl rounded-full bottom-1/4 left-1/3"></div>

            <div className="backdrop-blur-xl bg-white/40 border border-white/60 shadow-xl rounded-3xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row">

                {/* LEFT AESTHETIC PANEL */}
                <div className="md:w-1/2 bg-gradient-to-br from-mint-200 to-mint-300 p-10 flex flex-col justify-center items-center text-center relative">

                    <div className="absolute inset-0 bg-white/20 backdrop-blur-xl rounded-3xl"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <Sparkles className="w-16 h-16 text-purple-500 mb-4 animate-pulse" />

                        <h2 className="text-4xl font-extrabold text-gray-800 leading-tight drop-shadow-md">
                            Explore.<br /> Capture.<br /> Connect.
                        </h2>

                        <p className="mt-4 text-gray-700 font-medium bg-white/40 px-4 py-2 rounded-xl backdrop-blur-md text-sm border border-white/60 shadow-sm">
                            Your travel story starts the moment you join.
                        </p>
                    </div>
                </div>

                {/* RIGHT FORM */}
                <div className="md:w-1/2 p-10 relative">

                    <h3 className="text-3xl font-black text-gray-800 mb-8 flex items-center gap-2">
                        Create Your Passport  
                        <UserPlus className="w-6 h-6 text-purple-500" />
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Username */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1">
                                Username
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-purple-200 bg-white/70 focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
                                placeholder="nomad_king"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-white/70 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
                                placeholder="you@adventure.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-white/70 focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-500 hover:bg-purple-600 active:scale-95 transition text-white py-3 rounded-xl font-semibold text-lg shadow-lg shadow-purple-300 disabled:opacity-60"
                        >
                            {loading ? "Creating Your Passport..." : "Join the Nomads"}
                        </button>
                    </form>

                    {/* LOGIN LINK */}
                    <p className="mt-6 text-center text-sm text-gray-700 font-medium">
                        Already traveling?{" "}
                        <Link to="/login" className="text-purple-600 font-semibold hover:underline">
                            Log in here
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
};

export default Register;
