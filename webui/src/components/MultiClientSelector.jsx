import React, { useState } from "react";
import { Monitor, User } from "lucide-react";
import { GlobalContext } from "../App";

const MultiClientSelector = ({
  className = "",
  selectedClients,
  setSelectedClients,
  disableMultiSelect = false,
}) => {
  const { clients, selectedClientId, setSelectedClientId } =
    React.useContext(GlobalContext);
  const [multiSelectEnabled, setMultiSelectEnabled] = useState(false);

  const onlineClients = clients.filter((client) => client.online);

  // Clean up selectedClients when clients go offline
  // Handle clients going offline
  React.useEffect(() => {
    if (multiSelectEnabled) {
      const onlineClientIds = new Set(
        onlineClients.map((client) => client.client_id)
      );
      setSelectedClients((prev) => {
        const newSet = new Set(
          [...prev].filter((id) => onlineClientIds.has(id))
        );
        return newSet;
      });
    }
  }, [clients, multiSelectEnabled, setSelectedClients]);

  // Handle disableMultiSelect changes
  React.useEffect(() => {
    if (disableMultiSelect) {
      setMultiSelectEnabled(false);
      setSelectedClients(new Set());
    }
  }, [disableMultiSelect, setSelectedClients]);

  const handleClientClick = (clientId) => {
    if (!multiSelectEnabled) {
      setSelectedClientId(clientId);
    } else {
      setSelectedClients((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(clientId)) {
          newSet.delete(clientId);
        } else {
          newSet.add(clientId);
        }
        return newSet;
      });
    }
  };

  const handleSelectAll = () => {
    const allClientIds = onlineClients.map((client) => client.client_id);
    setSelectedClients(new Set(allClientIds));
  };

  const handleDeselectAll = () => {
    setSelectedClients(new Set());
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-lg outline outline-gray-300 outline-1 p-6 ${className} h-full flex flex-col`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Monitor className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-800">Online Clients</h2>
        </div>
        <div className="text-sm text-gray-500">
          {onlineClients.length} active
        </div>
      </div>

      <div className="space-y-4 overflow-y-auto flex-1">
        {onlineClients.map((client) => (
          <div
            key={client.client_id}
            className={`border rounded-lg p-4 transition-colors cursor-pointer ${
              (
                !disableMultiSelect && multiSelectEnabled
                  ? selectedClients.has(client.client_id)
                  : selectedClientId === client.client_id
              )
                ? "border-blue-500 bg-blue-100"
                : "border-gray-200 hover:bg-gray-50"
            }`}
            onClick={() => handleClientClick(client.client_id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  <span className="font-mono text-lg font-semibold text-gray-800">
                    {client.client_id}
                  </span>
                  <div className="ml-3 flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="ml-1 text-sm text-green-500">Online</span>
                  </div>
                </div>
                <div className="flex items-center mt-1">
                  <User className="h-3 w-3 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-500">
                    {client.ip_address}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!disableMultiSelect && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={multiSelectEnabled}
                onChange={(e) => {
                  setMultiSelectEnabled(e.target.checked);
                  if (!e.target.checked) {
                    setSelectedClients(new Set());
                  } else if (selectedClientId) {
                    setSelectedClients(new Set([selectedClientId]));
                  }
                }}
              />
              <span className="ml-2 text-sm text-gray-600">
                Enable multi-select
              </span>
            </label>

            {multiSelectEnabled && (
              <div className="flex items-center space-x-4">
                <button
                  className="text-sm text-blue-600 hover:text-blue-700"
                  onClick={handleSelectAll}
                >
                  Select All
                </button>
                <button
                  className="text-sm text-gray-600 hover:text-gray-700"
                  onClick={handleDeselectAll}
                >
                  Deselect All
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiClientSelector;
