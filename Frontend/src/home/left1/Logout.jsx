import React, { useState, useEffect } from "react";
import { TbLogout2 } from "react-icons/tb";
import { GrSettingsOption } from "react-icons/gr";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

function Logout() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/logout`);
      localStorage.removeItem("ChatApp");
      Cookies.remove("jwt");
      setLoading(false);
      toast.success("Logged out successfully");
      window.location.reload();
    } catch (error) {
      console.log("Error in Logout", error);
      toast.error("Error in logging out");
    }
  };

  return (
    <div>
      {/* Logout Button */}
      <div className="p-3 flex flex-col items-center">
        <button
          onClick={handleLogout}
          disabled={loading}
          className="bg-gradient-to-tr from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 rounded-lg shadow transition-all duration-300 p-2"
          title="Logout"
        >
          <TbLogout2 className="text-4xl text-blue-600" />
        </button>
        {loading && (
          <span className="mt-2 text-xs text-blue-500 animate-pulse">
            Logging out...
          </span>
        )}
      </div>
    </div>
  );
}

export default Logout;
