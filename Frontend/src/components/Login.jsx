import axios from "axios";
import React from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthProvider";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function Login() {
  const [authUser, setAuthUser] = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    const userInfo = {
      email: data.email,
      password: data.password,
    };

    axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/login`, userInfo, {
      withCredentials: true, // If cookies/sessions are used
    })
    
      .then((response) => {
        if (response.data) {
          toast.success("Login successful");
        }
        localStorage.setItem("ChatApp", JSON.stringify(response.data));
        setAuthUser(response.data);
      })
      .catch((error) => {
        if (error.response) {
          toast.error("Error: " + error.response.data.error);
        }
      });
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
            Login to your{" "}
            <span className="text-blue-500 font-semibold">Account</span>
          </h2>

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

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow"
          >
            Login
          </button>

          <p className="text-blue-500 text-center">
            Don't have an Account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-400 underline"
            >
              Sign up
            </Link>
          </p>
          <p className="text-blue-400 text-center mt-2">
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:text-blue-400 underline"
            >
              Forgot Password?
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;