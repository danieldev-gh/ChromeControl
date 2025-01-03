import React from "react";
import DataTable from "./DataTable";
import { GlobalContext } from "../App";
import socketManager from "../socket";
import LSPairModal from "./LSPairModal";
const LocalStorage = () => {
  const [data, setData] = React.useState(null);
  const { selectedClientId, endpointUrl } = React.useContext(GlobalContext);
  const [showModal, setShowModal] = React.useState(false);
  const [currentItem, setCurrentItem] = React.useState(null);
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
    fetch(`${endpointUrl}/localstorage/${selectedClientId}`)
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
      if (
        event.event === "localstorage" &&
        event.client_id === selectedClientId
      ) {
        fetch(`${endpointUrl}/localstorage/${selectedClientId}`)
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
  }, [selectedClientId, socket, endpointUrl]);
  const headers = ["domain", "key", "value"];
  const weights = [0.5, 1, 1];
  return (
    <div className="flex flex-grow flex-col">
      <LSPairModal
        show={showModal}
        setShow={setShowModal}
        lspair={currentItem}
      />
      <DataTable
        headers={headers}
        weights={weights}
        data={data}
        copyBtnColumns={[3]}
        onItemClick={(item) => {
          setCurrentItem(item);
          setShowModal(true);
        }}
      />
    </div>
  );
};

export default LocalStorage;
