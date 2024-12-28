import React from "react";
import DataTable from "./DataTable";
import JsonModal from "./JsonModal";
import { GlobalContext } from "../App";
import socket from "../socket";

const Credentials = () => {
  const [data, setData] = React.useState(null);
  const { selectedClientId } = React.useContext(GlobalContext);
  const [showModal, setShowModal] = React.useState(false);
  const [currentItem, setCurrentItem] = React.useState(null);

  React.useEffect(() => {
    if (!selectedClientId) {
      setData(null);
      return;
    }
    fetch(`/credentials/${selectedClientId}`)
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
      if (
        event.event === "credentials" &&
        event.client_id === selectedClientId
      ) {
        fetch(`/credentials/${selectedClientId}`)
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
  const headers = ["url", "timestamp", "data"];
  const weights = [0.5, 0.5, 2];
  return (
    <div className="flex flex-grow flex-col">
      <JsonModal show={showModal} setShow={setShowModal} item={currentItem} />
      <DataTable
        headers={headers}
        weights={weights}
        data={data}
        onItemClick={(item) => {
          setCurrentItem(item);
          setShowModal(true);
        }}
      />
    </div>
  );
};

export default Credentials;
