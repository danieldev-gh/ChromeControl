import React from "react";
import DataTable from "./DataTable";
import CookieModal from "./CookieModal";
import { GlobalContext } from "../App";

const Cookies = () => {
  const [data, setData] = React.useState(null);
  const { selectedClientId } = React.useContext(GlobalContext);
  const [showModal, setShowModal] = React.useState(false);
  const [currentItem, setCurrentItem] = React.useState(null);

  React.useEffect(() => {
    if (!selectedClientId) return;
    fetch(`http://localhost:3001/cookies/${selectedClientId}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setData([]);
        console.error(err);
      });
  }, [selectedClientId]);
  const headers = [
    "domain",
    "path",
    "name",
    "value",
    "exp",
    "sec",
    "ses",
    "h_o",
    "http",
  ];
  const weights = [1, 1, 0.8, 2, 0.5, 0.25, 0.25, 0.25, 0.25];
  return (
    <div className="flex flex-grow flex-col">
      <CookieModal
        show={showModal}
        setShow={setShowModal}
        cookie={currentItem}
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

export default Cookies;
