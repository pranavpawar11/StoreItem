import React from "react";
const Button = ({
    children,
    variant = "primary",
    className = "",
    ...props
  }) => {
    const baseStyles =
      "px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center gap-2";
    const variants = {
      primary: "bg-[#0077b6] hover:bg-[#0066a0] text-white",
      secondary: "bg-[#00b4d8] hover:bg-[#009dc0] text-white",
      outline: "border border-[#ced4da] hover:bg-[#f8f9fa] text-[#343a40]",
      danger: "bg-[#d00000] hover:bg-[#b00000] text-white",
    };
  
    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  };

export default Button;