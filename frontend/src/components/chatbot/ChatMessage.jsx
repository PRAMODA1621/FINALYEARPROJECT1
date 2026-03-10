import React from 'react';
import { FaRobot, FaUser } from 'react-icons/fa';

const ChatMessage = ({ message, isBot }) => {
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-[#8B5A2B] flex items-center justify-center mr-2 flex-shrink-0">
          <FaRobot className="text-white text-sm" />
        </div>
      )}
      
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isBot
            ? 'bg-[#F5F0E8] text-[#8B5A2B] rounded-tl-none'
            : 'bg-[#9CAF88] text-white rounded-tr-none'
        }`}
      >
        <p className="text-sm whitespace-pre-line">{message}</p>
        <p className="text-xs mt-1 opacity-70">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-[#9CAF88] flex items-center justify-center ml-2 flex-shrink-0">
          <FaUser className="text-white text-sm" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;