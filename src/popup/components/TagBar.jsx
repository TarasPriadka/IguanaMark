import React from "react";
import "../App.css";
import {listItemsAtom, replaceItemAtIndex} from "../atoms";
import {useRecoilState} from "recoil";
import {Tag, PlusTag} from "./Tag";


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
            tags: [...newValue.tags, newTagName]
        });
        setListItems(newList);
    }

    let badges = listItems[props.index]['tags'].map(tagName => {
        return <>
            <Tag name={tagName} removeTag={removeTag}/>{' '}
        </>;
    });


    return <div className="tag-bar">
        {badges}
        <PlusTag addTag={addTag}/>
    </div>
}

export default TagBar;
