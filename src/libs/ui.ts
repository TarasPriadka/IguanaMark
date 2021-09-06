export async function saveCurrentPage(title: string, url: string, tab: chrome.tabs.Tab | object | null) {

    chrome.runtime.sendMessage({
            action: "save-bookmark",
            title: title,
            url: url,
            tab: tab
        },
    );

}

export async function removeCurrentPage(url: string) {

    chrome.runtime.sendMessage({
            action: "remove-bookmark",
            url: url,
        },
    );

}

export function checkBookmark(url: string, callback: (a: boolean) => any) {
    chrome.runtime.sendMessage({
            action: "check-bookmark",
            url: url,
        },
        callback
    );
}