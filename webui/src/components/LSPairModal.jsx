import React from "react";

const LSPairModal = ({ show, setShow, lspair }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 m-4">
        {lspair && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Pair Information
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="w-24 text-sm text-gray-600">Key</label>
                <input
                  type="text"
                  value={lspair.key}
                  readOnly
                  className="flex-1 px-3 py-1.5 bg-gray-50 border rounded focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => copyToClipboard(lspair.key)}
                  className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Copy
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-24 text-sm text-gray-600">Value</label>
                <input
                  value={lspair.value}
                  readOnly
                  type="text"
                  className="flex-1 px-3 py-1.5 bg-gray-50 border rounded focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => copyToClipboard(lspair.value)}
                  className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Copy
                </button>
              </div>
              <div className="flex items-center gap-2">
                <label className="w-24 text-sm text-gray-600">Domain</label>
                <input
                  value={lspair.domain}
                  readOnly
                  type="text"
                  className="flex-1 px-3 py-1.5 bg-gray-50 border rounded focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => copyToClipboard(lspair.domain)}
                  className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Copy
                </button>
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

export default LSPairModal;
