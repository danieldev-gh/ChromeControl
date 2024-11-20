import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Monitor from "./pages/Monitor";
import React from "react";
import NotFound from "./pages/NotFound";
import socket from "./socket";
import NotificationLog from "./components/NotificationLog";
import { WifiOff, Wifi } from "lucide-react";

export const GlobalContext = React.createContext(null);

function App() {
  const [selectedClientId, setSelectedClientId_pre] = React.useState(null);
  const notificationRef = React.useRef();
  const setSelectedClientId = (client_id) => {
    setSelectedClientId_pre(client_id);
    localStorage.setItem("selectedClientId", client_id);
  };

  const [clients, setClients] = React.useState([]);

  React.useEffect(() => {
    fetch("http://localhost:3001/clients")
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
  }, []);

  React.useEffect(() => {
    function onEvent(event) {
      if (
        event.event === "clientDisconnected" ||
        event.event === "clientConnected"
      ) {
        fetch("http://localhost:3001/clients")
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
  }, [selectedClientId]);

  return (
    <div className="w-full max-h-full h-full flex flex-col">
      <GlobalContext.Provider
        value={{ selectedClientId, setSelectedClientId, clients, setClients }}
      >
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/monitor" element={<Monitor />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <NotificationLog ref={notificationRef} />
      </GlobalContext.Provider>
    </div>
  );
}

export default App;
