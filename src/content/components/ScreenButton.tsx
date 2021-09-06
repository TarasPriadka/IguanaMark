// src/ScreenButton.tsx

import React, {useState} from "react";
import {saveCurrentPage, checkBookmark, removeCurrentPage} from "../../libs/ui";
import Draggable from 'react-draggable'; // The default

import "./ScreenButton.css";


const ScreenButton = () => {
    const [bookmarkExists, setBookmarkExists] = useState(false)
    checkBookmark(window.location.href, setBookmarkExists)

    return (
        <Draggable>
            <div className="back-to-top">
                <header className="AppHeader">
                    <button className={`linkButton circle ${bookmarkExists ? "activated" : ""}`} id="saveUrl" onClick={() => {
                        if (bookmarkExists)
                            removeCurrentPage(window.location.href,);
                        else
                            saveCurrentPage(document.title, window.location.href, null);
                        setBookmarkExists(!bookmarkExists)
                    }}>
                        *
                    </button>
                </header>
            </div>
        </Draggable>
    );
};

export default ScreenButton;
