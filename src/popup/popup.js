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
        args: [tab]
    })
});

function saveCurrentPage(tab) {
    chrome.runtime.sendMessage({
            action: "save-bookmark",
            title: tab.title,
            url: tab.url
        },
    );
}