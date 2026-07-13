import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

 useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) navigate("/");
}, [navigate]);

  const handleLogin = async () => {
  setError("");
  setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
navigate("/");
    } catch (err) {
  setError(
    err.response?.data?.message ||
    "Invalid email or password."
  );
}finally {
  setLoading(false);
}
  };

  const handleSendOTP = async () => {
    try {
      await axios.post("http://localhost:5000/api/forgot-password", {
        email: forgotEmail,
      });
      setMessageType("success");
      setMessage("OTP sent to your email. Check inbox.");
      setStep("otp");
    } catch (err) {
      setMessageType("error");
setMessage("Email not found in our system.");
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessageType("error");
setMessage("Passwords do not match.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/reset-password", {
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

  // STEP 1 — LOGIN
  if (step === "login") return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-gray-900 p-8 rounded-xl border border-pink-500 w-full max-w-md shadow-lg">
        <h1 className="text-3xl font-bold text-pink-500 text-center mb-6">Login</h1>

        <p className="text-center mb-4 text-gray-400">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")} className="text-pink-500 cursor-pointer">
            Register
          </span>
        </p>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 rounded bg-black border border-gray-600 text-white outline-none focus:border-pink-500"
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 rounded bg-black border border-gray-600 text-white outline-none focus:border-pink-500"
        />

        <button
  onClick={handleLogin}
  disabled={loading}
  className="w-full bg-pink-500 hover:bg-pink-600 p-3 rounded font-bold disabled:opacity-50"
>
  {loading ? "Logging in..." : "Login"}
</button>
        {error && (
  <div className="mt-4 bg-red-100 border border-red-400 rounded-lg p-3">
    <p className="text-red-700 text-sm font-medium">
      {error}
    </p>
  </div>
)}

        <p className="text-center mt-3 text-gray-500 text-sm">
          Forgot password?{" "}
          <span onClick={() => setStep("forgot")} className="text-pink-500 cursor-pointer">
            Reset
          </span>
        </p>
      </div>
    </div>
  );

  // STEP 2 — ENTER EMAIL FOR OTP
  if (step === "forgot") return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-gray-900 p-8 rounded-xl border border-pink-500 w-full max-w-md shadow-lg">
        <h1 className="text-3xl font-bold text-pink-500 text-center mb-6">Forgot Password</h1>
        <p className="text-gray-400 text-center mb-6">Enter your registered email and we will send you an OTP.</p>

        <input
          type="email"
          placeholder="Enter your email"
          onChange={(e) => setForgotEmail(e.target.value)}
          className="w-full p-3 mb-4 rounded bg-black border border-gray-600 text-white outline-none focus:border-pink-500"
        />

        {message && (
  <div
    className={`mb-3 rounded-lg p-3 text-sm text-center font-medium ${
      messageType === "success"
        ? "bg-green-100 text-green-700 border border-green-300"
        : "bg-red-100 text-red-700 border border-red-300"
    }`}
  >
    {message}
  </div>
)}

        <button
          onClick={handleSendOTP}
          className="w-full bg-pink-500 hover:bg-pink-600 p-3 rounded font-bold transition"
        >
          Send OTP
        </button>

        <p className="text-center mt-4 text-gray-500 text-sm cursor-pointer" onClick={() => setStep("login")}>
          Back to Login
        </p>
      </div>
    </div>
  );

  // STEP 3 — ENTER OTP + NEW PASSWORD
  if (step === "otp") return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-gray-900 p-8 rounded-xl border border-pink-500 w-full max-w-md shadow-lg">
        <h1 className="text-3xl font-bold text-pink-500 text-center mb-6">Reset Password</h1>
        <p className="text-gray-400 text-center mb-4">Enter the OTP sent to <b>{forgotEmail}</b></p>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-3 mb-4 rounded bg-black border border-gray-600 text-white outline-none focus:border-pink-500"
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-3 mb-4 rounded bg-black border border-gray-600 text-white outline-none focus:border-pink-500"
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-3 mb-4 rounded bg-black border border-gray-600 text-white outline-none focus:border-pink-500"
        />

        {message && (
  <div
    className={`mb-3 rounded-lg p-3 text-sm text-center font-medium ${
      messageType === "success"
        ? "bg-green-100 text-green-700 border border-green-300"
        : "bg-red-100 text-red-700 border border-red-300"
    }`}
  >
    {message}
  </div>
)}

        <button
          onClick={handleResetPassword}
          className="w-full bg-pink-500 hover:bg-pink-600 p-3 rounded font-bold transition"
        >
          Reset Password
        </button>

        <p className="text-center mt-4 text-gray-500 text-sm cursor-pointer" onClick={() => setStep("login")}>
          Back to Login
        </p>
      </div>
    </div>
  );
}

export default Login;