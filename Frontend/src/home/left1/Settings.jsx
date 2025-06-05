import React, { useState } from "react";
import { GrSettingsOption } from "react-icons/gr";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthProvider";
import { FiPlus } from "react-icons/fi";

function Settings() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newPic, setNewPic] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [authUser, setAuthUser] = useAuth();

  const handleSettings = () => {
    setSettingsOpen(true);
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

        // Save to backend
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/user/update-profile_pic`, { profile_pic: uploadedImage.url });

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
      {/* Settings Icon */}
      <div className="p-3">
        <button onClick={handleSettings}>
          <GrSettingsOption className="text-5xl p-2 hover:bg-gray-600 rounded-lg duration-300" />
        </button>
      </div>

      {/* Modal */}
      {settingsOpen && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex justify-center items-center z-50"
        >
          <div className="bg-white rounded-xl p-8 w-[400px] shadow-2xl relative text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Account Settings</h2>

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

            <div className="mb-2 text-gray-800">
              <p className="font-medium text-lg">{authUser?.user?.fullname}</p>
              <p className="text-sm">{authUser?.user?.email}</p>
            </div>

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
