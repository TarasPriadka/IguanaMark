// src/ScreenButton.tsx

import React, {useState} from "react";
import {saveCurrentPage, checkBookmark, removeCurrentPage} from "../../libs/ui";
import Draggable from 'react-draggable'; // The default

import "./ScreenButton.css";

let initialized = false;

const ScreenButton = () => {
    const [bookmarkExists, setBookmarkExists] = useState(false)
    if (!initialized)
        checkBookmark(window.location.href, (state) => {
            setBookmarkExists(state)
            initialized = true
        })
    console.log('In global screen button scope')

    chrome.runtime.onMessage.addListener(function (request) {
        console.log(request)
        try {
            switch (request.action) {
                case "broadcast-update":
                    if (request.url == window.location.href)
                        setBookmarkExists(request.bookmarkExists)
                    break
            }
        } catch (e) {
            console.error(e)
        }
    });

    return (
        <Draggable>
            <div className="back-to-top">
                <header className="AppHeader">
                    <button className={`linkButton circle ${bookmarkExists ? "activated" : ""}`} id="saveUrl" onClick={() => {
                        if (bookmarkExists)
                            removeCurrentPage(window.location.href,);
                        else
                            saveCurrentPage(document.title, window.location.href, null);
                        // setBookmarkExists(!bookmarkExists)
                    }}>
                        *
                    </button>
                </header>
            </div>
        </Draggable>
    );
};

export default ScreenButton;
