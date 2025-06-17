import { useEffect } from "react";
import { useSocketContext } from "./SocketContext";
import useConversation from "../statemanage/useConversation.js";
import sound from "../assets/notification.mp3";
import axios from "axios";

const useGetSocketMessage = () => {
  const { socket } = useSocketContext();
  const { setMessage, selectedConversation } = useConversation();

  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", async (newMessage) => {
      console.log("Received newMessage", newMessage);
      const notification = new Audio(sound);
      notification.play();

      // Fetch latest messages from backend
      if (selectedConversation && selectedConversation._id) {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/message/get/${selectedConversation._id}`,
            { withCredentials: true }
          );
          setMessage(res.data);
        } catch (error) {
          console.log("Error refreshing messages", error);
        }
      }
    });

    socket.on("reaction-updated", ({ messageId, userId, emoji }) => {
      setMessage((prevMessages) => {
        if (!Array.isArray(prevMessages)) return [];
        return prevMessages.map((msg) => {
          if (msg._id === messageId) {
            let reactions = msg.reactions ? [...msg.reactions] : [];
            const index = reactions.findIndex((r) => r.userId === userId);
            if (index !== -1) {
              if (emoji === null) {
                reactions.splice(index, 1); // remove
              } else {
                reactions[index].emoji = emoji; // update
              }
            } else if (emoji) {
              reactions.push({ userId, emoji }); // add
            }
            return { ...msg, reactions };
          }
          return msg;
        });
      });
    });

    return () => {
      socket.off("newMessage");
      socket.off("reaction-updated");
    };
  }, [socket, setMessage, selectedConversation]);
};

export default useGetSocketMessage;
