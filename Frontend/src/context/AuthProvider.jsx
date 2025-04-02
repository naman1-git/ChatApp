import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const token = Cookies.get("jwt"); // Get JWT Token
  const storedUser = localStorage.getItem("ChatApp");

  let initialUserState = null;
  if (storedUser) {
    try {
      initialUserState = JSON.parse(storedUser); // ✅ Parse only valid JSON
    } catch (error) {
      console.error("❌ Error parsing stored user:", error);
      localStorage.removeItem("ChatApp"); // 🛠️ Clear corrupted data
    }
  }

  const [authUser, setAuthUser] = useState(initialUserState);

  // Fetch user details if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        console.log("❌ No token found, user not authenticated.");
        return;
      }

      try {
        const response = await axios.get("https://chatapp-1-7iuz.onrender.com/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        setAuthUser(response.data);
        localStorage.setItem("ChatApp", JSON.stringify(response.data)); // ✅ Save user data
        console.log("✅ User authenticated:", response.data);
      } catch (error) {
        console.error("❌ Authentication error:", error);
        setAuthUser(null); // Reset user on error
      }
    };

    fetchUser();
  }, [token]); // Runs when token changes

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
