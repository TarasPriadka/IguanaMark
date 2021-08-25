async function saveCurrentPage(title: string, url: string, tab: chrome.tabs.Tab | object | null) {

    chrome.runtime.sendMessage({
            action: "save-bookmark",
            title: title,
            url: url,
            tab: tab
        },
    );

}

export default saveCurrentPage;