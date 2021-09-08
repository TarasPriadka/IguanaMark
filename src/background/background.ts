// background.js

// *----*----*----* Globals *----*----*----*
import {checkBookmark} from "../libs/ui";

let urlClassifier: UrlCategorizer

import {UrlCategorizer} from "../libs/urlCategorizer"
import {Bookmarks} from "../libs/bookmarks"

let bookmarks = new Bookmarks()
const dataURL = chrome.runtime.getURL('/data/urlClasses.json');

/**
 * Function to notify content page of bookmark creation/deletion state
 * This is necessary for having the content page update when the user manages bookmarks via the popup or the bookmarks
 * bar in the browser.
 *
 * @param url bookmark url
 * @param bookmarkExists whether to notify of bookmark creation (true) or deletion (false)
 */
function notifyContentPage(url: string, bookmarkExists: boolean) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }).then(tabs => {
        if (tabs.length > 0 && tabs[0].id && tabs[0].url == url)
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    action: "broadcast-update",
                    url: url,
                    bookmarkExists: bookmarkExists
                });
    });
}

function notifyContentPageYourself() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }).then(tabs => {
        if (tabs.length > 0 && tabs[0].id && tabs[0].url)
            chrome.tabs.sendMessage(
                tabs[0].id!,
                {
                    action: "broadcast-update",
                    url: tabs[0].url,
                    bookmarkExists: bookmarks.bookmarkExists(tabs[0].url)
                });
    });
}


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
    notifyContentPage(bookmark.url!, true)
})
chrome.bookmarks.onRemoved.addListener((id, removeInfo) => {
    notifyContentPage(removeInfo.node.url!, false)
})
// In case bookmark existence state changes while content is not focused
chrome.tabs.onActivated.addListener((activeInfo) => {
    notifyContentPageYourself()
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
                sendResponse(bookmarks.removeBookmark(request.url))
                break
        }
    } catch (e) {
        console.error(e)
    }
});