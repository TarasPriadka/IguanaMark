import React from "react";
import {useRecoilState} from "recoil";

import "../App.css";
import {listItemsAtom, replaceItemAtIndex} from "../atoms";
import {PlusTag, Tag} from "./Tag";


function TagBar(props) {

    const [listItems, setListItems] = useRecoilState(listItemsAtom);

    const removeTag = (tagName) => {
        let newValue = listItems[props.index]
        const newList = replaceItemAtIndex(listItems, props.index, {
            ...newValue,
            tags: newValue.tags.filter(tag => tag !== tagName)
        });
        setListItems(newList);
    }

    const addTag = (newTagName) => {
        let newValue = listItems[props.index]
        const newList = replaceItemAtIndex(listItems, props.index, {
            ...newValue,
            tags: [...new Set([...newValue.tags, newTagName])] //make sure the tags are unique
        });
        setListItems(newList);
    }

    let badges = listItems[props.index]['tags'].map(tagName => {
        return <span key={tagName}><Tag name={tagName} removeTag={removeTag}/>{' '}</span>;
    });
    let readTag = listItems[props.index]['read'] ? "Read" : "Unread"

    return <div className="tag-bar">
        <span key={readTag}><Tag name={readTag}/>{' '}</span>
        {badges}
        <PlusTag key="plus" addTag={addTag}/>
    </div>
}

export default TagBar;
