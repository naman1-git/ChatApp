import React, { useState } from "react";
import { GrSettingsOption } from "react-icons/gr";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

function Settings(user) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newPic, setNewPic] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [profilePic, setProfilePic] = useState("");

  const handleSettings = async () => {
    setSettingsOpen(true);
    try {
      setProfilePic(user.profile_pic);
    } catch (error) {
      console.error("Error fetching profile picture:", error);
    }
  };

  const handleFileChange = (e) => {
    setNewPic(e.target.files[0]);
  };

  const handleUpdatePic = async () => {
    setIsUploading(true);

    if (!newPic) {
      toast.error("No file selected");
      setIsUploading(false);
      return;
    }

    const data = new FormData();
    data.append("file", newPic);
    data.append("upload_preset", "chat app");
    data.append("cloud_name", "ddm7nxdwd");

    try {
      console.log("Uploading file to Cloudinary...");
      const res = await fetch("https://api.cloudinary.com/v1_1/ddm7nxdwd/image/upload", {
        method: "POST",
        body: data,
      });
      

      const uploadedImage = await res.json();
      console.log("Cloudinary Response: ", uploadedImage);

      if (uploadedImage.url) {
        setProfilePic(uploadedImage.url);
        toast.success("Profile picture uploaded successfully");
        console.log("Profile Pic URL Set: ", uploadedImage.url);

        // Save the new profile picture URL to the database
        await axios.put("https://chatapp-1-7iuz.onrender.com/api/user/update-profile_pic", { profile_pic: uploadedImage.url });
      } else {
        toast.error("Failed to retrieve uploaded image URL");
      }
    } catch (error) {
      console.error("Error uploading file: ", error);
      toast.error("Failed to upload profile picture");
    }

    setIsUploading(false);
  };

  return (
    <div>
      {/* Settings Button */}
      <div className="p-3">
        <button onClick={handleSettings}>
          <GrSettingsOption className="text-5xl p-2 hover:bg-gray-600 rounded-lg duration-300" />
        </button>
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex justify-center items-center z-50"
        >
          <div className="bg-white rounded-lg p-6 w-[500px] shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Update Profile Picture</h2>
            {profilePic && (
              <img
                src={profilePic}
                alt="Profile"
                className="w-48 h-48 rounded-full mx-auto mb-4"
              />
            )}
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="block w-full mb-4"
            />
            <button
              onClick={handleUpdatePic}
              className="bg-blue-500 text-white py-3 px-6 rounded hover:bg-blue-600 duration-300"
            >
              {isUploading ? "Uploading..." : "Update Picture"}
            </button>
            <button
              onClick={() => setSettingsOpen(false)}
              className="bg-gray-500 text-white py-3 px-6 rounded hover:bg-gray-600 duration-300 mt-4"
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
