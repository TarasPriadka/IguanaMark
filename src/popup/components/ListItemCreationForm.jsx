import React, {useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {Page, PageTagger} from "/src/libs/ai/tagger";
import "../App.css";
import {iguanaClickedAtom, listItemsAtom} from "../atoms";

function ListItemForm(props) {
    const listItems = useRecoilValue(listItemsAtom)
    const setListItems = useSetRecoilState(listItemsAtom);
    const setIguanaClicked = useSetRecoilState(iguanaClickedAtom);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [url, setUrl] = useState("");

    const tagger = new PageTagger(
        listItems.map(
            a => new Page(
                a.url,
                a.title,
                a.desc,
                new Set(a.tags)
            )
        )
    );

    const handleSubmit = () => {
        console.log('submit');
        setListItems(curItems => [
            {
                "title": title,
                "url": url,
                "desc": desc,
                "tags": ["Unread"].concat(Array.from(tagger.tagPageRaw(url, title, desc)))
            }, ...curItems
        ])
        setIguanaClicked(false);
    }

    return (
        <Modal.Dialog>
            <Modal.Body>
                <input
                    placeholder="Name"
                    type="text"
                    value={title}
                    onChange={event => setTitle(event.target.value)}
                    className="m-1"
                />
                <input
                    placeholder="Url"
                    type="text"
                    value={url}
                    onChange={event => setUrl(event.target.value)}
                    className="m-1"
                />
                <input
                    placeholder="Description"
                    type="text"
                    value={desc}
                    onChange={event => setDesc(event.target.value)}
                    className="m-1"
                />
                <Button variant="primary" className="m-1" onClick={handleSubmit}>Save changes</Button>
            </Modal.Body>
        </Modal.Dialog>
    );
}

export default ListItemForm;
