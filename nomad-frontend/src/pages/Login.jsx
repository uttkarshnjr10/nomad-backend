import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Plane } from 'lucide-react';
import loginIllustration from '../assets/login-illustration.png';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await login(formData.email, formData.password);

        if (result.success) {
            toast.success("Welcome back, Nomad!");
            navigate('/');
        } else {
            toast.error(result.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 p-4 relative overflow-hidden">

            {/* Floating Pastel Blobs */}
            <div className="absolute w-72 h-72 bg-pink-300/40 blur-3xl rounded-full top-10 left-10"></div>
            <div className="absolute w-64 h-64 bg-purple-300/40 blur-3xl rounded-full bottom-10 right-10"></div>
            <div className="absolute w-56 h-56 bg-blue-300/40 blur-3xl rounded-full bottom-1/3 left-1/2"></div>

            <div className="relative backdrop-blur-xl bg-white/40 border border-white/50 shadow-2xl rounded-3xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row">

                {/* LEFT ILLUSTRATION PANEL */}
                <div className="md:w-1/2 bg-gradient-to-br from-pink-100 to-purple-100 p-8 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-lg rounded-3xl"></div>

                    <img
                        src={loginIllustration}
                        alt="Login Illustration"
                        className="relative z-10 w-4/5 md:w-full max-h-[340px] object-contain drop-shadow-xl transform hover:scale-105 transition"
                    />
                </div>

                {/* RIGHT FORM PANEL */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">

                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 text-center mb-8">
                        Welcome Back ✨
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-purple-400" />
                                <input
                                    type="email"
                                    placeholder="your.email@example.com"
                                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-purple-200 bg-white/70 focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition text-sm md:text-base"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-purple-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-purple-200 bg-white/70 focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition text-sm md:text-base"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    disabled={isLoading}
                                />

                                {/* Show / Hide Password */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-purple-400 hover:text-purple-600 transition"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="text-right">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-purple-500 hover:text-purple-600 font-semibold transition"
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-purple-500 hover:bg-purple-600 active:scale-95 transition text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-purple-300 disabled:opacity-60"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Plane className="w-6 h-6 animate-bounce" />
                                    <span>Taking Off...</span>
                                </div>
                            ) : (
                                'Log In'
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <p className="mt-8 text-center text-sm text-gray-700 font-medium">
                        New here?{' '}
                        <Link
                            to="/register"
                            className="text-purple-600 hover:text-purple-700 font-bold transition"
                        >
                            Create an Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
