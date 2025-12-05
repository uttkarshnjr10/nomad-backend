import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
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
        <div className="min-h-screen flex items-center justify-center bg-yellow-50 p-6">
            <div className="bg-white border-2 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
                
                {/* Left Side */}
                <div className="md:w-1/2 bg-blue-400 border-r-2 border-black p-10 flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <Sparkles className="w-16 h-16 text-yellow-300 mb-4 animate-bounce" />
                    <h2 className="text-4xl font-black text-white italic tracking-wider drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        JOIN THE <br/> JOURNEY
                    </h2>
                    <p className="text-white font-bold mt-4 border-2 border-black bg-black/20 p-2 rounded-lg backdrop-blur-sm">
                        Drop photos. Connect locally. Travel globally.
                    </p>
                </div>

                {/* Right Side Form */}
                <div className="md:w-1/2 p-10">
                    <h3 className="text-2xl font-black text-gray-800 mb-6 flex items-center">
                        New Passport <UserPlus className="ml-2 w-6 h-6 text-blue-500" />
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Username */}
                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Username</label>
                            <input
                                type="text"
                                className="input-sketch w-full bg-blue-50"
                                placeholder="nomad_king"
                                value={formData.username}
                                onChange={(e) =>
                                    setFormData({ ...formData, username: e.target.value })
                                }
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                className="input-sketch w-full bg-pink-50"
                                placeholder="you@adventure.com"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                className="input-sketch w-full bg-green-50"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-sketch w-full bg-yellow-400 text-black py-3 mt-4 text-lg"
                        >
                            {loading ? "Printing Passport..." : "Create Account"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm font-bold text-gray-500">
                        Already traveling?{' '}
                        <Link
                            to="/login"
                            className="text-blue-500 hover:underline hover:text-blue-600"
                        >
                            Log in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
