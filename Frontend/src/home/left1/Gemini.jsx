import React, { useState } from "react";
import { SiGooglegemini } from "react-icons/si";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import { motion } from "framer-motion";

function Gemini() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleButtonClick = () => {
    setIsFormOpen(!isFormOpen);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setResponse("");
    setQuery("");
  };

  const handleAskAnother = () => {
    setResponse("");
    setQuery("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");
  
    try {
      const res = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDw1j5_9faqWNdS7Ui-54nrRVejJPu8u6M",
        {
          contents: [{
            parts: [{
              text: query
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (res.data.candidates && res.data.candidates[0]?.content?.parts[0]?.text) {
        setResponse(res.data.candidates[0].content.parts[0].text);
      } else {
        setResponse("No response from Gemini API.");
      }
    } catch (error) {
      console.error('API Error:', error);
      setResponse(
        error.response?.data?.error?.message || 
        "Error fetching data from Gemini API."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 flex flex-col items-center">
      <button onClick={handleButtonClick} className="mb-4">
        <SiGooglegemini className="text-5xl text-white hover:bg-gray-600 rounded-lg p-2 duration-300" />
      </button>

      {isFormOpen && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
        >
          <div className="bg-gray-800 rounded-xl w-full max-w-3xl relative shadow-2xl border border-gray-700 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <button 
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <IoMdClose size={24} />
              </button>
              
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <SiGooglegemini className="text-3xl" />
                Ask Gemini
              </h2>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <form onSubmit={handleFormSubmit} className="flex flex-col space-y-4">
                <textarea
                  className="bg-gray-700 p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 resize-none transition-all min-h-[120px] max-h-[300px]"
                  placeholder="Enter your query..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={loading || !query.trim()}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : "Send Query"}
                </button>
              </form>
              
              {response && (
                <div className="space-y-4">
                  <div className="bg-gray-700 p-5 rounded-lg shadow-inner">
                    <div className="prose prose-invert max-w-none">
                      <p className="text-white whitespace-pre-wrap">{response}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={handleAskAnother}
                      className="px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                    >
                      Ask Another Question
                    </button>
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Gemini;