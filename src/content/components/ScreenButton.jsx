import Draggable from 'react-draggable';
import React, {useEffect, useState} from "react";
import "./ScreenButton.css";
import {removeCurrentPage, saveCurrentPage} from "../../libs/ui";

import regeneratorRuntime from "regenerator-runtime";

/**
 * On-screen quick-mark button for creating bookmarks quickly
 */
function ScreenButton() {

    let unmarkedURL = chrome.runtime.getURL('content/unmarked.svg');
    let markedURL = chrome.runtime.getURL('content/marked.svg');
    const [marked, setMarked] = useState(false);
    const [quickMarkVisible, setQuickMarkVisible] = useState(true);

    useEffect(() => {
        chrome.storage.local.get(["listItems"], (fetched) => {
            for (const listItem of fetched['listItems']) {
                if (listItem.url === window.location.href) {
                    setMarked(true);
                    break;
                }
            }
        });
        addListeners();
    }, []);

    /**
     * Add listeners for outside events that change content state
     */
    const addListeners = () => {
        chrome.runtime.onMessage.addListener(request => {
            try {
                switch (request.action) {
                    case 'broadcast-update':
                        if (request.url == window.location.href)
                            setMarked(request.bookmarkExists);
                        break;

                    case 'quickMarkVisible':
                        setQuickMarkVisible(request.quickMarkVisible)
                        break;
                }
            } catch (e) {
                console.error(e);
            }
        });
    }

    let isDragging = false;

    return <Draggable onDrag={() => {
        isDragging = true
    }}>
        <div className="buttonContainer" hidden={false}>
            <button
                className={`quickmarkButton buttonContainer animated ${marked ? "activated" : ""}`}
                id="saveUrl"
                onClick={() => {
                    if (!isDragging)
                        if (marked) {
                            removeCurrentPage(window.location.href);
                        } else {
                            saveCurrentPage(document.title, window.location.href);
                        }
                    isDragging = false;
                }}>
                <img className="mark noselect"
                     src={marked ? markedURL : unmarkedURL}
                     alt={marked ? '★' : '☆'}
                />
            </button>
        </div>
    </Draggable>


}

export default ScreenButton;
