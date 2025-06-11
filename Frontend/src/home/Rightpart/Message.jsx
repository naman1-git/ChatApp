import React from "react";

function Message({ message }) {
  const authUser = JSON.parse(localStorage.getItem("ChatApp"));
  const itsMe = message.senderId === authUser.user._id;

  const chatAlign = itsMe ? "chat-end" : "chat-start";
  const chatColor = itsMe ? "bg-blue-500" : "bg-gray-700";

  const createdAt = new Date(message.createdAt);
  const formattedTime = createdAt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

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
              <video
                src={fileUrl}
                controls
                className="rounded-md max-w-xs"
              />
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
                  📄 {decodeURIComponent(fileUrl.split("/").pop().split("?")[0])}
                </a>
              )}
          </>
        )}

        {text && <p>{text}</p>}
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className={`chat ${chatAlign}`}>
        <div className={`chat-bubble text-white ${chatColor} max-w-xs`}>
          {renderContent()}
        </div>
        <div className="chat-footer text-xs mt-1">{formattedTime}</div>
      </div>
    </div>
  );
}

export default Message;
