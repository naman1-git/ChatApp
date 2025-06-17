import React from 'react'
import Logout from './Logout'
import Settings from './Settings'
import Gemini from './Gemini'

const Naman = () => {
  return (
    <div className="w-[4%] bg-gradient-to-b from-blue-50 via-white to-purple-50 text-blue-700 flex flex-col justify-end items-center shadow-xl border-r border-gray-200">
      <Gemini />
      <Logout />
      <Settings />
    </div>
  )
}

export default Naman
