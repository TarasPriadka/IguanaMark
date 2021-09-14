// *----*----*----* Globals *----*----*----*

import {SmartBookmarks} from "../libs/smartBookmarks";
import {UrlCategorizer} from "../libs/urlCategorizer";
import {SmartCreateInfo} from "../libs/smartBookmark";

let urlClassifier: UrlCategorizer

let bookmarks = new SmartBookmarks()

/**
 * Fetch data for the URL categorizer.
 */
const dataURL = chrome.runtime.getURL('/data/urlClasses.json');
fetch(dataURL)
    .then((response) => response.json())
    .then((urlMap) => {
        urlClassifier = new UrlCategorizer(urlMap);
    });

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
        if (tab && tab.id)
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
        if (tab && tab.id && tab.url)
            chrome.tabs.sendMessage(
                tab.id!,
                {
                    action: "broadcast-update",
                    url: tab.url,
                    bookmarkExists: bookmarks.getByURL(tab.url).length > 0
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
 * Listeners for created and removed bookmarks that notify the content pages
 */
bookmarks.onCreated.addListener(url => {
    notifyBookmarkUpdate(url, true)
})
bookmarks.onRemoved.addListener(url => {
    notifyBookmarkUpdate(url, false)
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
                sendResponse(bookmarks.getByURL(request.url).length > 0)
                break
            case "save-bookmark":
                saveBookmark({
                    url: request.url,
                    title: request.title
                })
                break
            case "remove-bookmark":
                bookmarks.removeAll(bookmarks.getByURL(request.url))
                break
        }
    } catch (e) {
        console.error(e)
    }
});

/**
 * Finds a saved bookmark or the proper category for the new bookmark, and saves it there.
 *
 * @param createInfo information about the new bookmark
 */
function saveBookmark(createInfo: SmartCreateInfo) {
    let allBookmarks = bookmarks.getAllBookmarks();
    let allURLs = allBookmarks.map(b => b.url)

    let closestURLs = urlClassifier.getMostSimilarUrl(createInfo.url!, allURLs);
    if (closestURLs.length > 0) {
        let bookmark = bookmarks.getByURL(closestURLs[0]);
        if (bookmark.length > 0) {
            createInfo.parentId = bookmark[0].parentId
            bookmarks.create(createInfo)
        }
    } else {
        let category = urlClassifier.getUrlCategory(createInfo.url!)
        bookmarks.createInFolder(createInfo, [category]).then()
    }
}