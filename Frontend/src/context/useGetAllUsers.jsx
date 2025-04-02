import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";

function useGetAllUsers() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      const token = Cookies.get("jwt");

      if (!token) {
        console.log("No token found, skipping API call");
        setLoading(false);
        return;
      }

      try {
        axios.get("https://chatapp-1-7iuz.onrender.com/api/user/allusers", {
          withCredentials: true, // This ensures cookies are sent with the request
          headers: {
            "Content-Type": "application/json",
          },
        });        
        

        setAllUsers(response.data);
      } catch (error) {
        console.error("Error in useGetAllUsers:", error);
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, []); // Run only once on mount

  return [allUsers, loading];
}

export default useGetAllUsers;
