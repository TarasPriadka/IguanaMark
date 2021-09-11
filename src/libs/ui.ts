/**
 * Wrapper for chrome.runtime.sendMessage with a try-catch block.
 *
 * @param message message to send
 * @param callback callback for the message. Optional.
 */
function sendMessage(message: any, callback: any = undefined) {
    try {
        return chrome.runtime.sendMessage(message, callback);
    } catch (e) {
        console.log(e)
    }
}

/**
 * Saves bookmark
 *
 * @param title title of page.
 * @param url URL of the page to save.
 * @param tab tabId from which the request to bookmark is sent. Optional.
 */
export async function saveCurrentPage(title: string, url: string, tab: (chrome.tabs.Tab | object | undefined) = undefined) {
    return sendMessage({
        action: "save-bookmark",
        title: title,
        url: url,
        tab: tab
    })
}

/**
 * Removes bookmark with given URL
 * @param url URL of bookmark to remove
 */
export async function removeCurrentPage(url: string) {
    return sendMessage({
            action: "remove-bookmark",
            url: url,
        },
    );
}

/**
 * Checks whether bookmark exists.
 *
 * @param url URL of bookmark to check
 * @param callback callback with the boolean exists or not.
 */
export function getBookmarkExists(url: string, callback: (exists: boolean) => any) {
    return sendMessage({
            action: "check-bookmark",
            url: url,
        },
        callback
    );
}