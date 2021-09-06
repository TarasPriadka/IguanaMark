import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import BookmarkChangeInfo = chrome.bookmarks.BookmarkChangeInfo;

const BOOKMARK_FOLDER_TITLE = 'SmartMark'

export class Bookmarks {
    /**
     * Container for all interactions with the bookmarks
     * Completely encapsulates the chrome.bookmarks api
     */

    private bookmarkMap: Record<string, Object[]> = {}
    private folderTree: Object | undefined = {}

    private rootNode!: BookmarkTreeNode

    constructor() {
        this.syncWithChrome()

        // TODO: optimize to not reconstruct all data structures every time
        chrome.bookmarks.onChanged.addListener(() => {
            this.syncWithChrome()
        })
        chrome.bookmarks.onMoved.addListener(() => {
            this.syncWithChrome()
        })
        chrome.bookmarks.onCreated.addListener((id, bookmark) => {
            this.syncWithChrome()
        })
        chrome.bookmarks.onRemoved.addListener(() => {
            this.syncWithChrome()
        })
        chrome.bookmarks.onImportEnded.addListener(() => {
            this.syncWithChrome()
        })
        // chrome.bookmarks.onChildrenReordered.addListener(() => {
        // })
    }

    /* Bookmark-level API */

    // Save new or update existing bookmark title and location
    async saveBookmark(url: string, title: string, folderName: string[]) {
        let folder = await this.createFolder(folderName);

        if (url in this.bookmarkMap) { // bookmark exists, update title and folder
            // @ts-ignore complains about the ['id']
            const renamedBookmark = await chrome.bookmarks.update(this.bookmarkMap[url][0]['id'],
                {'title': title},
            );
            const finalBookmark = await chrome.bookmarks.move(renamedBookmark.id,
                {'parentId': folder.id},
            )
            this.syncWithChrome()
            console.log("Saved bookmark: ", finalBookmark);
        } else { // new bookmark : create
            chrome.bookmarks.create({
                    'parentId': folder.id,
                    'title': title,
                    'url': url
                },
                (newBookmark: BookmarkTreeNode) => {
                    this.syncWithChrome()
                    console.log("Saved bookmark: ", newBookmark);
                },
            );
        }
    }

    // Update name for bookmark
    renameBookmark(url: string, title: string) {
        // @ts-ignore
        chrome.bookmarks.update(this.bookmarkMap[url][0]['id'],
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
    async moveBookmark(url: string, folderName: string[]) {
        let folder = await this.createFolder(folderName);
        // @ts-ignore
        chrome.bookmarks.move(this.bookmarkMap[url][0]['id'],
            {'parentId': folder.id},
            (newBookmark) => {
                this.syncWithChrome()
                console.log("Saved bookmark: ", newBookmark);
            },
        );
    }

    // Check if bookmark exists
    bookmarkExists(url: string) {
        return url in this.bookmarkMap
    }

    // Get bookmark by url. undefined if url not bookmarked
    getBookmark(url: string) {
        return this.bookmarkMap[url][0]
    }

    // Remove bookmark by url
    removeBookmark(url: string) {
        if (this.bookmarkExists(url)) {
            this.bookmarkMap[url].forEach(bookmark => {
                // @ts-ignore
                chrome.bookmarks.remove(bookmark['id'])
            })
            this.syncWithChrome()
        }
    }

    // Find best matching bookmarks by query string
    async findBookmarks(query: string) {
        return (await chrome.bookmarks.search(query)).filter(a => {
            !a.url
        })
    }

    /* Folder-level API */

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
    async createFolder(folderName: string[]) {

        let root = this.rootNode
        console.log("root", root)
        for (const folderLevel of folderName) {
            root = await this.createFolderShallow(root, folderLevel)
        }
        return root
    }

    // Get all bookmarks in folder
    getBookmarks(folderName: string[]): string[] {
        let folder: Object | undefined = this.folderTree
        for (const folderLevel of folderName) {
            if (folder == undefined)
                return []
            // @ts-ignore
            folder = folder[folderLevel]
        }
        if (folder == undefined)
            return []
        return Object.entries(folder)
            .filter(entry => entry[1] == undefined)
            .map(entry => entry[0])
    }

    // Get all subfolders in folder
    getSubfolders(folderName: string[]) {
        let folder: Object | undefined = this.folderTree
        for (const folderLevel of folderName) {
            if (folder == undefined)
                return []
            // @ts-ignore
            folder = folder[folderLevel]
        }
        if (folder == undefined)
            return []
        return Object.entries(folder)
            .filter(entry => entry[1] != undefined)
            .map(entry => entry[0])
    }

    // Find best matching folders by query string
    async findFolders(query: string) {
        return (await chrome.bookmarks.search(query)).filter(a => {
            !a.url
        })
    }

    // Delete a whole folder, or a bookmark by name
    deleteFolder(folder: string[]) {
        // TODO implement
    }

    /* Helpers */

    async updateSmartMarkNode() {
        let tree = await chrome.bookmarks.getTree()
        let folderPresent: boolean = false

        tree[0].children![0].children!.forEach(element => {
            if (element.title === BOOKMARK_FOLDER_TITLE) {
                folderPresent = true;
                this.rootNode = element;
            }
        });
        if (!folderPresent) {
            console.log("Didn't find bookmark folder. Creating one now...");
            this.rootNode = await chrome.bookmarks.create({
                'parentId': "1",
                'title': BOOKMARK_FOLDER_TITLE
            })
        }
    }

    visitSubtree(
        tree: BookmarkTreeNode,
        leafCallback: (a: BookmarkTreeNode) => any
    ) {
        if (tree.children) {
            tree.children.forEach(subtree => this.visitSubtree(subtree, leafCallback))
        } else {
            leafCallback(tree)
        }
    }

    updateURLMap() {
        this.bookmarkMap = {}
        this.visitSubtree(this.rootNode, leaf => {
            if (!((leaf.url!) in this.bookmarkMap))
                this.bookmarkMap[leaf.url!] = []
            this.bookmarkMap[leaf.url!].push(leaf) // TODO change leaf to custom object
        })
    }

    updateFolderTreeHelper(root: BookmarkTreeNode): Object | undefined {
        let folders: Record<string, Object | undefined> = {}
        if (root.children) {
            root.children.forEach(subtree => {
                folders[subtree.title] = this.updateFolderTreeHelper(subtree)
            })
            return folders
        } else {
            return undefined
        }
    }

    updateFolderTree() {
        this.folderTree = this.updateFolderTreeHelper(this.rootNode)
    }

    /**
     * Syncs local bookmark data structures with the chrome bookmarks api
     * @private
     */
    private async syncWithChrome() {
        await this.updateSmartMarkNode()
        this.updateURLMap()
        this.updateFolderTree()
    }

}