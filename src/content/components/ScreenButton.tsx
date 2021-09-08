// src/ScreenButton.tsx

import React, {useState} from "react";
import {saveCurrentPage, checkBookmark, removeCurrentPage} from "../../libs/ui";
import Draggable from 'react-draggable'; // The default

import "./ScreenButton.css";

let initialized = false;

const ScreenButton = () => {
    const [bookmarkExists, setBookmarkExists] = useState(false)
    if (!initialized) {
        initialized = true
        // initialize the state this way because checkBookmark is async
        checkBookmark(window.location.href, setBookmarkExists)
        // add a single listener for background's bookmark update broadcasts
        chrome.runtime.onMessage.addListener(function (request) {
            console.log(request)
            try {
                if (request.action == "broadcast-update") {
                    if (request.url == window.location.href)
                        setBookmarkExists(request.bookmarkExists)
                }
            } catch (e) {
                console.error(e)
            }
        });
    }

    return (
        <Draggable>
            <div className="back-to-top">
                <header className="AppHeader">
                    <button className={`linkButton circle ${bookmarkExists ? "activated" : ""}`} id="saveUrl"
                            onClick={() => {
                                if (bookmarkExists)
                                    removeCurrentPage(window.location.href,);
                                else
                                    saveCurrentPage(document.title, window.location.href, null);
                            }}>
                        *
                    </button>
                </header>
            </div>
        </Draggable>
    );
};

export default ScreenButton;
