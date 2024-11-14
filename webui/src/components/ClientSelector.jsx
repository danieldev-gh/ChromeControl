import React from "react";
import { GlobalContext } from "../App";
const ClientSelector = ({ className = "" }) => {
  const { selectedClientId, setSelectedClientId, clients } =
    React.useContext(GlobalContext);

  return (
    <select
      className={` ${className} bg-gray-200 text-gray-700 p-1 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
      value={selectedClientId || ""}
      onChange={(e) => setSelectedClientId(e.target.value)}
    >
      {clients.map((client) => (
        <option
          key={client.client_id}
          className="text-sm"
          value={client.client_id}
        >
          {client.os + " - " + client.client_id}
        </option>
      ))}
    </select>
  );
};

export default ClientSelector;
