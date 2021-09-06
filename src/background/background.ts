// background.js

// *----*----*----* Globals *----*----*----*
let urlClassifier: UrlCategorizer

import {UrlCategorizer} from "../libs/urlCategorizer"
import {Bookmarks} from "../libs/bookmarks"

let bookmarks = new Bookmarks()
const url = chrome.runtime.getURL('/data/urlClasses.json');
fetch(url)
    .then((response) => response.json())
    .then((urlMap) => {
        urlClassifier = new UrlCategorizer(urlMap);
    });

// *----*----*----* On-Install Script *----*----*----*
chrome.runtime.onInstalled.addListener(() => {
    // Do nothing
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request.action)
    try {
        switch (request.action) {
            // case "get-bookmarks":
            //     bookmarks.getBookmarks()
            //     break
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