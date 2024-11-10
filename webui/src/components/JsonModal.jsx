import React from "react";
import JsonView from "@uiw/react-json-view";
import { darkTheme } from "@uiw/react-json-view/dark";

const JsonModal = ({ show, setShow, item }) => {
  return (
    <div
      className={`${
        show ? "fixed" : "hidden"
      } top-0 left-0 w-screen h-screen flex items-center justify-center backdrop-blur-sm z-20`}
    >
      <div className="w-1/3 h-1/3 rounded-md bg-blue-700 z-10 flex flex-col">
        <JsonView
          value={item ? JSON.parse(item.data) : {}}
          style={darkTheme}
          className="m-2 rounded-md flex-grow"
        />
        <div className="w-full text-center">
          <button
            className="bg-white text-black text-sm px-2 py-1 rounded-md hover:brightness-110 transition-all mx-auto mb-2"
            onClick={() => {
              setShow(false);
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default JsonModal;
