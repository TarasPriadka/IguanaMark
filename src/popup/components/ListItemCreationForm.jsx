import React, {useState} from "react";
import "../App.css";
import {Button, Modal} from "react-bootstrap";
import {iguanaClickedAtom, listItemsAtom} from "../atoms";
import {useSetRecoilState} from "recoil";

function ListItemForm(props) {
    const setListItems = useSetRecoilState(listItemsAtom);
    const setIguanaClicked = useSetRecoilState(iguanaClickedAtom);
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");


    const handleSubmit = () => {
        setListItems(curItems => [
            {
                "title": title,
                "url": url,
                "tags": ["Unread"]
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
                <Button variant="primary" className="m-1" onClick={handleSubmit}>Save changes</Button>
            </Modal.Body>
        </Modal.Dialog>
    );
}

export default ListItemForm;
