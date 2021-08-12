// background.js

//global to store smartMarkNode
smartMarkNode = null

chrome.runtime.onInstalled.addListener(() => {
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
        chrome.bookmarks.getTree((tree) =>
            sendResponse({
                ok: true,
                bookmarks: tree
            })
        );

    }
    console.log("Got here.")
    return true;
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "save-bookmark") {
        chrome.bookmarks.create({
                'parentId': bookmarkBar.id,
                'title': 'Extension bookmarks'
            },
            function (newFolder) {
                console.log("added folder: " + newFolder.title);
            },
        );

    }
    console.log("Got here.")
    return true;
});