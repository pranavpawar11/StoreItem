import React from "react";
import { AlertTriangle } from "lucide-react";

const CustomAlert = ({ type, message, onClose }) => {
  const bgColor =
    type === "error"
      ? "bg-[#d00000]"
      : type === "success"
      ? "bg-[#2d6a4f]"
      : "bg-[#ffcc00]";

  return (
    <div
      className={`${bgColor} text-white px-4 py-3 rounded-md flex items-center justify-between mb-4`}
    >
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2" />
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="text-white hover:opacity-75">
        ×
      </button>
    </div>
  );
};


export default CustomAlert;