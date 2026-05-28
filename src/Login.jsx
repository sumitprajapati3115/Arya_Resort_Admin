import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("adminToken", data.token);
        navigate("/dashboard");
      } else {
        setError(data.message || "Invalid Email or Password");
      }
    } catch (err) {
      setError("Backend is not running. Start the backend server.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border-t-4 border-[#391827]">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-[#391827]">Arya Admin</h2>
          <p className="text-gray-500 text-sm mt-2">Sign in to manage your resort</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e6b854]"
                placeholder="admin@aryaresort.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e6b854]"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-[#391827] hover:bg-[#2d111e] text-white font-bold py-3.5 rounded-xl transition-all shadow-md">
            Secure Login
          </button>
        </form>
      </div>
    </div>
  );
};
export default Login;