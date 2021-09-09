function sendMessage(message: any, callback: any = undefined) {
    try {
        return chrome.runtime.sendMessage(message, callback);
    } catch (e) {
        console.log(e)
    }
}

export async function saveCurrentPage(title: string, url: string, tab: chrome.tabs.Tab | object | null) {
    return sendMessage({
        action: "save-bookmark",
        title: title,
        url: url,
        tab: tab
    })
}

export async function removeCurrentPage(url: string) {
    return sendMessage({
            action: "remove-bookmark",
            url: url,
        },
    );
}

export function checkBookmark(url: string, callback: (a: boolean) => any) {
    return sendMessage({
            action: "check-bookmark",
            url: url,
        },
        callback
    );
}