import React from "react";
import {
  Clock,
  Key,
  Cookie,
  Keyboard,
  BarChart3,
  Database,
} from "lucide-react";

const StatisticItem = ({ icon: Icon, label, value, className = "" }) => (
  <div className={`flex items-center p-3 rounded-lg bg-gray-100 ${className}`}>
    <Icon className="h-5 w-5 text-blue-600 mr-3" />
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

const StatisticsPanel = ({ passedTime, data, className = "" }) => {
  const formattedTime = passedTime
    ? new Date(passedTime).toISOString().slice(11, 19)
    : "00:00:00";

  return (
    <div
      className={`bg-white rounded-lg shadow-lg outline outline-gray-300 outline-1 p-6 ${className}`}
    >
      <div className="flex items-center mb-6">
        <BarChart3 className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-800">Statistics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatisticItem
          icon={Clock}
          label="Server Uptime"
          value={formattedTime}
        />
        <StatisticItem
          icon={Key}
          label="Credentials Collected"
          value={data?.credentials || 0}
        />
        <StatisticItem
          icon={Cookie}
          label="Cookies Collected"
          value={data?.cookies || 0}
        />
        <StatisticItem
          icon={Keyboard}
          label="Keylogs Collected"
          value={data?.keylogs || 0}
        />
        <StatisticItem
          icon={Database}
          label={"Local Storage Pairs Collected"}
          value={data?.localstorage || 0}
        />
      </div>
    </div>
  );
};

export default StatisticsPanel;
