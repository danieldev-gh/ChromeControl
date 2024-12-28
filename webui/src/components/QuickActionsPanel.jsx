import React from "react";
import { Zap, MessageCircleX } from "lucide-react";
import { GlobalContext } from "../App";
export const QuickActionsPanel = ({ className = "" }) => {
  const [message, setMessage] = React.useState("");
  const { selectedClientId } = React.useContext(GlobalContext);
  return (
    <div
      className={`bg-white rounded-lg shadow-lg outline outline-gray-300 outline-1 p-6 ${className}`}
    >
      <div className="flex items-center mb-6">
        <Zap className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
      </div>
      <div className="flex items-center p-4 rounded-lg bg-gray-100">
        <div className="bg-white rounded-full p-3 shadow-sm">
          <MessageCircleX className="h-8 w-8 text-blue-600" />
        </div>
        <div className="flex flex-col ml-4 flex-grow">
          <h3 className="text-lg font-semibold text-gray-900">Send Alert</h3>
          <p className="text-sm text-gray-500 mb-2">
            Send an alert to a client
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter message"
              className="flex-grow px-3 py-2 border-2 border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              onClick={async () => {
                try {
                  await fetch("/alert", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      client_id: selectedClientId,
                      message: message,
                    }),
                  });
                } catch (error) {
                  console.error(error);
                }
              }}
            >
              Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
