import React, { useEffect } from "react";
import { useSocketContext } from "./SocketContext";
import useConversation from "../statemanage/useConversation.js";
import sound from "../assets/notification.mp3";

const useGetSocketMessage = () => {
  const { socket } = useSocketContext();
  const { messages, setMessage } = useConversation();

  useEffect(() => {
    socket.on("newMessage", (newMessage) => {
      const notification = new Audio(sound);
      notification.play();
      setMessage([...messages, newMessage]);
    });

    socket.on("reaction-updated", ({ messageId, userId, emoji }) => {
      const updated = messages.map((msg) => {
        if (msg._id === messageId) {
          let reactions = msg.reactions || [];
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
      setMessage(updated);
    });

    return () => {
      socket.off("newMessage");
      socket.off("reaction-updated");
    };
  }, [socket, messages, setMessage]);
};

export default useGetSocketMessage;
