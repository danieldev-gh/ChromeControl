import React from "react";

const DataTable = ({
  headers,
  weights,
  data = [],
  onItemClick = () => {},
  copyBtnColumns = [],
}) => {
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
  }
  return (
    <div className="flex flex-grow flex-col">
      {/* Header row */}
      <div className="flex flex-row overflow-y-scroll border-t border-l border-gray-200">
        {headers.map((header, index) => (
          <div
            key={index}
            style={{ flex: weights[index] }}
            className={`py-3  text-sm font-semibold text-gray-700 border-b border-r border-gray-200 bg-gray-50`}
          >
            <div className="ml-4">{header}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-col flex-grow h-1 overflow-y-scroll border-l border-gray-200">
        {/* Data rows */}
        {data &&
          data.map((row, rowIndex) => (
            <div
              key={rowIndex}
              onClick={() => {
                onItemClick(row);
              }}
              className="flex h-10 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              {Object.values(row).map((value, colIndex) => (
                <div
                  key={colIndex}
                  style={{ flex: weights[colIndex] }}
                  className={`relative flex items-center py-2 text-sm text-gray-600 border-b border-r border-gray-200 min-w-0`}
                >
                  <span className="ml-4 truncate">{value}</span>

                  {copyBtnColumns.includes(colIndex) && (
                    <div className="absolute right-0 top-0 p-1 flex flex-row">
                      <button
                        className="ml-auto p-1 text-xs text-blue-600 bg-white hover:text-blue-800 hover:bg-blue-100 rounded transition-colors "
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(String(value));
                        }}
                      >
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default DataTable;
