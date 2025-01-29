import React from 'react'
import Logout from './Logout'
import Settings from './Settings'
import Gemini from './Gemini'

const Naman = () => {
  return (
    <div className="w-[4%] bg-slate-950 text-white flex flex-col justify-end items-center">
      <Gemini />
      <Logout />
      <Settings />
    </div>
  )
}

export default Naman
