/**
 * Bookmark class as a wrapper for bookmark nodes in chrome api
 */
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

export class SmartBookmarkNode implements SmartCreateInfo {
    id: string
    parentId: string

    isFolder: boolean
    /**
     * If folder, url is ""
     */
    url: string
    title: string

    /**
     * Empty for bookmarks
     */
    children: Array<SmartBookmarkNode>
    // Used for quickly figuring out the folder name
    childrenIdMap: Map<string, SmartBookmarkNode>
    // Used for quickly traversing folder trees
    childrenTitleMap: Map<string, Array<SmartBookmarkNode>>

    constructor(id: string, parentId: string, isFolder: boolean, url: string, title: string, children: Array<SmartBookmarkNode>) {
        this.id = id;
        this.parentId = parentId;
        this.isFolder = isFolder;
        this.url = url;
        this.title = title;

        this.children = [];
        this.childrenIdMap = new Map()
        this.childrenTitleMap = new Map()
        children.forEach(this.addChild)
    }

    /**
     * Add a child to the folder.
     *
     * @param child Child to add.
     */
    addChild(child: SmartBookmarkNode) {
        this.children.push(child)
        this.childrenIdMap.set(child.id, child)

        if (this.childrenTitleMap.has(child.title)) {
            this.childrenTitleMap.get(child.title)!.push(child)
        } else {
            this.childrenTitleMap.set(child.title, [child])
        }
    }

    /**
     * Remove a child from folder.
     *
     * @param child Child to remove.
     */
    removeChild(child: SmartBookmarkNode) {
        if (this.childrenIdMap.has(child.id)) {
            this.children.splice(this.children.indexOf(child), 1)
            this.childrenIdMap.delete(child.id)
            let sameTitleChildren = this.childrenTitleMap.get(child.title)!
            sameTitleChildren.splice(sameTitleChildren.indexOf(child), 1)
        }
    }

    static fromChrome(chromeBookmark: BookmarkTreeNode): SmartBookmarkNode {
        if (chromeBookmark.url) {
            return new SmartBookmark(
                chromeBookmark.id,
                chromeBookmark.parentId!,
                chromeBookmark.url,
                chromeBookmark.title
            )
        } else {
            return new SmartFolder(
                chromeBookmark.id,
                chromeBookmark.parentId!,
                chromeBookmark.title
            )
        }
    }
}

export class SmartBookmark extends SmartBookmarkNode {

    constructor(id: string, parentId: string, url: string, title: string) {
        super(id, parentId, false, url, title, []);
    }
}

export class SmartFolder extends SmartBookmarkNode {

    constructor(id: string, parentId: string, title: string, children: Array<SmartBookmarkNode> = []) {
        super(id, parentId, true, "", title, children);
    }
}

export interface SmartCreateInfo {
    parentId?: string
    isFolder?: boolean
    url?: string
    title: string
}

export interface SmartUpdateInfo {
    id: string
    url?: string
    title?: string
}

export interface SmartMoveInfo {
    id: string
    parentId?: string
}

export interface SmartRemoveInfo {
    id: string
}
