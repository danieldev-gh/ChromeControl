import React from "react";
import { GlobalContext } from "../App";
import ClientSelector from "../components/ClientSelector";

const Home = () => {
  const { selectedClientId } = React.useContext(GlobalContext);
  const [message, setMessage] = React.useState("");
  return (
    <div className="flex flex-col p-2">
      Home
      <div className="mt-2">
        <input
          type="text"
          placeholder="message"
          className="mr-2 border-blue-500 border-2 h-8 rounded-md"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white h-8 px-2 rounded-md"
          onClick={() => {
            // send alert request to the server with the client id and message

            fetch("http://localhost:3001/alert", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                client_id: selectedClientId,
                message: message,
              }),
            }).catch((error) => {
              // handle error
              console.error(error);
            });
          }}
        >
          Alert
        </button>
      </div>
      <ClientSelector className="w-[20vw] mt-2" />
    </div>
  );
};

export default Home;
