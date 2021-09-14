import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

/**
 * Bookmark class as a wrapper for bookmark nodes in chrome api
 */
export class SmartBookmarkNode implements SmartCreateInfo {

    id: string
    parentId: string
    isFolder: boolean
    title: string

    constructor(id: string, parentId: string, isFolder: boolean, title: string) {
        this.id = id;
        this.parentId = parentId;
        this.isFolder = isFolder;
        this.title = title;
    }

    /**
     * Create a SmartBookmark or SmartFolder from a chrome bookmark node.
     * @param chromeBookmark existing chrome bookmark
     */
    static fromChrome(chromeBookmark: BookmarkTreeNode): SmartBookmarkNode {
        if (chromeBookmark.url) {
            console.log('Creating bookmark ' + chromeBookmark.title)
            return new SmartBookmark(
                chromeBookmark.id,
                chromeBookmark.parentId!,
                chromeBookmark.url,
                chromeBookmark.title
            )
        } else {
            console.log('Creating folder ' + chromeBookmark.title)
            return new SmartFolder(
                chromeBookmark.id,
                chromeBookmark.parentId!,
                chromeBookmark.title
            )
        }
    }
}

/**
 * SmartBookmarkNode but only bookmark
 */
export class SmartBookmark extends SmartBookmarkNode {

    url: string

    constructor(id: string, parentId: string, url: string, title: string) {
        super(id, parentId, false, title);
        this.url = url
    }

    /**
     * Create a SmartBookmark from a chrome bookmark node.
     * @param chromeBookmark existing chrome bookmark
     */
    static fromChrome(chromeBookmark: BookmarkTreeNode): SmartBookmark {
        return new SmartBookmark(
            chromeBookmark.id,
            chromeBookmark.parentId!,
            chromeBookmark.url!,
            chromeBookmark.title
        )
    }
}

/**
 * SmartBookmarkNode but only folder
 */
export class SmartFolder extends SmartBookmarkNode {

    children: Array<SmartBookmarkNode>
    // Used for quickly figuring out the folder name
    childrenIdMap: Map<string, SmartBookmarkNode>
    // Used for quickly traversing folder trees
    childrenTitleMap: Map<string, Array<SmartBookmarkNode>>

    constructor(id: string, parentId: string, title: string, children: Array<SmartBookmarkNode> = []) {
        super(id, parentId, true, title);

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

    /**
     * Create a SmartFolder from a chrome bookmark node.
     * @param chromeBookmark existing chrome bookmark
     */
    static fromChrome(chromeBookmark: BookmarkTreeNode): SmartFolder {
        return new SmartFolder(
            chromeBookmark.id,
            chromeBookmark.parentId!,
            chromeBookmark.title
        )
    }
}

/**
 * Interface for bookmark/folder creation from the API perspective. ie: the
 * user does not manually set the id, so it is not here. Also folders don't
 * have a url, so it is optional.
 */
export interface SmartCreateInfo {
    parentId?: string
    isFolder?: boolean
    url?: string
    title: string
}

/**
 * API interface for updating.
 */
export interface SmartUpdateInfo {
    id: string
    url?: string
    title?: string
}

/**
 * API interface for moving bookmarks/folders.
 */
export interface SmartMoveInfo {
    id: string
    parentId?: string
}

/**
 * API interface for removing bookmarks/folders.
 */
export interface SmartRemoveInfo {
    id: string
}
