import React from "react";
import "../App.css";
import ListItem from "./listItem/ListItem";
import {useRecoilValue} from "recoil";
import {listItemsAtom, searchTextAtom} from "../atoms";


function ListItemContainer() {

    const listItems = useRecoilValue(listItemsAtom);
    const searchText = useRecoilValue(searchTextAtom);

    const displayBoxes = listItems.filter((linkObj) => {
        if (searchText === "") {
            return true;
        } else {
            let searchLower = searchText.toLowerCase();
            if (searchLower === "read"){
                return linkObj.read
            } else if (searchLower === "unread") {
                return !linkObj.read
            }

            let inTitle = linkObj.title.toLowerCase().includes(searchLower);
            let inTags = linkObj.tags.some(tag => tag.toLowerCase().includes(searchLower));

            return inTitle || inTags;
        }
    }).map((linkObj, index) => {
        return <ListItem
            key={linkObj["url"]}
            className="m-2"
            title={linkObj["title"]}
            url={linkObj["url"]}
            tags={linkObj["tags"]}
            read={linkObj["read"]}
            index={index}
        />
    });

    return <>
        {displayBoxes}
    </>

}

export default ListItemContainer;
