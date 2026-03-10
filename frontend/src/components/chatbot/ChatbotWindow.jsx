import React from 'react';
import { FaTimes } from 'react-icons/fa';

const ChatbotWindow = ({ onClose }) => {
  console.log('✅ ChatbotWindow rendered');

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        border: '1px solid #E8E0D5',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#8B5A2B',
          color: 'white',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span style={{ fontWeight: 'bold' }}>Venus Assistant</span>
        <button
          onClick={() => {
            console.log('❌ Close button clicked');
            onClose();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          <FaTimes />
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          color: '#8B5A2B'
        }}
      >
        <p>Chatbot is working!</p>
        <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
          Click the X to close
        </p>
      </div>
    </div>
  );
};

export default ChatbotWindow;