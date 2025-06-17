import React, { useState } from "react";
import { IoSend } from "react-icons/io5";
import { FaPaperclip, FaTimesCircle } from "react-icons/fa";
import useSendMessage from "../../context/useSendMessage.js";
import EmojiPicker from "emoji-picker-react";
import { useSocketContext } from "../../context/SocketContext.jsx";
import useConversation from "../../statemanage/useConversation.js";
import axios from "axios";



function Typesend() {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");

  const { loading, sendMessages } = useSendMessage();
  const { socket } = useSocketContext();
  const { selectedConversation } = useConversation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !file) return;

    await sendMessages(message, file);
    setMessage("");
    setFile(null);
    setShowEmojiPicker(false);
  };

  const handleSchedule = async () => {
    if (!message.trim() || !scheduleTime) return;

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/message/schedule`, {
        message,
        sendAt: scheduleTime,
        receiverId: selectedConversation._id,
      }, { withCredentials: true });

      alert("Message scheduled successfully");
      setMessage("");
      setFile(null);
      setScheduleTime("");
      setShowScheduleModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to schedule message");
    }
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

  const getFilePreview = () => {
    if (!file) return null;

    const fileType = file.type;
    const fileURL = URL.createObjectURL(file);

    if (fileType.startsWith("image/")) {
      return <img src={fileURL} alt="preview" className="w-20 h-20 object-contain rounded-md" />;
    } else if (fileType.startsWith("video/")) {
      return <video src={fileURL} className="w-20 h-20 rounded-md" controls />;
    } else if (fileType.startsWith("audio/")) {
      return <audio src={fileURL} controls className="w-48" />;
    } else {
      return <p className="text-white">📄 {file.name}</p>;
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-2 h-[10vh] bg-gradient-to-r from-gray-200/80 to-gray-100/80 backdrop-blur-lg items-center px-5 rounded-2xl shadow-xl relative border border-gray-300/40">
          <label htmlFor="file-input" className="text-white text-2xl cursor-pointer hover:text-blue-400 transition">
            <FaPaperclip />
          </label>
          <input
            id="file-input"
            type="file"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <div className="w-full relative">
            {/* File preview inside typing box */}
            {file && (
              <div className="absolute -top-24 left-0 w-full flex items-center space-x-3 px-3 py-2 bg-slate-800 bg-opacity-90 text-white rounded-lg shadow z-20">
                {getFilePreview()}
                <div className="flex-1">
                  <p className="text-xs font-medium truncate">{file.name}</p>
                  <p className="text-[10px] text-gray-300">{file.type}</p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  type="button"
                  className="text-red-400 text-xl hover:text-red-600 transition"
                  title="Remove file"
                >
                  <FaTimesCircle />
                </button>
              </div>
            )}
            {showEmojiPicker && (
              <div className="absolute bottom-[60px] left-0 z-50 drop-shadow-lg">
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
                if (showEmojiPicker) setShowEmojiPicker(false);
              }}
              className="w-full py-3 px-5 rounded-full bg-slate-700/80 text-white border-none outline-none focus:ring-2 focus:ring-blue-500 transition placeholder-gray-400 shadow-inner"
              // Removed dynamic paddingTop so input height stays the same
            />
          </div>

          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="text-2xl text-white hover:text-yellow-400 transition bg-slate-700/70 rounded-full p-2 shadow hover:scale-110"
            title="Emoji"
          >
            😃
          </button>
          <button
            type="submit"
            disabled={loading}
            className="text-3xl text-white ml-2 bg-gradient-to-tr from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full p-2 shadow-lg transition disabled:opacity-50 hover:scale-105"
            title="Send"
          >
            <IoSend />
          </button>

          <button
            type="button"
            onClick={() => setShowScheduleModal(true)}
            className="ml-2 text-white bg-transparent px-2 py-1 rounded-full shadow-none transition flex items-center"
            title="Schedule message"
          >
            <span className="text-3xl">⏰</span>
          </button>
        </div>
      </form>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 space-y-5 w-[340px] shadow-2xl animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800">Schedule Message</h3>
            <input
              type="datetime-local"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full border-none bg-slate-100 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
            />
            <div className="flex justify-end space-x-3 pt-2">
              <button
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 transition"
                onClick={() => setShowScheduleModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full hover:from-blue-600 hover:to-purple-600 transition"
                onClick={handleSchedule}
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Typesend;
