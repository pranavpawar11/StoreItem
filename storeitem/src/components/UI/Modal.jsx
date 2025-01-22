import React from "react";

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#343a40]">{title}</h2>
            <button
              onClick={onClose}
              className="text-[#6c757d] hover:text-[#343a40]"
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  
export default Modal;
