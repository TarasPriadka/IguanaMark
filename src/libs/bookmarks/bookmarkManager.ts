import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import {SmartBookmarkCreatedEvent, SmartBookmarkRemovedEvent} from "./smartEvent";
import {
    SmartBookmark,
    SmartBookmarkNode,
    SmartCreateInfo,
    SmartFolder,
    SmartMoveInfo,
    SmartRemoveInfo,
    SmartUpdateInfo
} from "./smartBookmark";
// import onChildrenReordered = chrome.bookmarks.onChildrenReordered;

const BOOKMARK_FOLDER_TITLE = 'SmartMark'

/**
 * Container for all interactions with the bookmarks
 * Completely encapsulates the chrome.bookmarks api
 */
export class BookmarkManager {

    /**
     * Events for managing callbacks when bookmarks are created or removed from the SmartMark folder
     */
    public onCreated: SmartBookmarkCreatedEvent = new SmartBookmarkCreatedEvent();
    public onRemoved: SmartBookmarkRemovedEvent = new SmartBookmarkRemovedEvent();

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

    constructor() {
        this.syncWithChrome()
        this.addEventListeners()
    }

    /* Create */

    /**
     * Updates the main chrome root node. Creates a SmartMark folder if it didn't exist already.
     */
    private static async getChromeRootNode(): Promise<BookmarkTreeNode> {
        let tree = await chrome.bookmarks.getTree()

        for (const element of tree[0].children![0].children!) {
            if (element.title === BOOKMARK_FOLDER_TITLE) {
                return element
            }
        }

        console.log("Didn't find bookmark folder. Creating one now...");
        return await chrome.bookmarks.create({
            'parentId': "1",
            'title': BOOKMARK_FOLDER_TITLE
        })
    }

    /**
     * Create a bookmark or folder.
     * TODO: Should we add duplicate URL checking here?
     *
     * @param createInfo info about the new bookmark.
     */
    create(createInfo: SmartCreateInfo) {
        chrome.bookmarks.create(createInfo).then()
    }

    /* Read */

    /**
     * Create bookmark or folder in another folder.
     *
     * @param createInfo info about the new bookmark. ParentId is not required.
     * @param path array of subdirectories to the destination folder: ['first', 'second', 'target']
     */
    async createInFolder(createInfo: SmartCreateInfo, path: Array<string>) {
        let folder = await this.createFolder(path)
        createInfo.parentId = folder.id
        this.create(createInfo)
    }

    /**
     * Gets all bookmarks and folders in some folder (specified by id or SmartFolder). Returns ALL bookmarks and
     * folders if parent is undefined. Includes the root (SmartMark) folder.
     *
     * @param parent Optional. Specify Id or SmartFolder to return bookmarks from a specific subdirectory.
     * @returns nodes Array of SmartBookmarkNodes in the parent.
     */
    getAll(parent: string | SmartFolder | undefined = undefined): Array<SmartBookmarkNode> {
        if (parent == undefined) {
            return Array.from(this.nodeIDMap.values())
        } else if (typeof parent === "string") {
            if (parent == '') {
                return this.rootNode.children
            } else if (this.nodeIDMap.has(parent)) {
                return (this.nodeIDMap.get(parent) as SmartFolder)!.children
            }
            return []
        } else {
            return parent.children
        }
    }

    /**
     * Like getAll but only returns the bookmarks.
     *
     * @param parent parent id or node
     * @returns bookmarks Array of SmartBookmarks
     */
    getAllBookmarks(parent: string | SmartFolder | undefined = undefined): Array<SmartBookmark> {
        return this.getAll(parent).filter(b => !b.isFolder) as Array<SmartBookmark>
    }

    /**
     * Like getAll but only returns the folders. Includes the root (SmartMark) folder.
     *
     * @param parent parent id or node
     * @returns folders Array of SmartFolders
     */
    getAllFolders(parent: string | SmartFolder | undefined = undefined): Array<SmartFolder> {
        return this.getAll(parent).filter(f => f.isFolder) as Array<SmartFolder>
    }

    /**
     * Returns the SmartMark root folder
     * @returns root root node
     */
    getRoot(): SmartFolder {
        return this.rootNode
    }

    /**
     * Returns a node by id
     *
     * @param id browser-generated bookmark/folder id
     */
    getById(id: string): SmartBookmarkNode | undefined {
        return this.nodeIDMap.get(id)
    }

    // TODO should we have getByTitle() or just have find() since titles aren't unique and there's also getByPath()?

    /**
     * Returns all bookmarks with a given URL. Returns an array because
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

    /**
     * Gets a folder or bookmark by path. undefined if not found. Do not include root (SmartMark) in the path.
     *
     * @param path path to target in the form: ['first', 'second', 'folder or bookmark']
     * @returns node Node at the given path
     */
    getByPath(path: Array<string>): SmartBookmarkNode | undefined {
        let node: SmartFolder = this.rootNode
        for (let pathLevel = 0; pathLevel < path.length; pathLevel++) {
            const level = path[pathLevel]
            if (!node.childrenTitleMap.has(level) || node.childrenTitleMap.get(level)!.length == 0)
                return undefined
            // select a folder if possible instead of just the zeroth element, which could be a bookmark
            let subfolders = node.childrenTitleMap.get(level)?.filter(f => f.isFolder)
            if (subfolders && subfolders.length > 0) {
                node = subfolders[0] as SmartFolder
            } else if (pathLevel == path.length - 1) {
                return node.childrenTitleMap.get(level)?.[0]
            }
        }
        return node
    }

    /**
     * Gets folder path for a given bookmark's parent folder. Includes the root in the path.
     *
     * @param bookmark bookmark or folder.
     * @return folderName path in array form
     */
    getFolderPath(bookmark: SmartBookmarkNode): Array<string> {
        let folderName = [];
        let curNode: SmartBookmarkNode | undefined = bookmark
        while (curNode != undefined) {
            folderName.unshift(curNode.title)
            curNode = this.nodeIDMap.get(curNode.parentId)
        }
        folderName.pop()
        return folderName
    }

    /**
     * Creates or ensures creation of an arbitrary depth folder. Returns the folder after it is created.
     *
     * @param path where to create the folder
     * @returns folder the created folder
     */
    async createFolder(path: Array<string>): Promise<SmartFolder> {
        let node: SmartFolder = this.rootNode
        for (let pathLevel = 0; pathLevel < path.length; pathLevel++) {
            const levelName = path[pathLevel]
            let validSubfolders = node.childrenTitleMap.get(levelName)?.filter(f => f.isFolder)
            if (validSubfolders && validSubfolders.length > 0) {
                node = validSubfolders[0] as SmartFolder
            } else {
                node = await this.createFolderShallow(node, levelName)
            }
        }
        return node
    }

    // Update
    /**
     * Updates information (url, title, etc) for a given bookmark or folder.
     *
     * @param updateInfo what to update and in which node
     */
    update(updateInfo: SmartUpdateInfo): void {
        if (!this.nodeIDMap.has(updateInfo.id))
            return

        let bookmark = this.nodeIDMap.get(updateInfo.id)!

        if (bookmark.isFolder) {
            chrome.bookmarks.update(updateInfo.id, {
                title: updateInfo.title || bookmark.title
            })
        } else {
            chrome.bookmarks.update(updateInfo.id, {
                url: updateInfo.url || (bookmark as SmartBookmark).url,
                title: updateInfo.title || bookmark.title
            })
        }
        /**
         *  if there are other fields that need to be updated in the future,
         *  they only need to be updated here directly in the bookmark object.
         *  Chrome only stores and allows updates of url and title.
         */
    }

    /**
     * Moves a bookmark or folder.
     *
     * @param moveInfo what to move and where.
     */
    move(moveInfo: SmartMoveInfo): void {
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

        chrome.bookmarks.move(moveInfo.id, {
            parentId: moveInfo.parentId,
        })
    }

    /* Remove */

    /**
     * Remove a bookmark or folder. Syncs with chrome.
     *
     * @param removeInfo what to remove
     */
    remove(removeInfo: SmartRemoveInfo) {
        if (!this.nodeIDMap.has(removeInfo.id))
            return

        this.removeFromAllDatastructures(this.nodeIDMap.get(removeInfo.id)!)
        chrome.bookmarks.removeTree(removeInfo.id).then()
    }

    /**
     * Remove many bookmarks or folders.
     *
     * @param removeInfos what to remove
     */
    removeAll(removeInfos: Array<SmartRemoveInfo>): void {
        for (let i = removeInfos.length - 1; i >= 0; i--) {
            this.remove(removeInfos[i]);
        }
    }

    /* Helpers */

    /**
     * Syncs local bookmark data structures with the chrome bookmarks api.
     * Typically shouldn't need to be called outside of this class.
     */
    async syncWithChrome() {
        this.updateStructs(await BookmarkManager.getChromeRootNode())
    }

    /**
     * Helper for creating a single folder.
     *
     * @param parent where to create the folder
     * @param title what to name the folder
     * @returns folder created SmartFolder
     * @private
     */
    private async createFolderShallow(parent: SmartFolder, title: string): Promise<SmartFolder> {
        let chromeFolder = await chrome.bookmarks.create({
            parentId: parent.id,
            title: title
        })
        let folder = SmartFolder.fromChrome(chromeFolder)
        this.saveToAllDatastructures(folder)
        return folder
    }

    /**
     * Saves a node to all data structures.
     * Does not affect chrome. Chrome API needs to be called separately.
     *
     * @param bookmark folder/bookmark to save
     * @private
     */
    private saveToAllDatastructures(bookmark: SmartBookmarkNode): void {
        if (this.nodeIDMap.has(bookmark.id))
            return

        if (!bookmark.isFolder) {
            let _bookmark = bookmark as SmartBookmark
            this.onCreated.trigger(_bookmark.url)
            if (this.bookmarkURLMap.has(_bookmark.url))
                this.bookmarkURLMap.get(_bookmark.url)!.push(_bookmark)
            else
                this.bookmarkURLMap.set(_bookmark.url, [_bookmark]);
        }

        this.nodeIDMap.set(bookmark.id, bookmark);

        (this.nodeIDMap.get(bookmark.parentId) as SmartFolder)?.addChild(bookmark)
    }

    /**
     * Removes a node from all data structures. If folder, does it recursively.
     * Does not affect chrome. Chrome API needs to be called separately.
     *
     * @param bookmark folder/bookmark to remove
     * @private
     */
    private removeFromAllDatastructures(bookmark: SmartBookmarkNode): void {
        if (bookmark.isFolder) {
            let folder = bookmark as SmartFolder
            for (let i = folder.children.length - 1; i >= 0; i--) {
                this.removeFromAllDatastructures(folder.children[i])
            }
        } else {
            let _bookmark = bookmark as SmartBookmark
            this.onRemoved.trigger(_bookmark.url)
            let sameUrlBookmarks = this.bookmarkURLMap.get(_bookmark.url)!;
            sameUrlBookmarks.splice(sameUrlBookmarks.indexOf(_bookmark), 1)
        }

        this.nodeIDMap.delete(bookmark.id);

        (this.nodeIDMap.get(bookmark.parentId) as SmartFolder)?.removeChild(bookmark);
    }

    /**
     * Recursive helper that updates the folder tree structure to match what the browser has.
     *
     * @param chromeRoot chrome root to convert to SmartBookmarkNode
     * @returns root new root node (can be folder or bookmark)
     * @private
     */
    private traverseChromeTree(chromeRoot: BookmarkTreeNode): SmartBookmarkNode {
        if (chromeRoot.url) { // root is bookmark
            let bookmark = new SmartBookmark(
                chromeRoot.id,
                chromeRoot.parentId!,
                chromeRoot.url!,
                chromeRoot.title
            )

            this.saveToAllDatastructures(bookmark)

            return bookmark
        } else { // root is folder
            let folder = new SmartFolder(
                chromeRoot.id,
                chromeRoot.parentId!,
                chromeRoot.title,
            )

            this.saveToAllDatastructures(folder)

            chromeRoot.children?.forEach(subtree => {
                this.traverseChromeTree(subtree)
            })
            return folder
        }
    }

    /**
     * Updates the folder tree structure, wrapper for recursive traverseChromeTree
     *
     * @param chromeRoot chrome root to convert to SmartBookmarkNode
     * @private
     */
    private updateStructs(chromeRoot: BookmarkTreeNode) {
        this.bookmarkURLMap = new Map()
        this.nodeIDMap = new Map()
        this.rootNode = this.traverseChromeTree(chromeRoot) as SmartFolder
    }

    /**
     * Saves a bookmark or a populated folder in all data structures.
     * Only used when a user manually moves a bookmark/folder/populated folder into SmartMark.
     *
     * @param chromeNode Chrome node to move in.
     * @private
     */
    private savePopulatedFolder(chromeNode: BookmarkTreeNode) {
        this.saveToAllDatastructures(SmartBookmarkNode.fromChrome(chromeNode))
        console.log(chromeNode.children)
        if (chromeNode.children) {
            for (const child of chromeNode.children) {
                this.savePopulatedFolder(child)
            }
        }
    }

    /**
     * Adds event listeners to chrome's bookmark API events. These are called either when bookmarks
     * are modified from this file via chrome.bookmarks API, or when a user manually edits bookmarks.
     *
     * @private
     */
    private addEventListeners() {
        chrome.bookmarks.onChanged.addListener((id, changeInfo) => {
            if (this.nodeIDMap.has(id)) {
                let node = this.nodeIDMap.get(id)!;
                let parent = (this.nodeIDMap.get(node.parentId) as SmartFolder)!;
                parent.removeChild(node);
                if (node.isFolder) {
                    node.title = changeInfo.title
                } else {
                    let bookmark = node as SmartBookmark

                    let sameURLBookmarks = this.bookmarkURLMap.get(bookmark.url)!;
                    sameURLBookmarks.splice(sameURLBookmarks.indexOf(bookmark), 1);
                    parent.removeChild(bookmark);

                    bookmark.url = changeInfo.url!;
                    bookmark.title = changeInfo.title;

                    if (this.bookmarkURLMap.has(bookmark.url)) {
                        this.bookmarkURLMap.get(bookmark.url)!.push(bookmark);
                    } else {
                        this.bookmarkURLMap.set(bookmark.url, [bookmark]);
                    }
                }
                parent.addChild(node)
            }
        })
        chrome.bookmarks.onMoved.addListener((id, moveInfo) => {
            let oldHas = this.nodeIDMap.has(moveInfo.oldParentId);
            let nowHas = this.nodeIDMap.has(moveInfo.parentId);
            if (oldHas && nowHas) {
                // internal move, need to update datastructures
                let bookmark = this.nodeIDMap.get(id)!;
                (this.nodeIDMap.get(moveInfo.oldParentId) as SmartFolder)!.removeChild(bookmark);
                (this.nodeIDMap.get(moveInfo.parentId) as SmartFolder)!.addChild(bookmark);
                bookmark.parentId = moveInfo.parentId;
            } else if (oldHas && !nowHas) {
                // move out, remove
                this.removeFromAllDatastructures(this.nodeIDMap.get(id)!);
            } else if (!oldHas && nowHas) {
                // move in, create. Special case: can move a folder with items in it, so need to recurse
                chrome.bookmarks.getSubTree(id).then(([chromeBookmark]) => {
                    this.savePopulatedFolder(chromeBookmark);
                })
            } else {
                // external move, ignore
                return;
            }
        })
        chrome.bookmarks.onCreated.addListener((id, bookmark) => {
            if (!this.nodeIDMap.has(id) && this.nodeIDMap.has(bookmark.parentId!))
                this.saveToAllDatastructures(SmartBookmarkNode.fromChrome(bookmark));
        })
        chrome.bookmarks.onRemoved.addListener((id) => {
            if (id == this.rootNode.id) {
                this.removeFromAllDatastructures(this.rootNode);
                this.syncWithChrome().then();
            } else if (this.nodeIDMap.has(id)) {
                this.removeFromAllDatastructures(this.nodeIDMap.get(id)!);
            }
        })
        chrome.bookmarks.onImportEnded.addListener(() => {
            this.syncWithChrome().then();
        })
        // chrome.bookmarks.onChildrenReordered.addListener(() => {
        // })
    }
}
