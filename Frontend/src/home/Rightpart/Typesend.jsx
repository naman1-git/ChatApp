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
        {file && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-slate-800 text-white">
            {getFilePreview()}
            <div className="flex-1">
              <p className="text-sm truncate">{file.name}</p>
              <p className="text-xs text-gray-300">{file.type}</p>
            </div>
            <button onClick={() => setFile(null)} type="button" className="text-red-400 text-lg">
              <FaTimesCircle />
            </button>
          </div>
        )}

        <div className="flex space-x-1 h-[10vh] bg-black items-center px-4">
          <label htmlFor="file-input" className="text-white text-xl cursor-pointer">
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

          {/* ⏰ Schedule Button */}
          <button
            type="button"
            onClick={() => setShowScheduleModal(true)}
            className="ml-2 text-white border px-2 py-1 rounded-lg text-sm"
          >
            ⏰ Send Later
          </button>
        </div>
      </form>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 space-y-4 w-[300px]">
            <h3 className="text-lg font-semibold">Schedule Message</h3>
            <input
              type="datetime-local"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-400 text-white px-3 py-1 rounded"
                onClick={() => setShowScheduleModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded"
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
