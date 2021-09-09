// src/ScreenButton.tsx

import React, {useState} from "react";
import {saveCurrentPage, checkBookmark, removeCurrentPage} from "../../libs/ui";
import Draggable from 'react-draggable'; // The default

import "./ScreenButton.css";

let initialized = false;

const ScreenButton = () => {
    const [bookmarkExists, setBookmarkExists] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)
    if (!initialized) {
        initialized = true
        // initialize the state this way because checkBookmark is async
        checkBookmark(window.location.href, setBookmarkExists)

        chrome.storage.sync.get(['contentVisible'], res => setContentVisible(res['contentVisible']))

        // add listeners for outside events that change content state
        chrome.runtime.onMessage.addListener(function (request) {
            console.log(request)
            try {
                switch (request.action) {
                    case 'broadcast-update':
                        if (request.url == window.location.href)
                            setBookmarkExists(request.bookmarkExists)
                        break
                    case 'contentVisible':
                        setContentVisible(request.contentVisible)
                        break
                }
            } catch (e) {
                console.error(e)
            }
        });
    }

    let isDragging = false;

    return (
        <Draggable onDrag={() => {
            isDragging = true;
        }}>
            <div className="back-to-top" hidden={!contentVisible}>
                <header className="AppHeader">
                    <button className={`linkButton circle ${bookmarkExists ? "activated" : ""}`} id="saveUrl"
                            onClick={() => {
                                if (!isDragging)
                                    if (bookmarkExists)
                                        removeCurrentPage(window.location.href,);
                                    else
                                        saveCurrentPage(document.title, window.location.href, null);
                                isDragging = false;
                            }}>
                        {bookmarkExists ? '★' : '☆'}
                    </button>
                </header>
            </div>
        </Draggable>
    );
};

export default ScreenButton;
