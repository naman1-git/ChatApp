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
    <div >
      {/* Logout Button */}
      <div className="p-3">
        <button onClick={handleLogout}>
          <TbLogout2 className="text-5xl p-2 hover:bg-gray-600 rounded-lg duration-300" />
        </button>
       
      </div>

   
    </div>
  );
}

export default Logout;
