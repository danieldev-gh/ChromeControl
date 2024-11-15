import React from "react";
import JsonView from "@uiw/react-json-view";
import { lightTheme } from "@uiw/react-json-view/light";

const JsonModal = ({ show, setShow, item }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh]">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">JSON View</h2>
        </div>

        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          <JsonView
            value={item ? JSON.parse(item.data) : {}}
            style={{
              ...lightTheme,
              container: {
                ...lightTheme.container,
                backgroundColor: "transparent",
                borderRadius: "0.375rem",
                padding: "0.5rem",
              },
            }}
            displayDataTypes={false}
            displayObjectSize={false}
          />
        </div>

        <div className="p-4 border-t bg-white rounded-b-lg flex justify-end">
          <button
            onClick={() => setShow(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default JsonModal;
