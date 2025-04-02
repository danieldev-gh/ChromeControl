import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Monitor from "./pages/Monitor";
import React from "react";
import NotFound from "./pages/NotFound";
import socketManager from "./socket";
import NotificationLog from "./components/NotificationLog";
import { WifiOff, Wifi } from "lucide-react";
import Actions from "./pages/Actions";
import Files from "./pages/Files";
import Settings from "./pages/Settings";
export const GlobalContext = React.createContext(null);

function App() {
  const [socket, setSocket] = React.useState(socketManager.getSocket());
  React.useEffect(() => {
    // Get notified when the socket changes
    const cleanup = socketManager.addListener(setSocket);
    return cleanup;
  }, []);
  const [selectedClientId, setSelectedClientId_pre] = React.useState(null);
  const notificationRef = React.useRef();
  const setSelectedClientId = (client_id) => {
    setSelectedClientId_pre(client_id);
    localStorage.setItem("selectedClientId", client_id);
  };
  const [endpointUrl, setEndpointUrl_pre] = React.useState("");
  const setEndpointUrl = (url) => {
    setEndpointUrl_pre(url);
    localStorage.setItem("endpointUrl", url);
    socketManager.connect(url);
  };
  const [clients, setClients] = React.useState([]);
  React.useEffect(() => {
    const url = localStorage.getItem("endpointUrl");
    if (url) setEndpointUrl_pre(url);
  }, []);
  React.useEffect(() => {
    fetch(`${endpointUrl}/clients`)
      .then((res) => res.json())
      .then((data) => {
        data.sort((a, b) => {
          if (a.online !== b.online) return b.online - a.online;
          return a.client_id.localeCompare(b.client_id);
        });
        setClients(data);
        let clientid =
          localStorage.getItem("selectedClientId") || data[0]?.client_id;
        if (data.find((client) => client.client_id === clientid)) {
          setSelectedClientId(clientid);
        } else {
          setSelectedClientId(data[0]?.client_id);
        }
      })
      .catch((err) => console.error(err));
  }, [endpointUrl]);

  React.useEffect(() => {
    function onEvent(event) {
      if (
        event.event === "clientDisconnected" ||
        event.event === "clientConnected"
      ) {
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

            // Add notification for connection/disconnection
            const isConnected = event.event === "clientConnected";
            const icon = isConnected ? (
              <Wifi className="text-green-500" />
            ) : (
              <WifiOff className="text-red-500" />
            );
            const message = `Client ${event.client_id} ${
              isConnected ? "connected" : "disconnected"
            }`;
            notificationRef.current?.addNotification(message, icon);
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
    <div className="w-full max-h-full h-full flex flex-col">
      <GlobalContext.Provider
        value={{
          selectedClientId,
          setSelectedClientId,
          clients,
          setClients,
          endpointUrl,
          setEndpointUrl,
        }}
      >
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/monitor" element={<Monitor />} />
          <Route path="/actions" element={<Actions />} />
          <Route path="/files" element={<Files />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <NotificationLog ref={notificationRef} />
      </GlobalContext.Provider>
    </div>
  );
}

export default App;
