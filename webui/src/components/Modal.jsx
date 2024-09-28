import React from "react";

const Modal = ({
  show,
  setShow,
  title = "Modal",
  text = "This is a modal",
}) => {
  return (
    <div
      className={`${
        show ? "fixed" : "hidden"
      } top-0 left-0 w-screen h-screen flex items-center justify-center backdrop-blur-sm z-10`}
    >
      <div className="w-1/3 h-1/3 rounded-md bg-blue-700 text-center z-20">
        <h1 className="text-white text-md pt-4">{title}</h1>
        <p className="text-white text-sm">{text}</p>
        <button
          className="bg-white text-black text-sm px-2 py-1 rounded-md mt-2 hover:brightness-110 transition-all"
          onClick={() => {
            setShow(false);
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
