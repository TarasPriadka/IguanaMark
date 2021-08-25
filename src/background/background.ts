// background.js

// *----*----*----* Globals *----*----*----*
//global to store smartMarkNode
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

let smartMarkNode: BookmarkTreeNode
let urlClassifier: UrlCategorizer

import {UrlCategorizer} from "../libs/urlCategorizer"

function updateSmartMarkNode() {
    chrome.bookmarks.getTree((tree: BookmarkTreeNode[]) => {
        let folderPresent: boolean = false
        tree[0].children![0].children!.forEach(element => {
            if (element.title === 'SmartMark bookmarks') {
                folderPresent = true;
                smartMarkNode = element;
                chrome.storage.sync.set({
                    smartMarkNode: smartMarkNode,
                });
                console.log(smartMarkNode);
            }
        });
        if (!folderPresent) {
            console.log("Didn't find bookmark folder");
            chrome.bookmarks.create({
                    'parentId': "1",
                    'title': 'SmartMark bookmarks'
                },
                function (newFolder) {
                    smartMarkNode = newFolder;
                    chrome.storage.sync.set({
                        smartMarkNode: smartMarkNode,
                    });
                    console.log(smartMarkNode);
                },
            );
        }
    });
}

// *----*----*----* On-Install Script *----*----*----*
chrome.runtime.onInstalled.addListener(() => {
    const url = chrome.runtime.getURL('/data/urlClasses.json');
    fetch(url)
        .then((response) => response.json()) //assuming file contains json
        .then((urlMap) => {
            urlClassifier = new UrlCategorizer(urlMap);
        });

    updateSmartMarkNode()
});

function getBookmarks(sendResponse: { (a: { ok: boolean; bookmarks: BookmarkTreeNode[]; }): any }) {
    chrome.bookmarks.getSubTree(smartMarkNode.id, (tree) =>
        sendResponse({
            ok: true,
            bookmarks: tree
        })
    );
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request.action)
    try {
        switch (request.action) {
            case "get-bookmarks":
                getBookmarks(sendResponse)
                break
            case "save-bookmark":
                saveBookmark(request.title, request.url).then(sendResponse)
                break
        }
    } catch (e) {
        console.error(e)
    }
});

async function saveBookmark(title: string, url: string) {
    let folder = await createFolder(url);

    chrome.bookmarks.create({
            'parentId': folder.id,
            'title': title,
            'url': url
        },
        function (newBookmark) {
            updateSmartMarkNode()
            console.log("Saved bookmark: ", newBookmark);
        },
    );
}

function createFolder(url: string) {

    let category = String(urlClassifier.getUrlCategory(url)).valueOf()

    if (smartMarkNode.children) {
        for (let child_id in smartMarkNode.children) {
            let child = smartMarkNode.children[child_id]
            if (child.title === category) {
                return Promise.resolve(child)
            }
        }
    }

    return chrome.bookmarks.create({
        'parentId': smartMarkNode.id,
        'title': category
    })
}