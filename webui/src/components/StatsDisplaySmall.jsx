import React, { useState, useEffect } from "react";
import { GlobalContext } from "../App";

const StatsDisplaySmall = () => {
  const { clients } = React.useContext(GlobalContext);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-blue-800/70 rounded-lg px-4 py-2 border border-blue-700/30">
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <span className="text-blue-100 font-medium font-mono">
            {currentTime.toLocaleTimeString()}
          </span>
          <span className="text-blue-200/80 text-sm">
            {currentTime.toLocaleDateString("en-GB")}
          </span>
        </div>

        <div className="border-l border-blue-500/30 pl-4">
          <div className="flex flex-col items-center">
            <span className="text-blue-100 font-medium">
              {clients.filter((clients) => clients.online).length}
            </span>
            <span className="text-blue-200/80 text-sm">Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDisplaySmall;
