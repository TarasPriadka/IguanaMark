// src/App.tsx

import React, {useState} from "react";
import {saveCurrentPage, removeCurrentPage, checkBookmark} from "../../libs/ui";
import "./App.css";

async function getCurrentTab() {
    let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });
    return tab;
}

let initialized = false;

const App = () => {
    const [bookmarkExists, setBookmarkExists] = useState(false)
    const [contentVisible, setContentVisible] = useState(true)

    if (!initialized) {
        initialized = true
        getCurrentTab().then(tab => checkBookmark(tab.url!, setBookmarkExists))

        chrome.storage.sync.get(['contentVisible'], storage => {
            if ('contentVisible' in storage)
                setContentVisible(storage['contentVisible'])
        })

    }

    return (
        <div className="App">
            <header className="App-header">
                <button className="linkButton" id="saveUrl" onClick={() => {
                    getCurrentTab().then((tab) => {
                        if (tab.title != null && tab.url != null) {
                            if (bookmarkExists)
                                removeCurrentPage(tab.url)
                            else
                                saveCurrentPage(tab.title, tab.url, tab)
                            setBookmarkExists(!bookmarkExists)
                        }
                    });
                }}>
                    {bookmarkExists ? "Unmark Current Page" : "Mark Current Page"}
                </button>
                <br/>
                <span className={"checkboxWrapper"} onClick={() => {
                    chrome.storage.sync.set({contentVisible: !contentVisible})

                    // send out message for content to update dynamically
                    getCurrentTab().then(tab => {
                        if (tab.id)
                            chrome.tabs.sendMessage(tab.id, {
                                action: 'contentVisible',
                                contentVisible: !contentVisible
                            })
                    })

                    setContentVisible(!contentVisible)
                }}>
                    <input type="checkbox" checked={contentVisible}/>
                    <span></span>
                    Quick Mark Button
                </span>
            </header>
        </div>
    );
};

export default App;
