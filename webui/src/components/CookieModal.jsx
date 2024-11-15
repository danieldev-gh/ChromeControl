import React from "react";

const CookieModal = ({ show, setShow, cookie }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 m-4">
        {cookie && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Cookie Information
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="w-24 text-sm text-gray-600">
                  Cookie Name
                </label>
                <input
                  type="text"
                  value={cookie.name}
                  readOnly
                  className="flex-1 px-3 py-1.5 bg-gray-50 border rounded focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => copyToClipboard(cookie.name)}
                  className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Copy
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-24 text-sm text-gray-600">Value</label>
                <input
                  value={cookie.value}
                  readOnly
                  type="text"
                  className="flex-1 px-3 py-1.5 bg-gray-50 border rounded focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => copyToClipboard(cookie.value)}
                  className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-600">Domain:</span>
                <span className="ml-2 text-gray-900">{cookie.domain}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-600">Path:</span>
                <span className="ml-2 text-gray-900">{cookie.path}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-600">Expires:</span>
                <span className="ml-2 text-gray-900">{cookie.expiration}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-600">HTTP Only:</span>
                <span className="ml-2 text-gray-900">
                  {cookie.http_only ? "Yes" : "No"}
                </span>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-600">Secure:</span>
                <span className="ml-2 text-gray-900">
                  {cookie.secure ? "Yes" : "No"}
                </span>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-600">Host Only:</span>
                <span className="ml-2 text-gray-900">
                  {cookie.host_only ? "Yes" : "No"}
                </span>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-600">Session:</span>
                <span className="ml-2 text-gray-900">
                  {cookie.session ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShow(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieModal;
