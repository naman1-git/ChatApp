import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const handleReset = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) return toast.error("All fields required");
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/reset-password`, {
        email,
        password,
        confirmPassword,
      });
      toast.success("Password reset successful");
      navigate("/login");
    } catch (err) {
      toast.error("Failed to reset password");
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 items-center justify-center">
      <form className="bg-gray-800 border border-gray-700 px-8 py-6 rounded-lg shadow-xl space-y-4 w-96">
        <h2 className="text-2xl text-white mb-6">Reset Password</h2>
        <input
          type="password"
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button
          onClick={handleReset}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;