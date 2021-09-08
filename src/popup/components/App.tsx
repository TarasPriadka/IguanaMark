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
    if (!initialized) {
        initialized = true
        getCurrentTab().then(tab => checkBookmark(tab.url!, setBookmarkExists))
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
                    {bookmarkExists ? "Remove Current Page" : "Save Current Page"}
                </button>
            </header>
        </div>
    );
};

export default App;
