import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

enum FindType {
    STRING_SEARCH
}

class Bookmarks {

    /*
    {
        url: {
            id: string
            name: string
            description: string
            location: string
            dateCreated: number (in ms)
            lastModified: number (in ms)
            lastAccessed: number (in ms)
        }
    }
     */
    private bookmarkMap = {}

    // @ts-ignore
    private rootNode: BookmarkTreeNode

    // Updates the root node
    private updateRoot() {
    }

    /**********************/
    /* Bookmark-level API */
    /**********************/

    // Save new or update existing bookmark name and location
    saveBookmark(url: string, name: string, folder: string) {
    }

    // Update name for bookmark
    renameBookmark(url: string, name: string) {
    }

    // Move bookmark to new folder
    moveBookmark(url: string, folder: string) {
    }

    accessBookmark(url: string, date: number = -1) {
    }

    // Check if bookmark exists
    bookmarkExists(url: string) {
    }

    // Get bookmark by id (url) or check if it exists (is null)
    getBookmark(url: string) {
    }

    // Get bookmark by id (url) or check if it exists (is null)
    getBookmarkAt(folder: string, name: string) {
    }

    // Find best matching bookmarks by query string
    findBookmarks(query: string, method: FindType = FindType.STRING_SEARCH) {
    }

    // Delete bookmark by id
    deleteBookmark(url: string) {
    }

    // Delete bookmark by folder and name
    deleteBookmarkAt(folder: string, name: string) {
    }

    /********************/
    /* Folder-level API */
    /********************/

    // Ensure the folder exists
    createFolder(folder: string) {
    }

    // Check if bookmark exists
    folderExists(folder: string): boolean {
        return false;
    }

    // Get all bookmarks in folder
    getBookmarks(folder: string) {
    }

    // Get all subfolders in folder
    getSubfolders(folder: string) {
    }

    // Find best matching bookmarks by query string
    findFolders(query: string, method: FindType = FindType.STRING_SEARCH) {
    }

    // Delete a whole folder, or a bookmark by name
    deleteFolder(folder: string) {
    }

}