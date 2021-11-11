import React, {useEffect, useState} from "react";
import Draggable from 'react-draggable';
import {removeCurrentPage, saveCurrentPage} from "../../libs/ui";
import "./ScreenButton.css";

/**
 * On-screen quick-mark button for creating bookmarks quickly
 */
function ScreenButton() {

    let unmarkedURL = chrome.runtime.getURL('content/unmarked.svg');
    let markedURL = chrome.runtime.getURL('content/marked.svg');
    const [marked, setMarked] = useState(false);
    const [quickMarkVisible, setQuickMarkVisible] = useState(false);

    useEffect(() => {
        chrome.storage.local.get(["listItems", "quickMarkVisible"], (fetched) => {
            if (fetched['listItems']) {
                for (const listItem of fetched['listItems']) {
                    if (listItem.url === window.location.href) {
                        setMarked(true);
                        break;
                    }
                }
            }
            if (fetched.quickMarkVisible === undefined) {
                setQuickMarkVisible(true);
            } else {
                setQuickMarkVisible(fetched.quickMarkVisible);
            }
        });
        addListeners();
    }, []);

    /**
     * Add listeners for outside events that change content state
     */
    const addListeners = () => {
        chrome.runtime.onMessage.addListener(request => {
            console.log("Here:", request)
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
        <div className="buttonContainer" hidden={!quickMarkVisible}>
            <button
                className={`quickmarkButton buttonContainer animated ${marked ? "activated" : ""}`}
                id="saveUrl"
                onClick={() => {
                    if (!isDragging)
                        if (marked) {
                            removeCurrentPage(window.location.href);
                        } else {
                            saveCurrentPage(
                                window.location.href,
                                document.title,
                                document.getElementsByTagName('body')[0].innerText
                            );
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
