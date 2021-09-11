// *----*----*----* Globals *----*----*----*
let urlClassifier: UrlCategorizer

import {UrlCategorizer} from "../libs/urlCategorizer"
import {Bookmarks} from "../libs/bookmarks"

let bookmarks = new Bookmarks()
const dataURL = chrome.runtime.getURL('/data/urlClasses.json');

/**
 * Returns a promise with the current active tab.
 * @return tab active tab promise.
 */
async function getCurrentTab(): Promise<chrome.tabs.Tab> {
    let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    })
    return tab
}

/**
 * Function to notify content page of bookmark creation/deletion state
 * This is necessary for having the content page update when the user manages bookmarks via the popup or the bookmarks
 * bar in the browser.
 *
 * @param url bookmark url
 * @param bookmarkExists whether to notify of bookmark creation (true) or deletion (false)
 */
function notifyBookmarkUpdate(url: string, bookmarkExists: boolean) {
    getCurrentTab().then(tab => {
        if (tab.id)
            chrome.tabs.sendMessage(
                tab.id,
                {
                    action: "broadcast-update",
                    url: url,
                    bookmarkExists: bookmarkExists
                });
    });
}

/**
 * Notifies the current tab whether bookmark exists or not
 */
function notifyBookmarkUpdateCurrent() {
    getCurrentTab().then(tab => {
        if (tab.id && tab.url)
            chrome.tabs.sendMessage(
                tab.id!,
                {
                    action: "broadcast-update",
                    url: tab.url,
                    bookmarkExists: bookmarks.bookmarkExists(tab.url)
                });
    });
}

/**
 * Sends a message whether quickmark is visible or not. Meant to be called when the active tab switches.
 * @param tabId current active tab.
 */
function notifyQuickMarkVisible(tabId: number) {
    chrome.storage.sync.get(['quickMarkVisible'], (storage) => {
        chrome.tabs.sendMessage(tabId, {
            action: 'quickMarkVisible',
            quickMarkVisible: storage['quickMarkVisible']
        })

    })
}

/**
 * Fetch data for the URL categorizer.
 */
fetch(dataURL)
    .then((response) => response.json())
    .then((urlMap) => {
        urlClassifier = new UrlCategorizer(urlMap);
    });

/**
 * Listeners for created and removed bookmarks that notify the content pages
 * TODO: add onCreated and onRemoved listeners in bookmarks.ts that would fire when a bookmark
 *  is moved outside of main folder as well
 */
chrome.bookmarks.onCreated.addListener((id, bookmark) => {
    notifyBookmarkUpdate(bookmark.url!, true)
})
chrome.bookmarks.onRemoved.addListener((id, removeInfo) => {
    notifyBookmarkUpdate(removeInfo.node.url!, false)
})

/**
 * Propagate updates during tab switches
 */
chrome.tabs.onActivated.addListener((activeInfo) => {
    notifyBookmarkUpdateCurrent()
    notifyQuickMarkVisible(activeInfo.tabId)
})

/**
 * Listeners for background API actions
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request.action)
    try {
        switch (request.action) {

            case "check-bookmark":
                sendResponse(bookmarks.bookmarkExists(request.url))
                break

            case "save-bookmark":
                let category = String(urlClassifier.getUrlCategory(request.url)).valueOf()
                bookmarks.saveBookmark(request.url, request.title, [category]).then(sendResponse)
                break

            case "remove-bookmark":
                bookmarks.removeBookmark(request.url)
                break

        }
    } catch (e) {
        console.error(e)
    }
});