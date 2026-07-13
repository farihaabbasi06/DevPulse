import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
  setError("");
  setSuccess("");
  setLoading(true);

  try {
    await axios.post("http://localhost:5000/api/register", {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-gray-900 p-6 rounded-lg w-80">

        <h2 className="text-xl mb-4">Register</h2>

        <input
          className="w-full p-2 mb-3 text-black"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
  type="email"
  className="w-full p-2 mb-3 text-black"
  placeholder="Email"
  onChange={(e) => setEmail(e.target.value)}
/>

        <input
          className="w-full p-2 mb-3 text-black"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
  onClick={handleRegister}
  disabled={loading}
  className="bg-pink-500 hover:bg-pink-600 w-full py-2 rounded font-bold disabled:opacity-50 flex justify-center items-center gap-2"
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
{success ? (
  <div className="mt-4 bg-green-100 border border-green-300 rounded-lg p-3">
    <p className="text-green-700 text-sm font-medium">
      {success}
    </p>
  </div>
) : error ? (
  <div className="mt-4 bg-red-100 border border-red-300 rounded-lg p-3">
    <p className="text-red-700 text-sm font-medium">
      {error}
    </p>
  </div>
) : null}

      </div>
    </div>
  );
}

export default Register;