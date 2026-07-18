import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Theme state synchronized with localStorage
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  const handleRegister = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await axios.post(`${API_URL}/register`, {
        name,
        email,
        password,
      });

      setSuccess("Account created successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 relative px-4 ${
      theme === "dark" ? "bg-[#090A10]" : "bg-[#FFF9FA]"
    }`}>
      {/* Floating Theme Switcher */}
      <button
        onClick={toggleTheme}
        className={`absolute top-6 right-6 p-2.5 rounded-xl border transition-all duration-300 hover:scale-110 active:scale-95 ${
          theme === "dark"
            ? "bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10"
            : "bg-pink-50/50 border-pink-100 text-purple-600 hover:bg-pink-100"
        }`}
        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {theme === "dark" ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828 0l-.707-.707m12.02-12.02l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      <div className={`p-8 rounded-2xl border w-full max-w-md shadow-2xl transition-all duration-300 ${
        theme === "dark"
          ? "bg-[#12131C]/90 border-white/5 text-white"
          : "bg-white border-pink-100 text-slate-700 shadow-pink-100/30"
      }`}>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 justify-center mb-2">
            <span className="h-2 w-2 rounded-full bg-pink-500 animate-ping"></span>
            <span className="text-lg font-black bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              DevPulse
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Create Account</h1>
          <p className={`text-xs mt-1.5 ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
            Already have an account?{" "}
            <span 
              onClick={() => navigate("/login")} 
              className="text-pink-500 cursor-pointer font-bold hover:underline"
            >
              Login
            </span>
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
              theme === "dark" ? "text-gray-400" : "text-slate-500"
            }`}>Full Name</label>
            <input
              placeholder="Fariha Afaq"
              onChange={(e) => setName(e.target.value)}
              className={`w-full p-3.5 rounded-xl border text-sm font-medium outline-none transition-all duration-300 ${
                theme === "dark"
                  ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                  : "bg-slate-50 border-pink-100 text-slate-700 placeholder-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
              theme === "dark" ? "text-gray-400" : "text-slate-500"
            }`}>Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3.5 rounded-xl border text-sm font-medium outline-none transition-all duration-300 ${
                theme === "dark"
                  ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                  : "bg-slate-50 border-pink-100 text-slate-700 placeholder-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
              theme === "dark" ? "text-gray-400" : "text-slate-500"
            }`}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-3.5 rounded-xl border text-sm font-medium outline-none transition-all duration-300 ${
                theme === "dark"
                  ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                  : "bg-slate-50 border-pink-100 text-slate-700 placeholder-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
              }`}
            />
          </div>
        </div>

        {/* Feedback Messages */}
        {success && (
          <div className={`mt-5 border rounded-xl p-3 text-xs font-bold ${
            theme === "dark"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-green-50 border-green-100 text-green-700"
          }`}>
            <div className="flex items-center gap-2">
              <span>✅</span>
              <p>{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className={`mt-5 border rounded-xl p-3 text-xs font-bold ${
            theme === "dark"
              ? "bg-red-500/10 border-red-500/20 text-red-400"
              : "bg-red-50 border-red-100 text-red-600"
          }`}>
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className={`w-full p-3.5 rounded-xl font-bold mt-6 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2.5 ${
            theme === "dark"
              ? "bg-gradient-to-r from-pink-500 to-purple-600 shadow-pink-500/20"
              : "bg-gradient-to-r from-pink-400 to-purple-500 shadow-pink-200"
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating Account...
            </>
          ) : (
            "Register"
          )}
        </button>
      </div>
    </div>
  );
}

export default Register;
