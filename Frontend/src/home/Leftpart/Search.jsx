import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import useGetAllUsers from "../../context/useGetAllUsers";
import useConversation from "../../statemanage/useConversation";
import toast from "react-hot-toast";
function Search() {
  const [search, setSearch] = useState("");
  const [allUsers] = useGetAllUsers();
  const { setSelectedConversation } = useConversation();
  console.log(allUsers);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!search) return;
    const conversation = allUsers.find((user) =>
      user.fullname?.toLowerCase().includes(search.toLowerCase())
    );
    if (conversation) {
      setSelectedConversation(conversation);
      setSearch("");
    } else {
      toast.error("User not found");
    }
  };
  return (
    <div className=" h-[10vh]">
      <div className="px-6 py-4">
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-3">
            <label className="border-[1px] border-gray-300 bg-gray-100/80 rounded-xl p-3 flex items-center gap-2 w-[80%] shadow">
              <input
                type="text"
                className="grow outline-none bg-transparent text-gray-800 placeholder-gray-400"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <button className="bg-gradient-to-tr from-blue-400 to-purple-300 text-white text-2xl rounded-full p-2 shadow hover:scale-110 transition">
              <FaSearch />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Search;
