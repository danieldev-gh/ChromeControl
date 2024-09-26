import React, { useState, useEffect } from "react";
import { GlobalContext } from "../App";
const StatsDisplaySmall = () => {
  const { clients } = React.useContext(GlobalContext);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <span className="text-white text-md mr-2">
        {currentTime.toLocaleTimeString()}
      </span>
      <span className="text-white text-sm mr-2">
        {currentTime.toLocaleDateString("en-GB")}
      </span>

      <span className="text-white text-xs">
        Connected Clients: {clients.length}
      </span>
    </div>
  );
};

export default StatsDisplaySmall;
