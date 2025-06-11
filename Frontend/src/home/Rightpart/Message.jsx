import React, { useState } from "react";
import { useSocketContext } from "../../context/SocketContext";

const reactionEmojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

function Message({ message }) {
  const authUser = JSON.parse(localStorage.getItem("ChatApp"));
  const itsMe = message.senderId === authUser.user._id;
  const { socket } = useSocketContext();
  const [showPicker, setShowPicker] = useState(false);

  const createdAt = new Date(message.createdAt);
  const formattedTime = createdAt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const myReaction = message.reactions?.find(
    (r) => r.userId === authUser.user._id
  )?.emoji;

  const handleReaction = (emoji) => {
    const isSame = myReaction === emoji;
    socket.emit("send-reaction", {
      messageId: message._id,
      userId: authUser.user._id,
      emoji: isSame ? null : emoji,
    });
    setShowPicker(false);
  };

  const renderContent = () => {
    const fileUrl = message?.file;
    const fileType = message?.type;
    const text = message?.message;

    return (
      <div className="space-y-1">
        {fileUrl && fileType && (
          <>
            {fileType.startsWith("image/") && (
              <img
                src={fileUrl}
                alt="sent media"
                className="rounded-md max-w-xs"
              />
            )}
            {fileType.startsWith("video/") && (
              <video src={fileUrl} controls className="rounded-md max-w-xs" />
            )}
            {fileType.startsWith("audio/") && (
              <audio src={fileUrl} controls className="w-full" />
            )}
            {!fileType.startsWith("image/") &&
              !fileType.startsWith("video/") &&
              !fileType.startsWith("audio/") && (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-200 break-words block"
                >
                  📄{" "}
                  {decodeURIComponent(fileUrl.split("/").pop().split("?")[0])}
                </a>
              )}
          </>
        )}
        {text && <p>{text}</p>}
      </div>
    );
  };

  // Overlay for freezing screen when emoji picker is open
  const EmojiPickerOverlay = () =>
    showPicker ? (
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={() => setShowPicker(false)}
      />
    ) : null;

  return (
    <>
      <EmojiPickerOverlay />
      <div
        className={`group relative px-4 py-2 flex ${
          itsMe ? "justify-end" : "justify-start"
        }`}
      >
        <div className={`relative flex items-end ${itsMe ? "flex-row-reverse" : ""}`}>
          {/* Message Bubble */}
          <div
            className={`relative w-fit break-words whitespace-pre-wrap px-4 py-2 shadow-md ${
              itsMe
                ? "bg-blue-600 text-white rounded-2xl rounded-br-sm"
                : "bg-gray-800 text-white rounded-2xl rounded-bl-sm"
            }`}
            style={{ maxWidth: "103ch" }}
          >
            {/* Content */}
            <div className="text-sm">{renderContent()}</div>

            {/* Reactions Summary */}
            {message.reactions?.length > 0 && (
              <div
                className={`absolute -bottom-6 px-2 py-0.5 text-xs rounded-full bg-white/20 backdrop-blur-sm flex gap-2 items-center ${
                  itsMe ? "left-2" : "right-2"
                }`}
              >
                {Object.entries(
                  message.reactions.reduce((acc, r) => {
                    if (r.emoji) acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([emoji, count]) => (
                  <span
                    key={emoji}
                    className="flex items-center gap-1 px-1"
                  >
                    {emoji} {count}
                  </span>
                ))}
              </div>
            )}

            {/* Reaction Picker Toggle Button (show only on hover) */}
            <div
              className={`absolute ${
                itsMe ? "left-[-48px]" : "right-[-48px]"
              } top-1 flex-col items-center z-50`}
              style={{ minWidth: "40px", display: "none" }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPicker((prev) => !prev);
                }}
                className="text-xl hover:scale-110 transition-transform bg-white rounded-full p-1 shadow"
                title="React"
                style={{ zIndex: 50 }}
              >
                😊
              </button>
            </div>
          </div>

          {/* Show emoji button only on hover */}
          <style>
            {`
              .group:hover .absolute[style*="min-width: 40px"] {
                display: flex !important;
              }
            `}
          </style>

          {/* Emoji Picker Dropdown (anchored to emoji button, blocks screen) */}
          {showPicker && (
            <>
              {/* Overlay to block the screen */}
              <div
                className="fixed inset-0 z-40 bg-black/30"
                onClick={() => setShowPicker(false)}
              />
              {/* Picker positioned next to emoji button */}
              <div
                className={`absolute ${
                  itsMe ? "left-[-180px]" : "right-[-180px]"
                } top-1 bg-white text-black p-2 rounded shadow-lg z-50 flex flex-row gap-1 w-max`}
                onClick={(e) => e.stopPropagation()}
              >
                {reactionEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className={`text-xl ${
                      myReaction === emoji
                        ? "opacity-100 scale-110"
                        : "opacity-60 hover:opacity-100"
                    } transition`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      {/* Timestamp below the bubble */}
      <div
        className={`text-[10px] text-gray-400 px-4 ${
          itsMe ? "text-right" : "text-left"
        }`}
        style={{ marginTop: "-8px", marginBottom: "8px" }}
      >
        {formattedTime}
      </div>
    </>
  );
}

export default Message;
