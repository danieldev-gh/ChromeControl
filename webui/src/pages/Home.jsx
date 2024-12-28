import React, { useEffect } from "react";
import { GlobalContext } from "../App";
import MonitoringPanel from "../components/MonitoringPanel";
import StatisticsPanel from "../components/StatisticsPanel";
import { QuickActionsPanel } from "../components/QuickActionsPanel";
const Home = () => {
  const { selectedClientId } = React.useContext(GlobalContext);
  const [message, setMessage] = React.useState("");
  const [data, setData] = React.useState(null);
  const [passedTime, setPassedTime] = React.useState(null);
  useEffect(() => {
    fetch(`/statistics`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
      })
      .catch((err) => console.error(err));
  }, []);
  useEffect(() => {
    if (!data?.wakeUpTime) return;
    setPassedTime(Date.now() - data.wakeUpTime);
    const interval = setInterval(() => {
      setPassedTime(Date.now() - data.wakeUpTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [data]);
  return (
    <div className="flex flex-col-reverse lg:flex-row flex-grow min-h-0 p-4 gap-4">
      <div className="flex flex-row lg:flex-col gap-4 flex-1">
        <StatisticsPanel
          passedTime={passedTime}
          data={data}
          className="flex-1"
        />
        <QuickActionsPanel className="flex-1" />
      </div>
      <MonitoringPanel className="flex-1 min-h-0" />
    </div>
  );
};

export default Home;
