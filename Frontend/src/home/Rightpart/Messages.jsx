import React, { useEffect, useRef } from "react";
import Message from "./Message";
import useGetMessage from "../../context/useGetMessage.js";
import Loading from "../../components/Loading.jsx";
import useGetSocketMessage from "../../context/useGetSocketMessage.js";
import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../statemanage/useConversation.js";

function Messages() {
  const { loading, messages } = useGetMessage();
  const { socket } = useSocketContext();
  const authUser = JSON.parse(localStorage.getItem("ChatApp"));
  const { selectedConversation } = useConversation();

  useGetSocketMessage(); // listing incoming messages
  console.log(messages);

  const safeMessages = Array.isArray(messages) ? messages : [];

  const lastMsgRef = useRef();

  useEffect(() => {
    if (!lastMsgRef.current) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          safeMessages.length > 0
        ) {
          // Mark all unseen messages received by me as seen
          const unseenMsgs = safeMessages.filter(
            (msg) =>
              msg.receiverId === authUser.user._id &&
              !msg.seen
          );
          unseenMsgs.forEach((msg) => {
            socket.emit("seen", { messageId: msg._id, userId: authUser.user._id });
          });
        }
      },
      { threshold: 0.7 }
    );
    observer.observe(lastMsgRef.current);
    return () => observer.disconnect();
  }, [safeMessages, socket, authUser]);

  // Scroll to last message when messages change
  useEffect(() => {
    if (!loading && lastMsgRef.current) {
      setTimeout(() => {
        lastMsgRef.current.scrollIntoView({ behavior: "auto", block: "end" });
      }, 150); // Slightly longer delay for async fetch
    }
  }, [loading, safeMessages.length, selectedConversation]);
  // Notice: use safeMessages.length instead of the array itself

  return (
    <div className="flex-1 overflow-y-auto" style={{ minHeight: "calc(90vh - 8vh)" }}>
      {loading ? (
        <Loading />
      ) : (
        safeMessages.length > 0 &&
        safeMessages.map((message, idx) => (
          <div
            key={message._id}
            ref={idx === safeMessages.length - 1 ? lastMsgRef : null}
          >
            <Message message={message} />
          </div>
        ))
      )}

      {!loading && safeMessages.length === 0 && (
        <div>
          <p className="text-center mt-[20%]">
            Say! Hi to start the conversation
          </p>
        </div>
      )}
    </div>
  );
}

export default Messages;
