import React, { useState } from "react";
import useConversation from "../statemanage/useConversation.js";
import axios from "axios";
const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessage, selectedConversation } = useConversation();
  const sendMessages = async (message) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `https://chatapp-1-7iuz.onrender.com/api/message/send/${selectedConversation._id}`,
        { message } ,  { withCredentials: true }
      );
      setMessage([...messages, res.data]);
      setLoading(false);
    } catch (error) {
      console.error("Error in send messages", error.response?.data || error.message);

      setLoading(false);
    }
  };
  return { loading, sendMessages };
};

export default useSendMessage;
