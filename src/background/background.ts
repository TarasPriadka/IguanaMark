// background.js

// *----*----*----* Globals *----*----*----*
//global to store smartMarkNode
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

// let smartMarkNode: BookmarkTreeNode
let urlClassifier: UrlCategorizer

import {UrlCategorizer} from "../libs/urlCategorizer"
import {Bookmarks} from "../libs/bookmarks"

let bookmarks = new Bookmarks()

// *----*----*----* On-Install Script *----*----*----*
chrome.runtime.onInstalled.addListener(() => {
    const url = chrome.runtime.getURL('/data/urlClasses.json');
    fetch(url)
        .then((response) => response.json()) //assuming file contains json
        .then((urlMap) => {
            urlClassifier = new UrlCategorizer(urlMap);
        });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request.action)
    try {
        switch (request.action) {
            // case "get-bookmarks":
            //     bookmarks.getBookmarks()
            //     break
            case "save-bookmark":
                let category = String(urlClassifier.getUrlCategory(request.url)).valueOf()
                bookmarks.saveBookmark(request.url, request.title, [category]).then(sendResponse)
                break
        }
    } catch (e) {
        console.error(e)
    }
});