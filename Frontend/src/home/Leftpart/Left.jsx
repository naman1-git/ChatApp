import React from "react";
import Search from "./Search";
import Users from "./Users";
 

function Left() {
  return (
    <div className="w-[25%] bg-gradient-to-b from-gray-100/90 to-gray-200/80 text-gray-800 backdrop-blur-lg border-r border-gray-300/40 shadow-xl">
      <h1 className="font-bold text-3xl p-2 px-11 text-gray-700">Connect</h1>
      <Search />
      <div
        className="flex-1 overflow-y-auto"
        style={{ minHeight: "calc(84vh - 10vh)" }}
      >
        <Users />
      </div>
    </div>
  );
}

export default Left;
