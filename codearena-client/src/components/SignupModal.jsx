import React, { useState } from "react";
import { Terminal, Lock, User, Mail, Check, ArrowRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function SignupModal({ isOpen, onClose, onSwitchToLogin, redirectTo }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreed: false
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.agreed) {
      setError("You must agree to the Rules & Fair Play Policy");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
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
        onClose();
        navigate(redirectTo || "/dashboard");
      } else {
        setError(data.message || "Registration failed");
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
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-slate-200  max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-20"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4 text-blue-600">
                  <Terminal size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Join CodeArena</h2>
                <p className="text-slate-500 text-sm">Create an account to start battling.</p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Username */}
                <div className="group">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Username</label>
                  <div className={`flex items-center bg-slate-50 border rounded-lg transition-all ${focusedField === "username" ? "border-blue-600 ring-1 ring-blue-600 bg-white" : "border-slate-200"}`}>
                    <div className="pl-4 text-slate-400"><User size={18} /></div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("username")}
                      onBlur={() => setFocusedField(null)}
                      className="w-full bg-transparent text-slate-900 p-3 focus:outline-none placeholder-slate-400 font-medium"
                      placeholder="codewarrior_01"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="group">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                  <div className={`flex items-center bg-slate-50 border rounded-lg transition-all ${focusedField === "email" ? "border-blue-600 ring-1 ring-blue-600 bg-white" : "border-slate-200"}`}>
                    <div className="pl-4 text-slate-400"><Mail size={18} /></div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      className="w-full bg-transparent text-slate-900 p-3 focus:outline-none placeholder-slate-400 font-medium"
                      placeholder="dev@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="group">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Password</label>
                  <div className={`flex items-center bg-slate-50 border rounded-lg transition-all ${focusedField === "password" ? "border-blue-600 ring-1 ring-blue-600 bg-white" : "border-slate-200"}`}>
                    <div className="pl-4 text-slate-400"><Lock size={18} /></div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      className="w-full bg-transparent text-slate-900 p-3 focus:outline-none placeholder-slate-400 font-medium"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="group">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Confirm Password</label>
                  <div className={`flex items-center bg-slate-50 border rounded-lg transition-all ${focusedField === "confirmPassword" ? "border-blue-600 ring-1 ring-blue-600 bg-white" : "border-slate-200"}`}>
                    <div className="pl-4 text-slate-400"><Lock size={18} /></div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("confirmPassword")}
                      onBlur={() => setFocusedField(null)}
                      className="w-full bg-transparent text-slate-900 p-3 focus:outline-none placeholder-slate-400 font-medium"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      name="agreed"
                      id="agreed"
                      checked={formData.agreed}
                      onChange={handleInputChange}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 bg-white checked:border-blue-600 checked:bg-blue-600 transition-all"
                    />
                    <Check size={14} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <label htmlFor="agreed" className="text-xs text-slate-600 cursor-pointer select-none">
                    I agree to the <span className="text-blue-600 hover:underline">Rules</span> & <span className="text-blue-600 hover:underline">Policy</span>
                  </label>
                </div>

                {/* Error & Submit */}
                {error && <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded">{error}</div>}
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                >
                  {isLoading ? "CREATING..." : "CREATE ACCOUNT"}
                  {!isLoading && <ArrowRight size={18} />}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-500">
                Already have an account? <button onClick={onSwitchToLogin} className="text-blue-600 font-bold hover:underline">Log In</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
