import React, { useState } from "react";
import useConversation from "../statemanage/useConversation.js";
import axios from "axios";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessage, selectedConversation } = useConversation();

  const sendMessages = async (text, file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (text) formData.append("message", text);
      if (file) formData.append("file", file);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/message/send/${selectedConversation._id}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage([...messages, res.data]);
    } catch (error) {
      console.error("Error in send messages", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, sendMessages };
};

export default useSendMessage;
