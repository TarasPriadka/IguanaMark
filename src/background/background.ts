// background.js

// *----*----*----* Globals *----*----*----*
let urlClassifier: UrlCategorizer

import {UrlCategorizer} from "../libs/urlCategorizer"
import {Bookmarks} from "../libs/bookmarks"

let bookmarks = new Bookmarks()
const dataURL = chrome.runtime.getURL('/data/urlClasses.json');
fetch(dataURL)
    .then((response) => response.json())
    .then((urlMap) => {
        urlClassifier = new UrlCategorizer(urlMap);
    });


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
                if (sender.tab && sender.tab.id) {
                    chrome.tabs.sendMessage(
                        sender.tab.id,
                        {
                            action: "broadcast-update",
                            url: request.url,
                            bookmarkExists: true
                        });
                } else {
                    chrome.tabs.query({
                        active: true,
                        currentWindow: true
                    }).then(tabs => {
                        if (tabs.length > 0 && tabs[0].id) {
                            chrome.tabs.sendMessage(
                                tabs[0].id,
                                {
                                    action: "broadcast-update",
                                    url: request.url,
                                    bookmarkExists: true
                                });
                        }
                    });
                }
                break
            case "remove-bookmark":
                sendResponse(bookmarks.removeBookmark(request.url))
                if (sender.tab && sender.tab.id) {
                    chrome.tabs.sendMessage(
                        sender.tab.id,
                        {
                            action: "broadcast-update",
                            url: request.url,
                            bookmarkExists: false
                        });
                } else {
                    chrome.tabs.query({
                        active: true,
                        currentWindow: true
                    }).then(tabs => {
                        if (tabs.length > 0 && tabs[0].id) {
                            chrome.tabs.sendMessage(
                                tabs[0].id,
                                {
                                    action: "broadcast-update",
                                    url: request.url,
                                    bookmarkExists: false
                                });
                        }
                    });
                }
                break
        }
    } catch (e) {
        console.error(e)
    }
});