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

  // WhatsApp-style tick icons
  const getStatusIcon = () => {
    if (message.seen)
      return (
        <span title="Seen" className="inline-flex items-center">
          <svg width="18" height="18" viewBox="0 0 20 20" className="inline" style={{marginRight: '-2px'}}>
            <polyline points="4,11 8,15 16,7" fill="none" stroke="#4fc3f7" strokeWidth="2" />
            <polyline points="7,11 11,15 19,7" fill="none" stroke="#4fc3f7" strokeWidth="2" />
          </svg>
        </span>
      );
    if (message.delivered)
      return (
        <span title="Delivered" className="inline-flex items-center">
          <svg width="18" height="18" viewBox="0 0 20 20" className="inline" style={{marginRight: '-2px'}}>
            <polyline points="4,11 8,15 16,7" fill="none" stroke="#b0b0b0" strokeWidth="2" />
            <polyline points="7,11 11,15 19,7" fill="none" stroke="#b0b0b0" strokeWidth="2" />
          </svg>
        </span>
      );
    // Sent (single gray tick)
    return (
      <span title="Sent" className="inline-flex items-center">
        <svg width="18" height="18" viewBox="0 0 20 20" className="inline">
          <polyline points="4,11 8,15 16,7" fill="none" stroke="#b0b0b0" strokeWidth="2" />
        </svg>
      </span>
    );
  };

  return (
    <>
      <EmojiPickerOverlay />
      <div
        className={`group relative px-4 py-2 flex ${
          itsMe ? "justify-end" : "justify-start"
        }`}
      >
        <div className={`relative flex flex-col items-end ${itsMe ? "items-end" : "items-start"}`}>
          {/* Message Bubble */}
          <div
            className={`relative w-fit break-words whitespace-pre-wrap px-5 py-3 shadow-lg transition-all duration-200 ${
              itsMe
                ? "bg-gradient-to-tr from-blue-600/90 to-purple-600/90 text-white rounded-3xl rounded-br-md"
                : "bg-gradient-to-tr from-gray-800/90 to-gray-700/90 text-white rounded-3xl rounded-bl-md"
            } hover:scale-[1.02] hover:shadow-2xl backdrop-blur-lg border border-gray-700/40`}
            style={{ maxWidth: "103ch", minWidth: "56px" }}
          >
            {/* Emoji Picker Toggle Button (top-right, visible on hover) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPicker((prev) => !prev);
              }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-lg hover:scale-110 bg-white/80 text-gray-700 rounded-full p-1 shadow z-50"
              title="React"
              style={{ zIndex: 50 }}
            >
              😊
            </button>

            {/* Content */}
            <div className="text-sm pr-14">{renderContent()}</div>

            {/* Timestamp & Status (bottom right inside bubble) */}
            <div className="flex items-center gap-1 absolute bottom-2 right-4 text-[11px] text-gray-200 opacity-80 bg-transparent">
              <span>{formattedTime}</span>
              {itsMe && getStatusIcon()}
            </div>
          </div>

          {/* Reactions Summary (below bubble, outside) */}
          {message.reactions?.length > 0 && (
            <div
              className="mt-1 px-2 py-0.5 text-xs rounded-full bg-white/30 backdrop-blur-sm flex gap-2 items-center shadow"
              style={{ fontSize: "13px" }}
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

          {/* Emoji Picker Dropdown */}
          {showPicker && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/30"
                onClick={() => setShowPicker(false)}
              />
              <div
                className={`absolute ${
                  itsMe ? "right-[-10px]" : "left-[-10px]"
                } top-10 bg-white text-black p-2 rounded shadow-lg z-50 flex flex-row gap-1 w-max`}
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
    </>
  );
}

export default Message;
