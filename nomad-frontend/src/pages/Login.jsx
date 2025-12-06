import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Plane } from 'lucide-react'; // Added icons
import loginIllustration from '../assets/login-illustration.png'; 

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const [showPassword, setShowPassword] = useState(false); // Password visibility state
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Start animation
        
        // Simulate a tiny delay so the cute animation is visible for at least a moment
        // (Optional, you can remove the setTimeout wrapper if you want instant response)
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
            toast.success("Welcome back, Nomad!");
            navigate('/');
        } else {
            toast.error(result.message);
            setIsLoading(false); // Stop animation on error
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-pink-50 p-4">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
                {/* Left Side - Cartoon Illustration */}
                <div className="md:w-1/2 bg-pink-100 flex items-center justify-center p-8 relative overflow-hidden">
                    <div className="absolute top-10 left-10 w-20 h-20 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute bottom-10 right-10 w-20 h-20 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                    <img 
                        src={loginIllustration} 
                        alt="Cute cartoon illustration" 
                        className="max-w-full h-auto transform hover:scale-105 transition duration-300 relative z-10"
                    />
                </div>

                {/* Right Side - Login Form */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8 font-comic">
                        Login
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-2 ml-2">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-pink-400" />
                                </div>
                                <input
                                    type="email"
                                    className="block w-full pl-10 pr-3 py-3 border-2 border-pink-200 rounded-2xl focus:ring-pink-300 focus:border-pink-300 sm:text-sm font-medium transition duration-200"
                                    placeholder="your.email@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        
                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-2 ml-2">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-pink-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"} // Toggles type
                                    className="block w-full pl-10 pr-10 py-3 border-2 border-pink-200 rounded-2xl focus:ring-pink-300 focus:border-pink-300 sm:text-sm font-medium transition duration-200"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    disabled={isLoading}
                                />
                                {/* Show/Hide Button */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-pink-400 hover:text-pink-600 focus:outline-none cursor-pointer transition-transform hover:scale-110"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <Link to="/forgot-password" className="text-sm font-bold text-pink-400 hover:text-pink-500 transition duration-200">
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-pink-400 text-white py-3 px-4 rounded-2xl hover:bg-pink-500 transition duration-300 font-extrabold text-lg shadow-md hover:shadow-lg transform ${isLoading ? 'cursor-not-allowed opacity-90' : 'hover:-translate-y-1'}`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    {/* Bouncing Plane Animation */}
                                    <Plane className="w-6 h-6 animate-bounce" /> 
                                    <span>Taking Off...</span>
                                </div>
                            ) : (
                                "Log In"
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-600 font-medium">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-pink-400 hover:text-pink-500 font-bold transition duration-200">
                            Sign Up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;