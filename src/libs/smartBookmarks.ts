import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import {SmartBookmarkCreatedEvent, SmartBookmarkRemovedEvent} from "./smartEvent";
import {
    SmartCreateInfo,
    SmartMoveInfo,
    SmartBookmark,
    SmartBookmarkNode,
    SmartFolder,
    SmartUpdateInfo, SmartRemoveInfo
} from "./smartBookmark";
import onChildrenReordered = chrome.bookmarks.onChildrenReordered;

const BOOKMARK_FOLDER_TITLE = 'SmartMark'

/**
 * Container for all interactions with the bookmarks
 * Completely encapsulates the chrome.bookmarks api
 */
export class SmartBookmarks {

    /**
     * Maps URL to bookmarks (no folders).
     * @private
     */
    private bookmarkURLMap: Map<string, SmartBookmark[]> = new Map()

    /**
     * Maps id (corresponding to chrome bookmark ids) to bookmark nodes.
     * @private
     */
    private nodeIDMap: Map<string, SmartBookmarkNode> = new Map()

    /**
     * SmartMark root folder for the bookmark tree
     * @private
     */
    private rootNode!: SmartFolder
    private chromeRoot!: BookmarkTreeNode

    /**
     * Events for managing callbacks when bookmarks are created, modified, or removed
     * @private
     */
    private onRemoved: SmartBookmarkRemovedEvent = new SmartBookmarkRemovedEvent();
    public onCreated: SmartBookmarkCreatedEvent = new SmartBookmarkCreatedEvent();

    constructor() {
        this.syncWithChrome()
        this.addEventListeners()
    }

    private addEventListeners() {
        chrome.bookmarks.onChanged.addListener((id, changeInfo) => {
            if (this.nodeIDMap.has(id)) {
                let bookmark = this.nodeIDMap.get(id)!
                let parent = this.nodeIDMap.get(bookmark.parentId)!
                let sameURLBookmarks = this.bookmarkURLMap.get(bookmark.url)!
                sameURLBookmarks.splice(sameURLBookmarks.indexOf(bookmark), 1)
                parent.removeChild(bookmark)

                if (!bookmark.isFolder)
                    bookmark.url = changeInfo.url!
                bookmark.title = changeInfo.title

                if (this.bookmarkURLMap.has(bookmark.url)) {
                    this.bookmarkURLMap.get(bookmark.url)!.push(bookmark)
                } else {
                    this.bookmarkURLMap.set(bookmark.url, [bookmark])
                }

                parent.addChild(bookmark)
            }
        })
        chrome.bookmarks.onMoved.addListener((id, moveInfo) => {
            // TODO Test with move()
            let oldHas = this.nodeIDMap.has(moveInfo.oldParentId)
            let nowHas = this.nodeIDMap.has(moveInfo.parentId)
            if (oldHas && nowHas) {
                // internal move, need to update datastructures
                let bookmark = this.nodeIDMap.get(id)!
                this.nodeIDMap.get(moveInfo.oldParentId)!.removeChild(bookmark)
                this.nodeIDMap.get(moveInfo.parentId)!.addChild(bookmark)
                bookmark.parentId = moveInfo.parentId
            } else if (oldHas && !nowHas) {
                // move out, remove
                this.removeFromAllDatastructures(this.nodeIDMap.get(id)!)
            } else if (!oldHas && nowHas) {
                // move in, create
                chrome.bookmarks.get(id).then(chromeBookmarks => {
                    this.saveToAllDatastructures(SmartBookmarkNode.fromChrome(chromeBookmarks[0]))
                })
            } else {
                // external move, ignore
                return
            }
        })
        chrome.bookmarks.onCreated.addListener((id, bookmark) => {
            if (!this.nodeIDMap.has(id) && this.nodeIDMap.has(bookmark.parentId!))
                this.saveToAllDatastructures(SmartBookmarkNode.fromChrome(bookmark))
        })
        chrome.bookmarks.onRemoved.addListener((id, removeInfo) => {
            if (this.nodeIDMap.has(id))
                this.removeFromAllDatastructures(this.nodeIDMap.get(id)!)
        })
        chrome.bookmarks.onImportEnded.addListener(() => {
            this.syncWithChrome()
        })
        // chrome.bookmarks.onChildrenReordered.addListener(() => {
        // })
    }

    /* Create */

    /**
     * Create a bookmark or folder.
     * Should we add duplicate URL checking here?
     *
     * @param createInfo info about the new bookmark.
     */
    create(createInfo: SmartCreateInfo) {
        chrome.bookmarks.create(createInfo).then(() => {
        })
    }

    /**
     * Create bookmark or folder in another folder.
     *
     * @param createInfo
     * @param folder
     */
    async createInFolder(createInfo: SmartCreateInfo, path: Array<string>) {
        let folder = await this.createFolder(path)
        createInfo.parentId = folder.id
        this.create(createInfo)
    }

    /* Read */

    /**
     * Gets all bookmarks and folders in some folder (specficied by id or SmartFolder). Returns ALL bookmarks and
     * folders if parent is undefined.
     *
     * @param parent Optional. Specify Id or SmartFolder to return bookmarks from a specific subdirectory.
     * @returns nodes Array of SmartBookmarkNodes in the parent.
     */
    getAll(parent: string | SmartFolder | undefined = undefined): Array<SmartBookmarkNode> {
        if (parent == undefined) {
            return Array.from(this.nodeIDMap.values())
        }
        if (typeof parent === "string") {
            if (parent == '') {
                return this.rootNode.children
            } else if (this.nodeIDMap.has(parent)) {
                return this.nodeIDMap.get(parent)!.children
            }
            return []
        }
        if (parent instanceof SmartFolder) {
            return parent.children
        }
        return []
    }

    /**
     * Like getAll but only returns the bookmarks.
     *
     * @param parent parent id or node
     * @returns bookmarks Array of SmartBookmarks
     */
    getAllBookmarks(parent: string | SmartFolder | undefined = undefined): Array<SmartBookmark> {
        return this.getAll(parent).filter(b => !b.isFolder)
    }

    /**
     * Like getAll but only returns the folders.
     *
     * @param parent parent id or node
     * @returns folders Array of SmartBookmarks
     */
    getAllFolders(parent: string | SmartFolder | undefined = undefined): Array<SmartBookmark> {
        return this.getAll(parent).filter(b => b.isFolder)
    }

    /**
     * Returns a node by id
     *
     * @param id browser-generated bookmark/folder id
     */
    getById(id: string): SmartBookmarkNode | undefined {
        return this.nodeIDMap.get(id)
    }

    /**
     * Returns all bookmarks matching a given URL. Returns an array because
     * duplicates are possible in cases where a user manually adds a bookmark
     * with a URL that already exists.
     *
     * @param url URL of bookmarks to return
     * @returns array of SmartBookmarks
     */
    getByURL(url: string): Array<SmartBookmark> {
        if (this.bookmarkURLMap.has(url))
            return this.bookmarkURLMap.get(url)!
        return []
    }

    // should this be just find since titles aren't unique?
    // getByTitle(title: string) => SmartBookmark

    getByPath(path: Array<string>): SmartBookmarkNode | undefined {
        let node = this.rootNode
        for (const level of path) {
            if (!node.childrenTitleMap.has(level))
                return undefined
            // TODO select a folder if possible instead of just the zeroth element
            node = node.childrenTitleMap.get(level)![0]
        }
        return node
    }

    /**
     * Gets folder name for a given bookmark's parent folder.
     * @param bookmark bookmark or folder.
     * @return folderName in array form
     */
    getFolderName(bookmark: SmartBookmarkNode): string[] {
        let folderName = [];
        let curNode: SmartBookmarkNode | undefined = bookmark
        while (curNode != undefined) {
            folderName.unshift(curNode.title)
            curNode = this.nodeIDMap.get(curNode.parentId)
        }
        folderName.pop()
        return folderName
    }

    private async createFolderShallow(parent: SmartFolder, title: string): Promise<SmartFolder> {
        let chromeFolder = await chrome.bookmarks.create({
            parentId: parent.id,
            title: title
        })
        let folder = SmartBookmarkNode.fromChrome(chromeFolder)
        this.saveToAllDatastructures(folder)
        return folder
    }

    async createFolder(path: Array<string>): Promise<SmartFolder> {
        let node: SmartBookmarkNode = this.rootNode
        for (const level of path) {
            if (!node.childrenTitleMap.has(level)) {
                console.log('node before', node, level)
                node = await this.createFolderShallow(node, level)
                console.log('node', node)
            } else {
                // TODO select a folder if possible instead of just the zeroth matching element
                node = node.childrenTitleMap.get(level)![0]
            }
        }
        return node
    }

    // Update
    // id, isFolder, and children need to be constant, UpdateInfo interface?
    update(updateInfo: SmartUpdateInfo) {
        if (!this.nodeIDMap.has(updateInfo.id))
            return

        let bookmark = this.nodeIDMap.get(updateInfo.id)!

        if (bookmark.isFolder) {
            chrome.bookmarks.update(updateInfo.id, {
                title: updateInfo.title || bookmark.title
            })
        } else {
            chrome.bookmarks.update(updateInfo.id, {
                url: updateInfo.url || bookmark.url,
                title: updateInfo.title || bookmark.title
            })
        }
        /**
         *  if there are other fields that need to be updated in the future,
         *  they only need to be updated here directly in the bookmark object.
         *  Chrome only stores and allows updates of url and title.
         */
    }

    move(moveInfo: SmartMoveInfo) {
        if (!this.nodeIDMap.has(moveInfo.id))
            return

        let bookmark = this.nodeIDMap.get(moveInfo.id)!
        if (bookmark.parentId == moveInfo.parentId)
            return

        if (moveInfo.parentId == '' || moveInfo.parentId == undefined) {
            chrome.bookmarks.move(moveInfo.id, {
                parentId: this.rootNode.id
            });
            return
        }

        if (!this.nodeIDMap.has(moveInfo.parentId))
            return

        // oldParent.removeChild(bookmark)
        // newParent.addChild(bookmark)
        // bookmark.parentId = updateInfo.parentId
        chrome.bookmarks.move(moveInfo.id, {
            parentId: moveInfo.parentId,
        })
    }

    /* Remove */

    /**
     * Remove a bookmark or folder.
     *
     * @param removeInfo
     */
    remove(removeInfo: SmartRemoveInfo) {
        if (!this.nodeIDMap.has(removeInfo.id))
            return

        this.removeFromAllDatastructures(this.nodeIDMap.get(removeInfo.id)!)
        chrome.bookmarks.removeTree(removeInfo.id).then()
    }

    /**
     * Remove several bookmarks or folders.
     *
     * @param removeInfos
     */
    removeAll(removeInfos: Array<SmartRemoveInfo>) {
        for (const removeInfo of removeInfos) {
            this.remove(removeInfo)
        }
    }

    /* Helpers */

    private saveToAllDatastructures(bookmark: SmartBookmarkNode) {
        if (this.nodeIDMap.has(bookmark.id))
            return

        if (!bookmark.isFolder) {
            this.onCreated.trigger(bookmark.url)
            if (this.bookmarkURLMap.has(bookmark.url))
                this.bookmarkURLMap.get(bookmark.url)!.push(bookmark)
            else
                this.bookmarkURLMap.set(bookmark.url, [bookmark]);
        }

        this.nodeIDMap.set(bookmark.id, bookmark)

        this.nodeIDMap.get(bookmark.parentId)?.addChild(bookmark)
    }

    private removeFromAllDatastructures(bookmark: SmartBookmarkNode) {
        if (bookmark.isFolder) {
            for (let i = bookmark.children.length - 1; i >= 0; i--) {
                this.removeFromAllDatastructures(bookmark.children[i])
            }
        } else {
            this.onRemoved.trigger(bookmark.url)
            let sameURLbookmarks = this.bookmarkURLMap.get(bookmark.url)!;
            sameURLbookmarks.splice(sameURLbookmarks.indexOf(bookmark), 1)
        }

        this.nodeIDMap.delete(bookmark.id)

        this.nodeIDMap.get(bookmark.parentId)?.removeChild(bookmark)
    }

    /**
     * Updates the main chrome root node
     */
    private async updateChromeRootNode() {
        let tree = await chrome.bookmarks.getTree()
        let folderPresent: boolean = false

        tree[0].children![0].children!.forEach(element => {
            if (element.title === BOOKMARK_FOLDER_TITLE) {
                folderPresent = true;
                this.chromeRoot = element
            }
        });
        if (!folderPresent) {
            console.log("Didn't find bookmark folder. Creating one now...");
            this.chromeRoot = await chrome.bookmarks.create({
                'parentId': "1",
                'title': BOOKMARK_FOLDER_TITLE
            })
        }
    }

    /**
     * Recursive helper that updates the folder tree structure
     *
     * @param root
     * @returns root new root node (can be folder or bookmark)
     * @private
     */
    private traverseChromeTree(root: BookmarkTreeNode): SmartBookmarkNode {
        if (root.children) { // root is folder
            let folder = new SmartFolder(
                root.id,
                root.parentId!,
                root.title,
            )

            this.nodeIDMap.set(folder.id, folder)

            root.children.forEach(subtree => {
                folder.addChild(this.traverseChromeTree(subtree))
            })
            return folder
        } else { // root is bookmark
            let bookmark = new SmartBookmark(
                root.id,
                root.parentId!,
                root.url!,
                root.title
            )

            if (this.bookmarkURLMap.has(bookmark.url))
                this.bookmarkURLMap.get(bookmark.url)!.push(bookmark)
            else
                this.bookmarkURLMap.set(bookmark.url, [bookmark])

            this.nodeIDMap.set(bookmark.id, bookmark)

            return bookmark
        }
    }

    /**
     * Updates the folder tree structure
     * @private
     */
    private updateStructs() {
        this.bookmarkURLMap = new Map()
        this.nodeIDMap = new Map()
        this.rootNode = this.traverseChromeTree(this.chromeRoot)
    }

    /**
     * Syncs local bookmark data structures with the chrome bookmarks api
     * @private
     */
    private async syncWithChrome() {
        await this.updateChromeRootNode()
        this.updateStructs()
    }

}
