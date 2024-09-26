let ws;
function getCurrentTab(callback) {
  let queryOptions = { active: true, lastFocusedWindow: true };
  chrome.tabs.query(queryOptions, ([tab]) => {
    if (chrome.runtime.lastError) console.error(chrome.runtime.lastError);
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    callback(tab);
  });
}
function connectWebSocket() {
  ws = new WebSocket("ws://localhost:3000");

  ws.addEventListener("open", () => {
    console.log("WebSocket connected");
  });
  ws.addEventListener("message", handleMessages);
  ws.addEventListener("close", () => {
    console.log(
      "WebSocket disconnected, attempting to reconnect in 1 seconds..."
    );
    setTimeout(() => {
      connectWebSocket();
    }, 1000);
  });
}

function send(type, data) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify([type, data]));
  } else {
    console.log("WebSocket is not open");
  }
}
function sendMessageToContentScript(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    let activeTab = tabs[0]; // Get the active tab
    chrome.tabs.sendMessage(activeTab.id, { message: message }, (response) => {
      console.log("Response from content script:", response);
    });
  });
}
function handleMessages(message) {
  try {
    const data = JSON.parse(message.data);
    switch (data[0]) {
      case "alert":
        sendMessageToContentScript(JSON.stringify(["alert", data[1]]));
        break;
    }
  } catch (err) {
    console.error(err);
  }
}

connectWebSocket();

let client_id;
// Get client_id from local storage
chrome.storage.local.get("client_id", (data) => {
  client_id = data.client_id;
  if (!client_id) {
    client_id = Math.random().toString(36).substring(7);
    chrome.storage.local.set({ client_id });
  }
  send("alive", {
    client_id,
    os: "windows",
    username: "user",
  });
  setInterval(() => {
    send("alive", {
      client_id,
      os: "Windows",
      username: "user",
    });
  }, 1000);
});
