import React from "react";
import "../App.css";
import ListItem from "./listItem/ListItem";
import {useRecoilValue} from "recoil";
import {listItemsAtom} from "../atoms";


function ListItemContainer(props) {

    const listItems = useRecoilValue(listItemsAtom);

    console.log(listItems)

    const displayBoxes = listItems.map((linkObj, index) => {
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
