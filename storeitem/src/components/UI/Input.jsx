import React from "react";

const Input = ({ icon, ...props }) => (
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6c757d]">
          {icon}
        </span>
      )}
      <input
        className={`w-full px-4 py-2 rounded-md border border-[#ced4da] focus:outline-none focus:border-[#0077b6] ${
          icon ? "pl-10" : ""
        }`}
        {...props}
      />
    </div>
  );

  export default Input;