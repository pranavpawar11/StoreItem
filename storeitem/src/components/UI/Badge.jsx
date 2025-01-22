import React from "react";

const Badge = ({ variant, children }) => {
  const variants = {
    success: "bg-[#80ed99] text-[#2d6a4f]",
    warning: "bg-[#ffca3a] text-[#ffcc00]",
    danger: "bg-[#ff595e] text-[#d00000]",
    secondary: "bg-[#f8f9fa] text-[#6c757d]",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-sm font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
};

export default Badge;