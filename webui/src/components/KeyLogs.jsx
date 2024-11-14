import React from "react";
import KeylogViewer from "./KeyLogViewer";
import { GlobalContext } from "../App";
import socket from "../socket";
const Keylogs = () => {
  const [data, setData] = React.useState(null);
  const { selectedClientId } = React.useContext(GlobalContext);
  React.useEffect(() => {
    if (!selectedClientId) {
      setData(null);
      return;
    }
    fetch(`http://localhost:3001/keylogs/${selectedClientId}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setData([]);
        console.error(err);
      });
  }, [selectedClientId]);
  React.useEffect(() => {
    function onEvent(event) {
      if (event.event === "keylogs" && event.client_id === selectedClientId) {
        fetch(`http://localhost:3001/keylogs/${selectedClientId}`)
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
  }, [selectedClientId]);

  return <div>{data && <KeylogViewer keylogs={data} />}</div>;
};

export default Keylogs;
