// // Initialize button with user's preferred color
let getUrlButton = document.getElementById("saveUrl")


getUrlButton.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  chrome.scripting.executeScript({
    target: {
      tabId: tab.id
    },
    function: saveCurrentPage,
  });
});

function saveCurrentPage() {
  chrome.runtime.sendMessage({
      action: "save-bookmark",
      title: document.getElementsByTagName("title")[0].innerHTML,
      url: window.location.href
    },
    (response) => {
      console.log(response)
    });
}

