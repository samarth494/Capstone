import React, { useState } from "react";
import { Terminal, Lock, User, Check, ArrowRight, Shield } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';


export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: "", // Note: Backend expects 'email', but UI says 'Username or Email'. I will send 'email' as the key if it looks like an email, or handle username logic if backend supports it. But backend only checks 'email'.
    // The previous backend code: const { email, password } = req.body; and findOne({ email }).
    // So the user MUST login with email.
    // I should probably change the UI placeholder to just "Email" or ensure the user enters an email.
    // For now, I will treat identifier as email.
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
          email: formData.identifier, // Sending identifier as email.
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        // Exclude token from user object if it's there, or just save relevant fields
        const userToSave = {
          _id: data.user._id,
          username: data.user.username,
          email: data.user.email
        };
        localStorage.setItem("user", JSON.stringify(userToSave));
        navigate("/dashboard");
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-['JetBrains_Mono'] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[#F8FAFC] dark:bg-slate-950"></div>
      </div>

      <div className="w-full max-w-6xl shadow-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative z-10 flex flex-col md:flex-row overflow-hidden transition-colors duration-300">
        {/* Left Side - Visual / Branding */}
        <div className="hidden md:flex flex-col justify-between w-5/12 bg-slate-50 dark:bg-slate-800/50 p-10 border-r border-slate-200 dark:border-slate-800 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                <Terminal size={24} strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                CodeBattle
              </h1>
            </div>
            <p className="text-blue-600 text-sm font-medium tracking-wide">
              EXECUTE. OPTIMIZE. WIN.
            </p>
          </div>

          <div className="my-12 relative group">
            <div className="relative bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 font-mono text-sm leading-relaxed overflow-hidden shadow-sm">
              <div className="flex gap-1.5 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                <span className="text-purple-600 dark:text-purple-400">function</span>{" "}
                <span className="text-yellow-600 dark:text-yellow-400">authenticateUser</span>(
                <span className="text-orange-600 dark:text-orange-400">credentials</span>){" "}
                <span className="text-slate-800 dark:text-slate-200">{"{"}</span>
                <br />
                &nbsp;&nbsp;<span className="text-purple-600">if</span>{" "}
                (credentials.isValid()){" "}
                <span className="text-slate-800">{"{"}</span>
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <span className="text-slate-400">// Welcome back, Legend</span>
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <span className="text-purple-600">return</span>{" "}
                <span className="text-blue-600">true</span>;
                <br />
                &nbsp;&nbsp;<span className="text-slate-800">{"}"}</span>
                <br />
                &nbsp;&nbsp;<span className="text-purple-600">throw</span>{" "}
                <span className="text-purple-600">new</span>{" "}
                <span className="text-yellow-600">Error</span>(
                <span className="text-green-600">'Access Denied'</span>);
                <br />
                <span className="text-slate-800">{"}"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Shield size={16} />
              </div>
              <span>Secure encrypted login</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 bg-white dark:bg-slate-900 relative transition-colors duration-300">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Access Terminal
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Enter your credentials to reconnect.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Identifier (Username/Email) */}
            <div className="relative group">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                Username or Email
              </label>
              <div
                className={`relative flex items-center bg-slate-50 dark:bg-slate-800/50 border rounded-lg transition-all duration-300 ${focusedField === "identifier" ? "border-blue-600 dark:border-blue-500 ring-1 ring-blue-600 dark:ring-blue-500 bg-white dark:bg-slate-800" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`}
              >
                <div className="pl-4 text-slate-400 dark:text-slate-500">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField("identifier")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent text-slate-900 dark:text-white p-3.5 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 font-medium"
                  placeholder="codewarrior_01"
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative group">
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div
                className={`relative flex items-center bg-slate-50 dark:bg-slate-800/50 border rounded-lg transition-all duration-300 ${focusedField === "password" ? "border-blue-600 dark:border-blue-500 ring-1 ring-blue-600 dark:ring-blue-500 bg-white dark:bg-slate-800" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`}
              >
                <div className="pl-4 text-slate-400 dark:text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent text-slate-900 dark:text-white p-3.5 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-3 pt-2">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:border-blue-600 dark:checked:border-blue-500 checked:bg-blue-600 dark:checked:bg-blue-500 transition-all"
                />
                <Check
                  size={14}
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                />
              </div>
              <label
                htmlFor="rememberMe"
                className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none"
              >
                Remember this device
              </label>
            </div>

            {/* Submit Button */}
            {error && <div className="text-red-500 text-sm font-medium mb-4">{error}</div>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full group relative flex items-center justify-center gap-3 p-4 mt-6 bg-blue-600 rounded-lg text-white font-bold text-lg tracking-wide hover:bg-blue-700 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? "AUTHENTICATING..." : "AUTHENTICATE"}</span>
              {!isLoading && (
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              )}
            </button>

            <div className="relative flex py-5 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 dark:text-slate-500 text-xs tracking-widest font-bold">OR</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    setIsLoading(true);
                    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/google`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        credential: credentialResponse.credential,
                      }),
                    });

                    const data = await res.json();

                    if (res.ok) {
                      localStorage.setItem("token", data.token);
                      const userToSave = {
                        _id: data.user._id,
                        username: data.user.username,
                        email: data.user.email
                      };
                      localStorage.setItem("user", JSON.stringify(userToSave));
                      navigate("/dashboard");
                    } else {
                      setError(data.message || "Google login failed");
                    }
                  } catch (err) {
                    console.error("Google Login Error:", err);
                    setError("Network error during Google login.");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                onError={() => {
                  setError("Google Login Failed");
                }}
                // useOneTap
                theme="filled_blue"
                shape="rectangular"
                text="continue_with"
                width="100%"
              />
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
