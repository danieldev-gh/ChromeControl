import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import React from "react";
import NotFound from "./pages/NotFound"; // Import your 404 page component
export const GlobalContext = React.createContext(null);

function App() {
  const [selectedClientId, setSelectedClientId] = React.useState(null);
  const [clients, setClients] = React.useState([
    {
      id: 1,
      name: "Client 1",
    },
    {
      id: 2,
      name: "Client 2",
    },
    {
      id: 3,
      name: "Client 3",
    },
  ]);
  return (
    <div className="w-full h-full overflow-hidden flex flex-col">
      <GlobalContext.Provider
        value={{ selectedClientId, setSelectedClientId, clients, setClients }}
      >
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="*" element={<NotFound />} />{" "}
          {/* Set the default route to the 404 page */}
        </Routes>
      </GlobalContext.Provider>
    </div>
  );
}

export default App;
