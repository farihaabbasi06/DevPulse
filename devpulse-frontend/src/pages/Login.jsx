import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [loading, setLoading] = useState(false);
  
  // Theme state synchronized with localStorage
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/";
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    try {
      await axios.post(`${API_URL}/forgot-password`, {
        email: forgotEmail,
      });
      setMessageType("success");
      setMessage("OTP sent to your email. Check inbox.");
      setStep("otp");
    } catch (err) {
      setMessageType("error");
      setMessage(err.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessageType("error");
      setMessage("Passwords do not match.");
      return;
    }
    try {
      await axios.post(`${API_URL}/reset-password`, {
        email: forgotEmail,
        otp,
        newPassword,
      });
      setMessageType("success");
      setMessage("Password reset successful! Please login.");
      setTimeout(() => setStep("login"), 2000);
    } catch (err) {
      setMessageType("error");
      setMessage(err.response?.data?.message || "Reset failed");
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Helper component to render floating theme toggle on auth screens
  const ThemeToggle = () => (
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
  );

  // STEP 1 — LOGIN
  if (step === "login") return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 relative px-4 ${
      theme === "dark" ? "bg-[#090A10]" : "bg-[#FFF9FA]"
    }`}>
      <ThemeToggle />
      
      <div className={`p-8 rounded-2xl border w-full max-w-md shadow-2xl transition-all duration-300 ${
        theme === "dark"
          ? "bg-[#12131C]/90 border-white/5 text-white"
          : "bg-white border-pink-100 text-slate-700 shadow-pink-100/30"
      }`}>
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 justify-center mb-2">
            <span className="h-2 w-2 rounded-full bg-pink-500 animate-ping"></span>
            <span className="text-lg font-black bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              DevPulse
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Welcome Back</h1>
          <p className={`text-xs mt-1.5 ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
            Don't have an account?{" "}
            <span 
              onClick={() => navigate("/register")} 
              className="text-pink-500 cursor-pointer font-bold hover:underline"
            >
              Register
            </span>
          </p>
        </div>

        <div className="space-y-4">
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

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full p-3.5 rounded-xl font-bold mt-6 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${
            theme === "dark"
              ? "bg-gradient-to-r from-pink-500 to-purple-600 shadow-pink-500/20"
              : "bg-gradient-to-r from-pink-400 to-purple-500 shadow-pink-200"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center mt-5 text-gray-500 text-xs font-medium">
          Forgot password?{" "}
          <span 
            onClick={() => setStep("forgot")} 
            className="text-pink-500 cursor-pointer font-bold hover:underline"
          >
            Reset password
          </span>
        </p>
      </div>
    </div>
  );

  // STEP 2 — ENTER EMAIL FOR OTP
  if (step === "forgot") return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 relative px-4 ${
      theme === "dark" ? "bg-[#090A10]" : "bg-[#FFF9FA]"
    }`}>
      <ThemeToggle />

      <div className={`p-8 rounded-2xl border w-full max-w-md shadow-2xl transition-all duration-300 ${
        theme === "dark"
          ? "bg-[#12131C]/90 border-white/5 text-white"
          : "bg-white border-pink-100 text-slate-700 shadow-pink-100/30"
      }`}>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black tracking-tight mb-2 text-pink-500">Forgot Password</h1>
          <p className={`text-xs max-w-xs mx-auto ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
            Enter your registered email and we will send you an OTP code to reset your password.
          </p>
        </div>

        <div>
          <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
            theme === "dark" ? "text-gray-400" : "text-slate-500"
          }`}>Email Address</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            className={`w-full p-3.5 rounded-xl border text-sm font-medium outline-none transition-all duration-300 mb-4 ${
              theme === "dark"
                ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                : "bg-slate-50 border-pink-100 text-slate-700 placeholder-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
            }`}
          />
        </div>

        {message && (
          <div className={`mb-4 rounded-xl p-3 text-xs text-center font-bold border ${
            messageType === "success"
              ? theme === "dark"
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : "bg-green-50 border-green-100 text-green-700"
              : theme === "dark"
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : "bg-red-50 border-red-100 text-red-700"
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={handleSendOTP}
          className={`w-full p-3.5 rounded-xl font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 ${
            theme === "dark"
              ? "bg-gradient-to-r from-pink-500 to-purple-600 shadow-pink-500/20"
              : "bg-gradient-to-r from-pink-400 to-purple-500 shadow-pink-200"
          }`}
        >
          Send OTP
        </button>

        <p 
          className="text-center mt-5 text-gray-500 text-xs font-bold cursor-pointer hover:underline" 
          onClick={() => setStep("login")}
        >
          ← Back to Login
        </p>
      </div>
    </div>
  );

  // STEP 3 — ENTER OTP + NEW PASSWORD
  if (step === "otp") return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 relative px-4 ${
      theme === "dark" ? "bg-[#090A10]" : "bg-[#FFF9FA]"
    }`}>
      <ThemeToggle />

      <div className={`p-8 rounded-2xl border w-full max-w-md shadow-2xl transition-all duration-300 ${
        theme === "dark"
          ? "bg-[#12131C]/90 border-white/5 text-white"
          : "bg-white border-pink-100 text-slate-700 shadow-pink-100/30"
      }`}>
        <div className="text-center mb-5">
          <h1 className="text-3xl font-black tracking-tight mb-2 text-pink-500">Reset Password</h1>
          <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
            Enter the OTP sent to <b className={theme === "dark" ? "text-white" : "text-slate-700"}>{forgotEmail}</b>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
              theme === "dark" ? "text-gray-400" : "text-slate-500"
            }`}>OTP Code</label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
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
            }`}>New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
            }`}>Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full p-3.5 rounded-xl border text-sm font-medium outline-none transition-all duration-300 ${
                theme === "dark"
                  ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                  : "bg-slate-50 border-pink-100 text-slate-700 placeholder-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
              }`}
            />
          </div>
        </div>

        {message && (
          <div className={`mt-4 rounded-xl p-3 text-xs text-center font-bold border ${
            messageType === "success"
              ? theme === "dark"
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : "bg-green-50 border-green-100 text-green-700"
              : theme === "dark"
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : "bg-red-50 border-red-100 text-red-700"
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={handleResetPassword}
          className={`w-full p-3.5 rounded-xl font-bold mt-6 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 ${
            theme === "dark"
              ? "bg-gradient-to-r from-pink-500 to-purple-600 shadow-pink-500/20"
              : "bg-gradient-to-r from-pink-400 to-purple-500 shadow-pink-200"
          }`}
        >
          Reset Password
        </button>

        <p 
          className="text-center mt-5 text-gray-500 text-xs font-bold cursor-pointer hover:underline" 
          onClick={() => setStep("login")}
        >
          ← Back to Login
        </p>
      </div>
    </div>
  );
}

export default Login;
