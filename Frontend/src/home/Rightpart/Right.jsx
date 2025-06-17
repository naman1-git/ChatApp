import React, { useEffect } from "react";
import Chatuser from "./Chatuser";
import Messages from "./Messages";
import Typesend from "./Typesend";
import useConversation from "../../statemanage/useConversation.js";
import { useAuth } from "../../context/AuthProvider.jsx";
import { CiMenuFries } from "react-icons/ci";

function Right() {
  const { selectedConversation, setSelectedConversation } = useConversation();
  useEffect(() => {
    return setSelectedConversation(null);
  }, [setSelectedConversation]);
  return (
    <div className="flex-1 bg-slate-100 text-gray-800 flex flex-col">
      <div className="flex-1 flex flex-col">
        {!selectedConversation ? (
          <NoChatSelected />
        ) : (
          <>
            <Chatuser />
            <div
              className="flex-1 overflow-y-auto"
              style={{ maxHeight: "calc(88vh - 8vh)" }}
            >
              <Messages />
            </div>
            <Typesend />
          </>
        )}
      </div>
    </div>
  );
}

export default Right;

const NoChatSelected = () => {
  const [authUser] = useAuth();
  return (
    <div className="flex flex-1 items-center justify-center">
      <h1 className="text-center">
        Welcome{" "}
        <span className="font-semibold text-xl">
          {authUser.user.fullname}
        </span>
        <br />
        No chat selected, please start conversation by selecting anyone to
        your contacts
      </h1>
    </div>
  );
};
