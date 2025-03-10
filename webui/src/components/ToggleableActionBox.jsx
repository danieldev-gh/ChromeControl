import React, { useState } from "react";
import { MessageCircleX } from "lucide-react";

const ToggleableActionBox = ({
  // Content props
  title,
  description,
  inputPlaceholder = "Enter text",
  submitText = "Submit",
  disabledText = "Disabled",
  icon: Icon = MessageCircleX,

  // Number input props
  numberMin = 1,
  numberMax = 100,
  numberDefault = 1,
  numberPlaceholder = "Qty",

  // Function props
  onSubmit,

  // State props
  disabled = false,

  // Optional styling
  className = "",
  inputClassName = "",
  buttonClassName = "",
  numberClassName = "",
}) => {
  const [inputValue, setInputValue] = useState("");
  const [numberValue, setNumberValue] = useState(numberDefault);

  const handleSubmit = async () => {
    try {
      await onSubmit(inputValue, numberValue);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div
      className={`flex items-center p-4 rounded-lg ${
        disabled ? "bg-gray-200" : "bg-gray-100"
      } ${className}`}
    >
      <div
        className={`rounded-full p-3 shadow-sm ${
          disabled ? "bg-gray-300" : "bg-white"
        }`}
      >
        <Icon
          className={`h-8 w-8 ${disabled ? "text-gray-500" : "text-blue-600"}`}
        />
      </div>
      <div className="flex flex-col ml-4 flex-grow">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mb-2">{description}</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={inputPlaceholder}
            className={`flex-grow px-3 py-2 border-2 ${
              disabled
                ? "border-gray-400 bg-gray-100 text-gray-500"
                : "border-blue-500"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${inputClassName}`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={disabled}
          />
          <input
            type="number"
            min={numberMin}
            max={numberMax}
            placeholder={numberPlaceholder}
            className={`w-20 px-3 py-2 border-2 ${
              disabled
                ? "border-gray-400 bg-gray-100 text-gray-500"
                : "border-blue-500"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${numberClassName}`}
            value={numberValue}
            onChange={(e) =>
              setNumberValue(parseInt(e.target.value) || numberDefault)
            }
            disabled={disabled}
          />
          <button
            className={`${
              disabled
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white px-4 py-2 rounded-md text-sm font-medium transition-colors ${buttonClassName}`}
            onClick={handleSubmit}
          >
            {disabled ? disabledText : submitText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToggleableActionBox;
