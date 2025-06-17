import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    try {
      const generated = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(generated);
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/send-otp`, {
        email,
        otp: generated,
      });
      toast.success("OTP sent to your email");
      setShowOtpInput(true);
    } catch {
      toast.error("Failed to send OTP");
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp === generatedOtp) {
      toast.success("OTP verified");
      navigate("/reset-password", { state: { email } });
    } else {
      toast.error("Invalid OTP");
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 items-center justify-center">
      <form className="bg-gray-800 border border-gray-700 px-8 py-6 rounded-lg shadow-xl space-y-4 w-96">
        <h2 className="text-2xl text-white mb-6">Forgot Password</h2>
        {!showOtpInput ? (
          <>
            <input
              type="email"
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              onClick={handleSendOtp}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Send OTP
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
            <button
              onClick={handleVerifyOtp}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Verify OTP
            </button>
          </>
        )}
      </form>
    </div>
  );
}

export default ForgotPassword;