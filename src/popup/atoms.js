/**
 * File with atoms(states) which are tracked globally in the react application.
 */

import {atom} from "recoil";

export function replaceItemAtIndex(arr, index, newValue) {
    return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)];
}

export const quickMarkVisibleAtom = atom({
    key: "quickMarkVisible",
    default: true
})

export const searchTextAtom = atom({
    key: "searchText",
    default: ""
})

export const searchSubmitAtom = atom({
    key: "searchSubmit",
    default: false
})

export const appLoadedAtom = atom({
    key: "appLoaded",
    default: false
})

export const iguanaClickedAtom = atom({
    key: "iguanaClicked",
    default: false
})

export const listItemsAtom = atom({
    key: "listItems",
    default: []
})

// {
//     "title": "Google",
//     "url": "https://drive.google.com/drive/u/0/my-drive",
//     "desc": "Google is a search engine for searching about engines.",
//     "tags": ["Unread", "Search Engine", "Google"]
// },
// {
//     "title": "Yahoo",
//     "url": "https://www.yahoo.com",
//     "desc": "Yahoo is a search engine for searching but worse.",
//     "tags": ["Unread", "Search Engine"]
// },
// {
//     "title": "Facebook",
//     "url": "https://facebook.com",
//     "desc": "Meta... I hate meta.",
//     "tags": ["Unread", "Social"]
// }

export const tagColorsAtom = atom({
    key: "tagColors",
    default: {
        "Unread": "#808080",
        "Read": "#51B848",
        "+": "#0084ff",
        "default": "#51B848"
    }
})