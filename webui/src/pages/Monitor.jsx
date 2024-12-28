import React from "react";
import Cookies from "../components/Cookies";
import Credentials from "../components/Credentials";
import Keylogs from "../components/Keylogs";
import { io } from "socket.io-client";
import LocalStorage from "../components/LocalStorage";

const Monitor = () => {
  const titles = ["Cookies", "Local Storage", "Credentials", "Keylogs"];
  const [currentPage, setCurrentPage] = React.useState(0);
  // set the current page from local storage
  React.useEffect(() => {
    setCurrentPage(parseInt(localStorage.getItem("currentPage") || "0"));
  }, []);

  function renderPage() {
    switch (currentPage) {
      case 0:
        return <Cookies />;
      case 1:
        return <LocalStorage />;
      case 2:
        return <Credentials />;
      default:
        return <Keylogs />;
    }
  }
  return (
    <div className="flex flex-grow flex-col">
      <div className="flex border-b border-blue-600">
        {titles.map((title, index) => (
          <div
            key={index}
            className={`
        flex-1 py-3 px-4 text-center font-medium text-sm
        transition-colors cursor-pointer
        ${
          currentPage === index
            ? "bg-blue-600 text-white"
            : "bg-blue-500 text-blue-50 hover:bg-blue-550"
        }
        ${index !== titles.length - 1 ? "border-r border-blue-400" : ""}
      `}
            onClick={() => {
              setCurrentPage(index);
              localStorage.setItem("currentPage", index);
            }}
          >
            {title}
          </div>
        ))}
      </div>
      {renderPage()}
    </div>
  );
};

export default Monitor;
