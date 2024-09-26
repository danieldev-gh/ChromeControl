import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import React from "react";
import NotFound from "./pages/NotFound"; // Import your 404 page component
export const GlobalContext = React.createContext(null);
function App() {
  const [selectedClientId, setSelectedClientId] = React.useState(null);
  const [clients, setClients] = React.useState([]);
  // get clients from the server
  React.useEffect(() => {
    fetch("/clients")
      .then((res) => res.json())
      .then((data) => {
        setClients(data), setSelectedClientId(data[0].client_id);
      })
      .catch((err) => console.error(err));
  }, []);
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
