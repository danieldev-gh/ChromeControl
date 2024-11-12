import React from "react";
import Cookies from "../components/Cookies";
import Credentials from "../components/Credentials";
import Keylogs from "../components/Keylogs";
const Monitor = () => {
  const titles = ["Credentials", "Cookies", "Keylogs"];
  const [currentPage, setCurrentPage] = React.useState(0);
  // set the current page from local storage
  React.useEffect(() => {
    setCurrentPage(parseInt(localStorage.getItem("currentPage") || "0"));
  }, []);

  function renderPage() {
    switch (currentPage) {
      case 0:
        return <Credentials />;
      case 1:
        return <Cookies />;
      case 2:
        return <Keylogs />;
      default:
        return <Credentials />;
    }
  }
  return (
    <div className="flex flex-grow flex-col">
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
      {renderPage()}
    </div>
  );
};

export default Monitor;
