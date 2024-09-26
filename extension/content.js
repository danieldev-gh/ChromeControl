chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const data = JSON.parse(request.message);
  if (data[0] === "alert") {
    alert(data[1]);
  }
});
