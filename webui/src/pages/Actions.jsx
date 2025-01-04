import React from "react";
import MultiClientSelector from "../components/MultiClientSelector";

const Actions = () => {
  const [selectedClients, setSelectedClients] = React.useState(new Set());
  const [disableMultiSelect, setDisableMultiSelect] = React.useState(false);
  return (
    <div className="flex flex-col-reverse lg:flex-row flex-grow min-h-0 p-4 gap-4">
      <MultiClientSelector
        selectedClients={selectedClients}
        setSelectedClients={setSelectedClients}
        disableMultiSelect={disableMultiSelect}
        className="flex-1"
      />
    </div>
  );
};

export default Actions;
