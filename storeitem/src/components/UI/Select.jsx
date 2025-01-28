import React from "react";

const Select = ({ options, value, onChange, placeholder }) => (
    <select
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 rounded-md border border-[#ced4da] focus:outline-none focus:border-[#0077b6] bg-white dark:text-gray-50 dark:bg-gray-800"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
  
export default Select;