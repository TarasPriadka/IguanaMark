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
            console.log(linkObj);
            let searchLower = searchText.toLowerCase();
            return linkObj.title.toLowerCase().includes(searchLower) || linkObj.tags.some(tag => tag.toLowerCase().includes(searchLower));
        }
    }).map((linkObj, index) => {
        return <ListItem
            key={linkObj["url"]}
            className="m-2"
            title={linkObj["title"]}
            url={linkObj["url"]}
            tags={linkObj["tags"]}
            index={index}
        />
    });

    return <>
        {displayBoxes}
    </>

}

export default ListItemContainer;
