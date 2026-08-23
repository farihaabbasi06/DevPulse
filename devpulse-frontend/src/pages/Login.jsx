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

  const inputClass = `w-full p-3 rounded-lg border text-sm font-medium outline-none transition-colors duration-200 ${
    theme === "dark"
      ? "bg-white/[0.03] border-white/10 text-white placeholder-slate-500 focus:border-indigo-500"
      : "bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400 focus:border-indigo-400"
  }`;
  const labelClass = `block text-xs font-medium uppercase tracking-wide mb-1.5 ${
    theme === "dark" ? "text-slate-400" : "text-slate-500"
  }`;
  const cardClass = `p-7 rounded-xl border w-full max-w-sm transition-colors duration-300 ${
    theme === "dark"
      ? "bg-[#12131A] border-white/[0.06] text-white"
      : "bg-white border-slate-200 text-slate-700 shadow-sm"
  }`;
  const primaryButtonClass = "w-full p-3 rounded-lg font-semibold mt-5 text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none";

  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className={`absolute top-6 right-6 p-2 rounded-lg border transition-colors duration-200 ${
        theme === "dark"
          ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
      }`}
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {theme === "dark" ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828 0l-.707-.707m12.02-12.02l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );

  // STEP 1 — LOGIN
  if (step === "login") return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 relative px-4 ${
      theme === "dark" ? "bg-[#0B0C10]" : "bg-[#FAFAFB]"
    }`}>
      <ThemeToggle />

      <div className={cardClass}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 justify-center mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
            <span className="text-sm font-semibold text-indigo-500">
              DevPulse
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className={`text-xs mt-1.5 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-indigo-500 cursor-pointer font-medium hover:underline"
            >
              Register
            </span>
          </p>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <div className={`mt-4 border rounded-lg p-2.5 text-xs font-medium ${
            theme === "dark"
              ? "bg-red-500/10 border-red-500/20 text-red-400"
              : "bg-red-50 border-red-100 text-red-600"
          }`}>
            {error}
          </div>
        )}

        <button onClick={handleLogin} disabled={loading} className={primaryButtonClass}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center mt-4 text-slate-400 text-xs">
          Forgot password?{" "}
          <span
            onClick={() => setStep("forgot")}
            className="text-indigo-500 cursor-pointer font-medium hover:underline"
          >
            Reset password
          </span>
        </p>
      </div>
    </div>
  );

  // STEP 2 — ENTER EMAIL FOR OTP
  if (step === "forgot") return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 relative px-4 ${
      theme === "dark" ? "bg-[#0B0C10]" : "bg-[#FAFAFB]"
    }`}>
      <ThemeToggle />

      <div className={cardClass}>
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold tracking-tight mb-1.5 text-indigo-500">Forgot Password</h1>
          <p className={`text-xs max-w-xs mx-auto ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
            Enter your registered email and we'll send you an OTP to reset your password.
          </p>
        </div>

        <div>
          <label className={labelClass}>Email Address</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            className={`${inputClass} mb-4`}
          />
        </div>

        {message && (
          <div className={`mb-4 rounded-lg p-2.5 text-xs text-center font-medium border ${
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

        <button onClick={handleSendOTP} className={primaryButtonClass.replace("mt-5", "mt-0")}>
          Send OTP
        </button>

        <p
          className="text-center mt-4 text-slate-400 text-xs font-medium cursor-pointer hover:underline"
          onClick={() => setStep("login")}
        >
          ← Back to Login
        </p>
      </div>
    </div>
  );

  // STEP 3 — ENTER OTP + NEW PASSWORD
  if (step === "otp") return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 relative px-4 ${
      theme === "dark" ? "bg-[#0B0C10]" : "bg-[#FAFAFB]"
    }`}>
      <ThemeToggle />

      <div className={cardClass}>
        <div className="text-center mb-5">
          <h1 className="text-xl font-semibold tracking-tight mb-1.5 text-indigo-500">Reset Password</h1>
          <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
            Enter the OTP sent to <b className={theme === "dark" ? "text-white" : "text-slate-700"}>{forgotEmail}</b>
          </p>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className={labelClass}>OTP Code</label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {message && (
          <div className={`mt-4 rounded-lg p-2.5 text-xs text-center font-medium border ${
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

        <button onClick={handleResetPassword} className={primaryButtonClass}>
          Reset Password
        </button>

        <p
          className="text-center mt-4 text-slate-400 text-xs font-medium cursor-pointer hover:underline"
          onClick={() => setStep("login")}
        >
          ← Back to Login
        </p>
      </div>
    </div>
  );
}

export default Login;