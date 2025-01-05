import React, { useState } from "react";
import { MessageCircleX } from "lucide-react";

const ActionBox = ({
  // Content props
  title,
  description,
  inputPlaceholder = "Enter text",
  submitText = "Submit",
  icon: Icon = MessageCircleX,

  // Function props
  onSubmit,

  // Optional styling
  className = "",
  inputClassName = "",
  buttonClassName = "",
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = async () => {
    try {
      await onSubmit(inputValue);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div
      className={`flex items-center p-4 rounded-lg bg-gray-100 ${className}`}
    >
      <div className="bg-white rounded-full p-3 shadow-sm">
        <Icon className="h-8 w-8 text-blue-600" />
      </div>
      <div className="flex flex-col ml-4 flex-grow">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mb-2">{description}</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={inputPlaceholder}
            className={`flex-grow px-3 py-2 border-2 border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputClassName}`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button
            className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors ${buttonClassName}`}
            onClick={handleSubmit}
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionBox;
