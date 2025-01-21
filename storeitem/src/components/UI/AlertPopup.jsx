import React, { useEffect } from "react";

const AlertPopup = ({ message, status, onClose }) => {
  const alertStyles = status === "success" ? "bg-green-500" : "bg-red-500";

  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // Auto-dismiss after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-5 px-4 py-2 rounded shadow-lg text-white ${alertStyles}`}
      style={{ zIndex: 9999 }}
    >
      {message}
    </div>
  );
};

export default AlertPopup;
