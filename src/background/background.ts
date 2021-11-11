// *----*----*----* Globals *----*----*----*

import {BookmarkManager} from "../libs/bookmarks/bookmarkManager";
import {Page, PageTagger} from "../libs/ai/tagger";

let bookmarkManager = new BookmarkManager()

chrome.runtime.onInstalled.addListener(() => {
    let itemsToInit = {
        quickMarkVisible: true,
        listItems: [],
        tagColors: {
            "Unread": "#808080",
            "Read": "#51B848",
            "+": "#0084ff",
            "default": "#51B848"
        }
    }

    chrome.storage.local.set(itemsToInit);
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
                    bookmarkExists: bookmarkManager.getByURL(tab.url).length > 0
                });
    });
}

/**
 * Sends a message whether quickmark is visible or not. Meant to be called when the active tab switches.
 * @param tabId current active tab.
 */
function notifyQuickMarkVisible(tabId: number) {
    chrome.storage.local.get(['quickMarkVisible'], (storage) => {
        chrome.tabs.sendMessage(tabId, {
            action: 'quickMarkVisible',
            quickMarkVisible: storage['quickMarkVisible']
        })

    })
}

// /**
//  * Listeners for created and removed bookmarks that notify the content pages
//  */
// bookmarkManager.onCreated.addListener(url => {
//     notifyBookmarkUpdate(url, true)
// })
// bookmarkManager.onRemoved.addListener(url => {
//     notifyBookmarkUpdate(url, false)
// })
//
// /**
//  * Propagate updates during tab switches
//  */
// chrome.tabs.onActivated.addListener((activeInfo) => {
//     notifyBookmarkUpdateCurrent()
//     notifyQuickMarkVisible(activeInfo.tabId)
// })

function tagAndSave(url: String, title: String, desc: String) {
    chrome.storage.local.get("listItems", (listItems) => {
        console.log(listItems)
        const tagger = new PageTagger(
            listItems["listItems"].map(
                (a: { [p: string]: any }) => new Page(
                    a.url,
                    a.title,
                    a.desc,
                    new Set(a.tags)
                )
            )
        );
        let tags = tagger.tagPageRaw(url, title, desc)
        let newItems = [{
            "url": url,
            "title": title,
            "desc": desc,
            "read": false,
            "tags": Array.from(tags)
        }, ...listItems["listItems"]];
        chrome.storage.local.set({listItems: newItems});
    })
}

/**
 * Listeners for background API actions
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request.action)
    try {
        switch (request.action) {
            case "quickmark":
                console.log(request)
                getCurrentTab().then(tab => {
                    notifyQuickMarkVisible(tab.id!);
                })
                // sendResponse(bookmarkManager.getByURL(request.url).length > 0)
                break
            case "save-bookmark":
                console.log("Adding url: ", request);
                tagAndSave(request.url, request.title, request.desc);
                notifyBookmarkUpdate(request.url, true);
                break
            case "remove-bookmark":
                console.log("Removing url: ", request)
                chrome.storage.local.get("listItems", (query) => {
                    let newItems = query.listItems.filter((item: { url: any; }) => item.url !== request.url);
                    console.log(query.listItems, newItems)
                    chrome.storage.local.set({listItems: newItems});
                })
                notifyBookmarkUpdate(request.url, false);
                break
        }
    } catch (e) {
        console.error(e)
    }
});

// /**
//  * Finds a saved bookmark or the proper category for the new bookmark, and saves it there.
//  *
//  * @param createInfo information about the new bookmark
//  */
// function saveBookmark(createInfo: SmartCreateInfo) {
//     let allBookmarks = bookmarkManager.getAllBookmarks();
//     let allURLs = allBookmarks.map(b => b.url)
//
//     let category = "Unread";
//     bookmarkManager.createInFolder(createInfo, [category]).then()
//
//     // if (closestURLs.length > 0) {
//     //     let bookmark = bookmarkManager.getByURL(closestURLs[0]);
//     //     if (bookmark.length > 0) {
//     //         createInfo.parentId = bookmark[0].parentId
//     //         bookmarkManager.create(createInfo)
//     //     }
//     // } else {
//     //
//     // }
// }