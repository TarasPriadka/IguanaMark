import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import BookmarkChangeInfo = chrome.bookmarks.BookmarkChangeInfo;

enum FindType {
    STRING_SEARCH
}

const BOOKMARK_FOLDER_TITLE = 'SmartMark'

export class Bookmarks {
    /**
     * Container for all interactions with the bookmarks
     * Completely encapsulates the chrome.bookmarks api
     */

    /**
     * node managing SmartMark folder
     * {
     *     url: {
     *         chrome_id: string
     *         url: string
     *         name: string
     *         description: string
     *         location: string
     *         dateCreated: number (in ms)
     *         lastModified: number (in ms)
     *         lastAccessed: number (in ms)
     *     }
     * }
     */
    private bookmarkMap: Record<string, object> = {}

    private rootNode!: BookmarkTreeNode

    private findType: FindType

    constructor(findType = FindType.STRING_SEARCH) {
        this.findType = findType

        this.updateSmartMarkNode()

    }

    /**********************/
    /* Bookmark-level API */
    /**********************/

    // Save new or update existing bookmark title and location
    async saveBookmark(url: string, title: string, folderName: string[]) {
        let folder = await this.createFolder(folderName);

        if (url in this.bookmarkMap) {
            // @ts-ignore complains about the ['id']
            const renamedBookmark = await chrome.bookmarks.update(this.bookmarkMap[url]['id'],
                {
                    'title': title,
                },
            );
            // @ts-ignore
            const finalBookmark = await chrome.bookmarks.move(renamedBookmark.id,
                {
                    'parentId': folder.id,
                },
            )
            this.syncWithChrome()
            console.log("Saved bookmark: ", finalBookmark);
        } else {
            chrome.bookmarks.create({
                    'parentId': folder.id,
                    'title': title,
                    'url': url
                },
                (newBookmark) => {
                    this.syncWithChrome()
                    console.log("Saved bookmark: ", newBookmark);
                },
            );
        }
    }

    // Update name for bookmark
    renameBookmark(url: string, title: string) {
        // @ts-ignore
        chrome.bookmarks.update(this.bookmarkMap[url]['id'],
            {
                'title': title,
                'url': url
            },
            (newBookmark) => {
                this.syncWithChrome()
                console.log("Saved bookmark: ", newBookmark);
            },
        );
    }

    // Move bookmark to new folder
    moveBookmark(url: string, folder: string) {
        // TODO
        // chrome.bookmarks.move(this.bookmarkMap[url].id, )
    }

    // TODO: Decide whether we need this is a good way to do this
    // update the lastAccess date on the bookmark
    // accessBookmark(url: string, date: number = -1) {
    // }

    // Check if bookmark exists
    bookmarkExists(url: string) {
        return url in this.bookmarkMap
    }

    // Get bookmark by id (url) or check if it exists (is null)
    getBookmark(url: string) {
        return this.bookmarkMap[url]
    }

    // Delete bookmark by url
    deleteBookmark(url: string) {
    }

    // Find best matching bookmarks by query string
    findBookmarks(query: string, method: FindType = FindType.STRING_SEARCH) {
    }

    /********************/
    /* Folder-level API */

    /********************/

    private createFolderShallow(root: BookmarkTreeNode, folder: string): Promise<BookmarkTreeNode> {
        // if (!root.children) throw new SomeException()

        for (const child of root.children!) {
            if (child.title === folder)
                return Promise.resolve(child)
        }

        return chrome.bookmarks.create({
            'parentId': root.id,
            'title': folder,
        })
    }

    // Ensure the folder exists
    async createFolder(folder: string[]) {

        let root = this.rootNode
        console.log("root", root)
        for (const folderLevel of folder) {
            root = await this.createFolderShallow(root, folderLevel)
        }
        return root
    }

    // Check if bookmark exists
    folderExists(folder: string[]): boolean {
        return false;
    }

    // Get all bookmarks in folder
    getBookmarks(folder: string[]) {
    }

    // Get all subfolders in folder
    getSubfolders(folder: string[]) {
    }

    // Find best matching folders by query string
    findFolders(query: string, method: FindType = FindType.STRING_SEARCH) {
    }

    // Delete a whole folder, or a bookmark by name
    deleteFolder(folder: string[]) {
    }

    /***********/
    /* Helpers */

    /***********/

    updateSmartMarkNode() {
        chrome.bookmarks.getTree(tree => {
            let folderPresent: boolean = false

            tree[0].children![0].children!.forEach(element => {
                if (element.title === BOOKMARK_FOLDER_TITLE) {
                    folderPresent = true;
                    this.rootNode = element;
                }
            });
            if (!folderPresent) {
                console.log("Didn't find bookmark folder. Creating one now...");
                chrome.bookmarks.create({
                        'parentId': "1",
                        'title': BOOKMARK_FOLDER_TITLE
                    },
                    newFolder => this.rootNode = newFolder
                )
            }
        })
    }

    visitSubtree(tree: BookmarkTreeNode, leafCallback: (a: BookmarkTreeNode) => any) {
        if (tree.children)
            tree.children.forEach(subtree => this.visitSubtree(subtree, leafCallback))
        else
            leafCallback(tree)
    }

    updateHashMap() {
        this.bookmarkMap = {}
        this.visitSubtree(this.rootNode, (leaf: BookmarkTreeNode) => {
            this.bookmarkMap[leaf.url!] = leaf // TODO change to custom object
        })
    }

    /**
     * Syncs local bookmark data structres with the chrome bookmarks api
     * @private
     */
    private syncWithChrome() {
        this.updateSmartMarkNode()
        this.updateHashMap()
    }

}

// TODO
chrome.bookmarks.onChanged.addListener((id: string, changeInfo: BookmarkChangeInfo) => {
    console.log('changeInfo')
    console.log(id)
    console.log(changeInfo)
})