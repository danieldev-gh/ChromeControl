import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Monitor from "./pages/Monitor";
import React from "react";
import NotFound from "./pages/NotFound"; // Import your 404 page component
import socket from "./socket";
export const GlobalContext = React.createContext(null);
function App() {
  const [selectedClientId, setSelectedClientId_pre] = React.useState(null);
  const setSelectedClientId = (client_id) => {
    setSelectedClientId_pre(client_id);
    // save the selected client id to the local storage
    localStorage.setItem("selectedClientId", client_id);
  };

  const [clients, setClients] = React.useState([]);
  // get clients from the server
  React.useEffect(() => {
    fetch("http://localhost:3001/clients")
      .then((res) => res.json())
      .then((data) => {
        data.sort((a, b) => {
          if (a.online !== b.online) return b.online - a.online;
          return a.client_id.localeCompare(b.client_id);
        });
        setClients(data);
        // get the selected client id from the local storage
        let clientid =
          localStorage.getItem("selectedClientId") || data[0]?.client_id;
        // make sure client id is valid
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
            setSelectedClientId(data[0]?.client_id);
          })
          .catch((err) => console.error(err));
      }
    }
    socket.on("event", onEvent);
    return () => {
      socket.off("event", onEvent);
    };
  }, []);
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
          <Route path="*" element={<NotFound />} />{" "}
          {/* Set the default route to the 404 page */}
        </Routes>
      </GlobalContext.Provider>
    </div>
  );
}

export default App;
