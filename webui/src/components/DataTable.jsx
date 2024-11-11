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
      <div className="flex flex-row overflow-y-scroll">
        {headers.map((header, index) => (
          <div
            key={index}
            style={{ flex: weights[index] }}
            className={`text-center font-bold py-2 border-b border-r border-black min-w-0`}
          >
            {header}
          </div>
        ))}
      </div>
      <div className="flex flex-col flex-grow h-1 overflow-y-scroll">
        {/* Data rows */}
        {data &&
          data.map((row, rowIndex) => (
            <div
              key={rowIndex}
              onClick={() => {
                onItemClick(row);
              }}
              className="flex flex-row h-10 hover:bg-blue-300 transition-all cursor-pointer"
            >
              {Object.values(row).map((value, colIndex) => (
                <div
                  key={colIndex}
                  style={{ flex: weights[colIndex] }}
                  className={`text-center py-2 border-b border-r border-black min-w-0 overflow-hidden text-ellipsis relative`}
                >
                  {value}
                  {copyBtnColumns.includes(colIndex) && (
                    <div className="absolute right-0 top-0 p-1 flex flex-row">
                      <button
                        className="bg-blue-500 text-white text-sm px-2 py-1 rounded-md hover:brightness-110 transition-all hover:scale-105"
                        onClick={() => {
                          copyToClipboard(value);
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
