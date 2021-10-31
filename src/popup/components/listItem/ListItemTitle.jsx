import React, {useEffect, useState} from "react";
import "../../App.css";
import OutsideHandler from "../ClickOutside";


function ListItemTitle(props) {
    const [titleClicked, setTitleClicked] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [title, setTitle] = useState(props.title);

    useEffect(() => {
        setTitle(props.title);
    }, [props.title])

    /**
     * React render
     */
    return <span className="m-0">
        {!titleClicked ?
            <span className="m-0 p-0" onClick={() => {
                setTitleClicked(true)
            }} style={{cursor: "pointer"}}>
                {title}
            </span>
            :
            <OutsideHandler
                onOutside={() => {
                    setTitleClicked(false);
                    setNewTitle("");
                }}
            >
                <span className="title-input sleek-input">
                    <form
                        onSubmit={(event) => {
                            props.updateTitle(newTitle);
                            setTitleClicked(false);
                            setTitle(newTitle);
                            event.preventDefault();
                        }}
                    >
                        <input
                            className="sleek-input"
                            onChange={(e) => {
                                setNewTitle(e.target.value)
                            }}
                            placeholder="New Title"
                            value={newTitle}
                        />
                    </form>
                </span>
            </OutsideHandler>
        }
    </span>
}

export default ListItemTitle;
