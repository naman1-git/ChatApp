import React, { useState } from "react";
import { IoSend } from "react-icons/io5";
import useSendMessage from "../../context/useSendMessage.js";
import EmojiPicker from "emoji-picker-react";
import { useSocketContext } from "../../context/SocketContext.jsx";
import useConversation from "../../statemanage/useConversation.js";

function Typesend() {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { loading, sendMessages } = useSendMessage();
  const { socket } = useSocketContext();
  const { selectedConversation } = useConversation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    await sendMessages(message);
    setMessage("");
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleTyping = () => {
    if (socket && selectedConversation) {
      socket.emit("typing", {
        senderId: JSON.parse(localStorage.getItem("ChatApp")).user._id,
        receiverId: selectedConversation._id,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex space-x-1 h-[10vh] bg-black items-center px-4">
        <div className="w-full relative">
          {showEmojiPicker && (
            <div className="absolute bottom-[60px] left-0 z-50">
              <EmojiPicker onEmojiClick={handleEmojiClick} height={350} width={300} />
            </div>
          )}

          <input
            type="text"
            placeholder="Type here..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            className="border border-black w-full py-3 px-4 rounded-xl bg-slate-900 text-white outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="text-2xl text-white"
        >
          😃
        </button>

        <button type="submit" disabled={loading} className="text-3xl text-white ml-2">
          <IoSend />
        </button>
      </div>
    </form>
  );
}

export default Typesend;