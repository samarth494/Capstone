import React, { useState } from "react";
import { Lock, ArrowRight, Terminal, CheckCircle2 } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";

export default function ResetPasswordPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/resetpassword/${token}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    navigate("/login");
                }, 3000);
            } else {
                setError(data.message || "Failed to reset password. The link may be expired.");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 font-['JetBrains_Mono'] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
            <div className="w-full max-w-md shadow-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative z-10 overflow-hidden p-8 transition-colors duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>

                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 transition-colors">
                        <Terminal size={24} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">
                        CodeBattle
                    </h1>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">
                        New Password
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">
                        Please enter your new password below.
                    </p>
                </div>

                {success ? (
                    <div className="space-y-6 text-center">
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 transition-colors">
                                <CheckCircle2 size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Password Reset!</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">
                                Your password has been successfully updated. Redirecting to login...
                            </p>
                        </div>
                        <Link
                            to="/login"
                            className="w-full flex items-center justify-center p-4 bg-slate-900 dark:bg-blue-600 rounded-lg text-white font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition-all text-sm"
                        >
                            Login Now
                        </Link>
                    </div>
                ) : (
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="relative group">
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1 transition-colors">
                                New Password
                            </label>
                            <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus-within:border-blue-600 dark:focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-600 dark:focus-within:ring-blue-500 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all duration-300">
                                <div className="pl-4 text-slate-400 dark:text-slate-500">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-transparent text-slate-900 dark:text-white p-3.5 focus:outline-none placeholder-slate-400 dark:placeholder-slate-600 font-medium text-sm transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1 transition-colors">
                                Confirm Password
                            </label>
                            <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus-within:border-blue-600 dark:focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-600 dark:focus-within:ring-blue-500 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all duration-300">
                                <div className="pl-4 text-slate-400 dark:text-slate-500">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-transparent text-slate-900 dark:text-white p-3.5 focus:outline-none placeholder-slate-400 dark:placeholder-slate-600 font-medium text-sm transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && <div className="text-red-500 dark:text-red-400 text-xs font-medium">{error}</div>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full group relative flex items-center justify-center gap-3 p-4 bg-blue-600 rounded-lg text-white font-bold tracking-wide hover:bg-blue-700 transition-all duration-300 disabled:opacity-70"
                        >
                            <span>{isLoading ? "UPDATING..." : "UPDATE PASSWORD"}</span>
                            {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
