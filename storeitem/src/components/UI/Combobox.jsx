import React ,{useState} from "react";

const Combobox = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-[#ced4da] rounded-md focus:outline-none focus:border-[#0077b6]"
      />
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-[#ced4da] rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((option, index) => (
            <div
              key={index}
              className="px-4 py-2 cursor-pointer hover:bg-[#f8f9fa]"
              onClick={() => {
                onChange(option);
                setSearchTerm(option);
                setIsOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Combobox;