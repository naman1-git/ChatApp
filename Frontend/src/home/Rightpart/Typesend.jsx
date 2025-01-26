import React, { useState } from "react";
import { IoSend } from "react-icons/io5";
import useSendMessage from "../../context/useSendMessage.js";
import EmojiPicker from "emoji-picker-react"; // Import the emoji picker

function Typesend() {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // State for showing emoji picker
  const { loading, sendMessages } = useSendMessage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendMessages(message);
    setMessage("");
  };

  const handleEmojiClick = (emojiData) => {
    setMessage((prevMessage) => prevMessage + emojiData.emoji); // Append emoji to the message
  };

  return (
    <form onSubmit={handleSubmit}>
      <div  className="flex space-x-1 h-[8vh] bg-black items-center">
        <div className="w-[100%] mx-4 relative">
          {/* Show emoji picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-[60px] left-0">
              <EmojiPicker onEmojiClick={handleEmojiClick} height={350} width={300} />
            </div>
          )}

          <input
            type="text"
            placeholder="Type here"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border-[1px] border-black flex items-center w-full py-3 px-3 rounded-xl grow outline-none bg-slate-900 mt-1"
          />
        </div>

        <div>
          {/* Button to toggle emoji picker */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="text-3xl" // Adjust the size here
          >
            <span role="img" aria-label="smiley" style={{ fontSize: "2rem" }}>
              😃
            </span>
          </button>
        </div>

        <button type="submit">
          <IoSend className="text-4xl" />
        </button>
      </div>
    </form>
  );
}

export default Typesend;