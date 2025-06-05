import React, { useEffect, useState } from "react";
import axios from "axios";

function useGetAllUsers() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);

      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/allusers`, {
          withCredentials: true, // REQUIRED to send cookies
          headers: {
            "Content-Type": "application/json",
          },
        });

        setAllUsers(response.data); // ✅ Correct placement
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
