import React, { useState } from "react";
import { GrSettingsOption } from "react-icons/gr";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthProvider";
import { FiPlus } from "react-icons/fi";
import moment from "moment";

function Settings() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showScheduled, setShowScheduled] = useState(false);
  const [scheduledMessages, setScheduledMessages] = useState([]);
  const [newPic, setNewPic] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [authUser, setAuthUser] = useAuth();

  const handleOpenSettings = () => {
    setSettingsOpen(true);
    setShowScheduled(false); // reset state
  };

  const fetchScheduledMessages = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/message/scheduled`, {
        withCredentials: true,
      });
      setScheduledMessages(res.data);
      setShowScheduled(true);
    } catch (error) {
      console.error("Failed to fetch scheduled messages", error);
      toast.error("Could not load scheduled messages");
    }
  };

  const handleCancelScheduledMessage = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/message/cancel/${id}`, {
        withCredentials: true,
      });
      toast.success("Scheduled message canceled");
      setScheduledMessages((prev) => prev.filter((msg) => msg._id !== id));
    } catch (error) {
      console.error("Cancel failed", error);
      toast.error("Failed to cancel message");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewPic(file);
    setIsUploading(true);

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "chat app");
    data.append("cloud_name", "ddm7nxdwd");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/ddm7nxdwd/image/upload", {
        method: "POST",
        body: data,
      });

      const uploadedImage = await res.json();
      if (uploadedImage.url) {
        const updatedUser = { ...authUser.user, profile_pic: uploadedImage.url };
        setAuthUser({ ...authUser, user: updatedUser });

        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/user/update-profile_pic`, {
          profile_pic: uploadedImage.url,
        });

        toast.success("Profile picture updated");
      } else {
        toast.error("Failed to retrieve uploaded image URL");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error uploading image");
    }

    setIsUploading(false);
  };

  return (
    <div>
      <div className="p-3">
        <button onClick={handleOpenSettings}>
          <GrSettingsOption className="text-5xl p-2 hover:bg-gray-600 rounded-lg duration-300" />
        </button>
      </div>

      {settingsOpen && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex justify-center items-center z-50"
        >
          <div className="bg-white rounded-xl p-6 w-[600px] shadow-2xl relative text-center max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Account Settings</h2>

            {/* Profile Section */}
            <div className="relative w-32 h-32 mx-auto mb-4">
              <img
                src={authUser?.user?.profile_pic}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-4 border-blue-500"
              />
              <label
                htmlFor="fileInput"
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-all"
                title="Change profile picture"
              >
                <FiPlus className="text-xl" />
              </label>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {isUploading && <p className="text-sm text-gray-500 mb-2">Uploading...</p>}

            <div className="mb-4 text-gray-800">
              <p className="font-medium text-lg">{authUser?.user?.fullname}</p>
              <p className="text-sm">{authUser?.user?.email}</p>
            </div>

            {/* Button to View Scheduled */}
            {!showScheduled && (
              <button
                onClick={fetchScheduledMessages}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-4"
              >
                View Scheduled Messages
              </button>
            )}

            {/* Scheduled Messages */}
            {showScheduled && (
              <div className="text-left w-full">
                <h3 className="font-semibold text-lg mb-2">Scheduled Messages</h3>
                {scheduledMessages.length === 0 ? (
                  <p className="text-sm text-gray-500">No scheduled messages</p>
                ) : (
                  <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {scheduledMessages.map((msg) => (
                      <li
                        key={msg._id}
                        className="bg-gray-100 p-3 rounded-lg flex justify-between items-start"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800 break-words">{msg.message}</p>
                          <p className="text-xs text-gray-600">
                            {moment(msg.sendAt).format("MMM D, YYYY • hh:mm A")}
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            To: {msg.receiverId?.email || "Unknown"}
                          </p>
                        </div>
                        <button
                          className="ml-2 text-red-500 text-sm hover:underline"
                          onClick={() => handleCancelScheduledMessage(msg._id)}
                        >
                          Cancel
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <button
              onClick={() => setSettingsOpen(false)}
              className="mt-6 bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-all"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Settings;
