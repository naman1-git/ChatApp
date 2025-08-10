import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function Signup() {
  const [authUser, setAuthUser] = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [userOtp, setUserOtp] = useState("");
  const [tempUserData, setTempUserData] = useState(null);
  const [profilePic, setProfilePic] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password", "");

  const validatePasswordMatch = (value) => {
    return value === password || "Passwords do not match";
  };

  const handleUpload = async (event) => {
    setIsUploading(true);
    const file = event.target.files[0];
    if (!file) {
      toast.error("No file selected");
      return;
    }

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "chat app");
    data.append("cloud_name", "ddm7nxdwd");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/ddm7nxdwd/image/upload", {
        method: "POST",
        body: data,
      });

      const uploadedImage = await res.json();

      if (uploadedImage.url) {
        setProfilePic(uploadedImage.url);
        toast.success("Profile picture uploaded successfully");
      } else {
        toast.error("Failed to retrieve uploaded image URL");
      }
    } catch (error) {
      console.error("Error uploading file: ", error);
      toast.error("Failed to upload profile picture");
    }
    setIsUploading(false);
  };

  const generateAndSendOTP = async (email) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/send-otp`, {
        email,
        otp,
      });
      toast.success("OTP sent to your email");
      return true;
    } catch (error) {
      toast.error("Failed to send OTP");
      return false;
    }
  };

  const verifyOTP = () => {
    if (userOtp === generatedOtp) {
      return true;
    }
    toast.error("Invalid OTP");
    return false;
  };

  const onSubmit = async (data) => {
    if (!profilePic) {
      toast.error("Please upload a profile picture before signing up.");
      return;
    }

    if (!showOtpInput) {
      const otpSent = await generateAndSendOTP(data.email);
      if (otpSent) {
        setTempUserData({
          fullname: data.fullname,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
          profile_pic: profilePic,
        });
        setShowOtpInput(true);
      }
    } else {
      if (verifyOTP()) {
        try {
          const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/signup`, tempUserData);
          if (response.data) {
            toast.success("Signup successful");
            localStorage.setItem("ChatApp", JSON.stringify(response.data));
            setAuthUser(response.data);
            toast.success("Signup successful");
            localStorage.removeItem("ChatApp");  // optionally clear stored user
            setAuthUser(null);                   // reset auth state
            navigate("/login");   
          }
        } catch (error) {
          if (error.response) {
            toast.error("Error: " + error.response.data.error);
          }
        }
      }
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100">
      {/* Left side with app name */}
      <div className="w-1/2 flex items-center justify-center">
        <h1 className="text-6xl font-bold text-blue-700 drop-shadow">
          Connect
          <span className="block text-lg mt-2 text-blue-400 font-medium">Where conversations come alive</span>
        </h1>
      </div>

      {/* Right side with form */}
      <div className="w-1/2 flex items-center justify-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white border border-blue-100 px-8 py-8 rounded-2xl shadow-2xl space-y-4 w-96"
        >
          <h2 className="text-2xl text-blue-700 mb-6 font-bold">
            Create a new{" "}
            <span className="text-blue-500 font-semibold">Account</span>
          </h2>

          {!showOtpInput ? (
            <>
              <label className="input input-bordered flex items-center gap-2 bg-blue-50 border-blue-100 text-blue-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 opacity-70"
                >
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                </svg>
                <input
                  type="text"
                  className="grow bg-transparent focus:outline-none text-blue-700 placeholder-blue-400"
                  placeholder="Fullname"
                  {...register("fullname", { required: true })}
                />
              </label>
              {errors.fullname && (
                <span className="text-red-400 text-sm">
                  This field is required
                </span>
              )}

              <label className="input input-bordered flex items-center gap-2 bg-blue-50 border-blue-100 text-blue-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 opacity-70"
                >
                  <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                  <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                </svg>
                <input
                  type="email"
                  className="grow bg-transparent focus:outline-none text-blue-700 placeholder-blue-400"
                  placeholder="Email"
                  {...register("email", { required: true })}
                />
              </label>
              {errors.email && (
                <span className="text-red-400 text-sm">
                  This field is required
                </span>
              )}

              <label className="input input-bordered flex items-center gap-2 bg-blue-50 border-blue-100 text-blue-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 opacity-70"
                >
                  <path
                    fillRule="evenodd"
                    d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type="password"
                  className="grow bg-transparent focus:outline-none text-blue-700 placeholder-blue-400"
                  placeholder="Password"
                  {...register("password", { required: true })}
                />
              </label>
              {errors.password && (
                <span className="text-red-400 text-sm">
                  This field is required
                </span>
              )}

              <label className="input input-bordered flex items-center gap-2 bg-blue-50 border-blue-100 text-blue-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 opacity-70"
                >
                  <path
                    fillRule="evenodd"
                    d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type="password"
                  className="grow bg-transparent focus:outline-none text-blue-700 placeholder-blue-400"
                  placeholder="Confirm password"
                  {...register("confirmPassword", {
                    required: true,
                    validate: validatePasswordMatch,
                  })}
                />
              </label>
              {errors.confirmPassword && (
                <span className="text-red-400 text-sm">
                  {errors.confirmPassword.message}
                </span>
              )}

              <div className="space-y-2">
                <label className="block text-sm text-gray-400">Profile Picture</label>
                <input
                  type="file"
                  onChange={handleUpload}
                  required
                  className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-500 file:text-white
                    hover:file:bg-blue-600"
                />
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-400 text-sm">
                Please enter the OTP sent to your email
              </p>
              <input
                type="text"
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
                placeholder="Enter OTP"
                value={userOtp}
                onChange={(e) => setUserOtp(e.target.value)}
                maxLength={6}
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {showOtpInput ? "Verify OTP" : "Sign up"}
          </button>

          <p className="text-gray-400 text-center">
            Have an Account?{" "}
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;