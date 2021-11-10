import {saveCurrentPage} from "/src/libs/ui";
import React, {useEffect, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {useSetRecoilState} from "recoil";
import "../App.css";
import {iguanaClickedAtom} from "../atoms";

function ListItemForm() {
    const setIguanaClicked = useSetRecoilState(iguanaClickedAtom);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [url, setUrl] = useState("");

    const handleSubmit = () => {
        console.log('submit');
        saveCurrentPage(url, title, desc).then(() => {
            setIguanaClicked(false);
        });
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
