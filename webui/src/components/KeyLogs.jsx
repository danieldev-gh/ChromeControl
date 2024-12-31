import React from "react";
import KeylogViewer from "./KeyLogViewer";
import { GlobalContext } from "../App";
import socketManager from "../socket";
const Keylogs = () => {
  const [data, setData] = React.useState(null);
  const { selectedClientId, endpointUrl } = React.useContext(GlobalContext);
  const [socket, setSocket] = React.useState(socketManager.getSocket());
  React.useEffect(() => {
    // Get notified when the socket changes
    const cleanup = socketManager.addListener(setSocket);
    return cleanup;
  }, []);
  React.useEffect(() => {
    if (!selectedClientId) {
      setData(null);
      return;
    }
    fetch(`${endpointUrl}/keylogs/${selectedClientId}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setData([]);
        console.error(err);
      });
  }, [selectedClientId, endpointUrl]);
  React.useEffect(() => {
    function onEvent(event) {
      if (event.event === "keylogs" && event.client_id === selectedClientId) {
        fetch(`${endpointUrl}/keylogs/${selectedClientId}`)
          .then((res) => res.json())
          .then((res) => {
            setData(res);
          })
          .catch((err) => {
            setData([]);
            console.error(err);
          });
      }
    }
    socket.on("event", onEvent);
    return () => {
      socket.off("event", onEvent);
    };
  }, [selectedClientId, endpointUrl, socket]);

  return <div>{data && <KeylogViewer keylogs={data} />}</div>;
};

export default Keylogs;
