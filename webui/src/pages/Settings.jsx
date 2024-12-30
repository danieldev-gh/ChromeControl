import React from "react";
import { GlobalContext } from "../App";

const Settings = () => {
  const { endpointUrl, setEndpointUrl } = React.useContext(GlobalContext);
  const [url, setUrl] = React.useState(endpointUrl);
  React.useEffect(() => {
    setUrl(endpointUrl);
  }, [endpointUrl]);
  return (
    <div>
      <h1>Settings</h1>
      <input
        type="text"
        placeholder="Endpoint URL (empty for this url)"
        className="flex-grow px-3 py-2 border-2 border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        onClick={() => setEndpointUrl(url)}
      >
        Apply
      </button>
    </div>
  );
};

export default Settings;
