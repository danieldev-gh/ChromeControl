import React from "react";

const CookieModal = ({ show, setShow, cookie }) => {
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
  }
  return (
    <div
      className={`${
        show ? "fixed" : "hidden"
      } top-0 left-0 w-screen h-screen flex items-center justify-center backdrop-blur-sm z-10`}
    >
      <div className="w-1/3 rounded-md bg-blue-700 text-center z-20 p-10">
        {cookie && (
          <div>
            <h2 className="text-white text-lg font-bold mb-4">
              Cookie Information
            </h2>
            <label className="text-white">Cookie Name:</label>
            <input
              type="text"
              value={cookie.name}
              className="rounded-md focus:outline-none border-2 border-blue-500 mx-2"
            />
            <button
              className="bg-white text-black text-sm px-2 py-1 rounded-md mt-2 hover:brightness-110 transition-all"
              onClick={() => {
                copyToClipboard(cookie.name);
              }}
            >
              Copy Name
            </button>
            <br />
            <label className="text-white">Value: </label>
            <input
              value={cookie.value}
              type="text"
              className="rounded-md focus:outline-none border-2 border-blue-500 mx-2"
            />
            <button
              className="bg-white text-black text-sm px-2 py-1 rounded-md mt-2 hover:brightness-110 transition-all"
              onClick={() => {
                copyToClipboard(cookie.value);
              }}
            >
              Copy Value
            </button>
            <p className="text-white">Domain: {cookie.domain}</p>
            <p className="text-white">Path: {cookie.path}</p>
            <p className="text-white">Expiration Date: {cookie.expiration}</p>
            <p className="text-white">
              HTTP Only: {cookie.http_only ? "true" : "false"}
            </p>
            <p className="text-white">
              Secure: {cookie.secure ? "true" : "false"}
            </p>
            <p className="text-white">
              Host Only: {cookie.host_only ? "true" : "false"}
            </p>
            <p className="text-white">
              Session: {cookie.session ? "true" : "false"}
            </p>
          </div>
        )}
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

export default CookieModal;
