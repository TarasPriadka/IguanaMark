// background.js

// *----*----*----* Globals *----*----*----*
//global to store smartMarkNode
smartMarkNode = null
urlClassifier = null

try {
    importScripts("/libs/urlCategorizer.js")
} catch (e) {
    console.log(e)
}

// *----*----*----* On-Install Script *----*----*----*
chrome.runtime.onInstalled.addListener(() => {
    const url = chrome.runtime.getURL('/data/urlClasses.json');
    fetch(url)
        .then((response) => response.json()) //assuming file contains json
        .then((urlMap) => {
            urlClassifier = new UrlCategorizer(urlMap);
        });

    chrome.bookmarks.getTree((tree) => {
        folderPresent = false
        tree[0].children[0].children.forEach(element => {
            if (element.title == 'SmartMark bookmarks') {
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
    })
});


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request.action)
    if (request.action === "get-bookmarks") {
        bookmarkTree = null
        chrome.bookmarks.getSubTree(smartMarkNode.id, (tree) =>
            sendResponse({
                ok: true,
                bookmarks: tree
            })
        );
    }
    return true;
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "save-bookmark") {
        saveBookmark(request.title, request.url)
    }
    return true;
});

function saveBookmark(title, url) {
    createFolder(url).then(
        (folder) => {
            chrome.bookmarks.create({
                    'parentId': folder.id,
                    'title': title,
                    'url': url
                },
                function (newBookmark) {
                    console.log("Saved bookmark: ", newBookmark);

                },
            );
        }
    )
}

function createFolder(url) {
    return chrome.bookmarks.create({
        'parentId': smartMarkNode.id,
        'title': urlClassifier.getUrlCategory(url)
    });
}