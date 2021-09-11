import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import BookmarkChangeInfo = chrome.bookmarks.BookmarkChangeInfo;

const BOOKMARK_FOLDER_TITLE = 'SmartMark'

/**
 * Container for all interactions with the bookmarks
 * Completely encapsulates the chrome.bookmarks api
 */
export class Bookmarks {

    private bookmarkMap: Map<string, BookmarkTreeNode[]> = new Map<string, BookmarkTreeNode[]>()
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
        chrome.bookmarks.onCreated.addListener(() => {
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

    /**
     * Save new or update existing bookmark title and location
     *
     * @param url
     * @param title
     * @param folderName
     * @param parentId
     */
    async saveBookmark(url: string, title: string, folderName: string[], parentId?: string) {
        if (!parentId) {
            parentId = (await this.createFolder(folderName)).id;
        }
        let bookmarks = this.bookmarkMap.get(url)
        if (bookmarks) {
            const renamedBookmark = await chrome.bookmarks.update(
                bookmarks[0].id,
                {'title': title},
            );
            const finalBookmark = await chrome.bookmarks.move(renamedBookmark.id,
                {'parentId': parentId},
            )
            this.syncWithChrome()
            console.log("Saved bookmark: ", finalBookmark);
        } else { // new bookmark : create
            chrome.bookmarks.create({
                    'parentId': parentId,
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

    /**
     * Update name for bookmark
     *
     * @param url
     * @param title
     */
    renameBookmark(url: string, title: string) {
        let bookmarks = this.bookmarkMap.get(url)
        if (bookmarks) {
            chrome.bookmarks.update(bookmarks[0]['id'],
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
    }

    /**
     * Move bookmark to new folder
     *
     * @param url
     * @param folderName
     */
    async moveBookmark(url: string, folderName: string[]) {
        let folder = await this.createFolder(folderName);
        let bookmarks = this.bookmarkMap.get(url)
        if (bookmarks) {
            chrome.bookmarks.move(bookmarks[0]['id'],
                {'parentId': folder.id},
                (newBookmark) => {
                    this.syncWithChrome()
                    console.log("Saved bookmark: ", newBookmark);
                },
            );
        }
    }

    /**
     * Check if bookmark exists
     *
     * @param url
     */
    bookmarkExists(url: string) {
        return this.bookmarkMap.has(url)
    }

    /**
     * Get first bookmark by url. undefined if url not bookmarked
     *
     * @param url
     */
    getBookmark(url: string) {
        let bookmarks = this.bookmarkMap.get(url)
        if (bookmarks)
            return bookmarks[0]
        return undefined
    }

    /**
     * Returns all bookmarked URLs
     * @return urls all bookmark urls.
     */
    getAllBookmarkURLs(): string[] {
        return Array.from(this.bookmarkMap.keys());
    }

    /**
     * Remove bookmark by url
     *
     * @param url
     */
    removeBookmark(url: string) {
        let bookmarks = this.bookmarkMap.get(url)
        if (bookmarks) {
            bookmarks.forEach(bookmark => {
                chrome.bookmarks.remove(bookmark.id)
            })
            this.syncWithChrome()
        }
    }

    /**
     * Find best matching bookmarks by query string
     *
     * @param query
     */
    async findBookmarks(query: string) {
        return (await chrome.bookmarks.search(query)).filter(a => {
            !a.url
        })
    }

    /* Folder-level API */

    /**
     * Creates a single subfolder
     *
     * @param root
     * @param folder
     * @private
     */
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

    /**
     * Ensure the folder exists. Creates folders and parent of arbitrary depth
     *
     * @param folderName
     */
    async createFolder(folderName: string[]) {

        let root = this.rootNode
        console.log("root", root)
        for (const folderLevel of folderName) {
            root = await this.createFolderShallow(root, folderLevel)
        }
        return root
    }

    /**
     * Get all bookmarks in folder
     *
     * @param folderName
     */
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

    /**
     * Get all subfolders in folder
     *
     * @param folderName
     */
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

    /**
     * Find best matching folders by query string
     *
     * @param query
     */
    async findFolders(query: string) {
        return (await chrome.bookmarks.search(query)).filter(a => {
            !a.url
        })
    }

    /**
     * Delete a whole folder, or a bookmark by name
     *
     * @param folder
     */
    deleteFolder(folder: string[]) {
        // TODO implement
    }

    /* Helpers */

    /**
     * Updatees the main root node
     */
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

    /**
     * Sorta like a general in-order traversal I think
     *
     * @param tree
     * @param leafCallback
     */
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

    /**
     * Updates the URL to bookmark object map
     */
    updateURLMap() {
        this.bookmarkMap = new Map<string, chrome.bookmarks.BookmarkTreeNode[]>()
        this.visitSubtree(this.rootNode, leaf => {
            if (!((leaf.url!) in this.bookmarkMap))
                this.bookmarkMap.set(leaf.url!, [])
            this.bookmarkMap.get(leaf.url!)!.push(leaf) // TODO change leaf to custom object
        })
    }

    /**
     * Recursive helper that updates the folder tree structure
     *
     * @param root
     */
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

    /**
     * Updates the folder tree structure
     */
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