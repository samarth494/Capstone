import React, { useState } from "react";
import { Terminal, Lock, User, Check, ArrowRight, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginModal({ isOpen, onClose, onSwitchToSignup }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  });

  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setError("");
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.identifier || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.identifier,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        const userToSave = {
          _id: data.user._id,
          username: data.user.username,
          email: data.user.email
        };
        localStorage.setItem("user", JSON.stringify(userToSave));
        onClose(); // Close modal on success
        navigate("/dashboard"); // Or stay on page and update UI? Usually redirect to dashboard or refresh. User said "battle karne jaaun", so maybe stay? But mostly dashboard is the entry. I'll navigate to dashboard to be safe, or just close. let's navigate.
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden z-10 border border-slate-200 dark:border-slate-800"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors z-20"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-4 text-blue-600 dark:text-blue-400">
                  <Terminal size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access CodeArena</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Login to start your battle session.</p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Identifier */}
                <div className="group">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                    Username or Email
                  </label>
                  <div className={`flex items-center bg-slate-50 dark:bg-slate-800 border rounded-lg transition-all ${focusedField === "identifier" ? "border-blue-600 ring-1 ring-blue-600 bg-white dark:bg-slate-900" : "border-slate-200 dark:border-slate-700"}`}>
                    <div className="pl-4 text-slate-400"><User size={18} /></div>
                    <input
                      type="text"
                      name="identifier"
                      value={formData.identifier}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("identifier")}
                      onBlur={() => setFocusedField(null)}
                      className="w-full bg-transparent text-slate-900 p-3.5 focus:outline-none placeholder-slate-400 font-medium"
                      placeholder="Enter credentials"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="group">
                  <div className="flex justify-between items-center mb-1.5 ml-1">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
                    <Link to="/forgot-password" onClick={onClose} className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">Forgot?</Link>
                  </div>
                  <div className={`flex items-center bg-slate-50 dark:bg-slate-800 border rounded-lg transition-all ${focusedField === "password" ? "border-blue-600 ring-1 ring-blue-600 bg-white dark:bg-slate-900" : "border-slate-200 dark:border-slate-700"}`}>
                    <div className="pl-4 text-slate-400"><Lock size={18} /></div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      className="w-full bg-transparent text-slate-900 p-3.5 focus:outline-none placeholder-slate-400 font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Error & Submit */}
                {error && <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded">{error}</div>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                >
                  {isLoading ? "AUTHENTICATING..." : "LOGIN TO BATTLE"}
                  {!isLoading && <ArrowRight size={18} />}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                New warrior? <button onClick={onSwitchToSignup} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Create Account</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
