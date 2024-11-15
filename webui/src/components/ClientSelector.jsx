import React, { useState, useEffect, useRef } from "react";
import { GlobalContext } from "../App";
import { ChevronDown, ChevronUp } from "lucide-react";

const ClientSelector = ({ className = "" }) => {
  const { selectedClientId, setSelectedClientId, clients } =
    React.useContext(GlobalContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sort clients - online first, then by OS
  const sortedClients = [...clients].sort((a, b) => {
    if (a.online !== b.online) return b.online - a.online;
    return a.client_id.localeCompare(b.client_id);
  });

  // Find selected client for display
  const selectedClient = clients.find((c) => c.client_id === selectedClientId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Custom Select Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-gray-200 text-gray-700 p-2 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex items-center">
          {selectedClient && (
            <>
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  selectedClient.online ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              <span>
                {selectedClient.os + " - " + selectedClient.client_id}
              </span>
            </>
          )}
          {!selectedClient && <span>Select a client</span>}
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {sortedClients.map((client) => (
            <div
              key={client.client_id}
              onClick={() => {
                setSelectedClientId(client.client_id);
                setIsOpen(false);
              }}
              className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                selectedClientId === client.client_id ? "bg-gray-50" : ""
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  client.online ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              <span className="text-sm">
                {client.os + " - " + client.client_id}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientSelector;
