// src/App.tsx

import React, {useState} from "react";
import saveCurrentPage from "../../libs/ui";
import "./App.css";

async function getCurrentTab() {
    let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });
    return tab;
}

const App = () => {
    const [text, setText] = useState("Save Current Page")

    return (
        <div className="App">
            <header className="App-header">
                <button className="button" id="saveUrl" onClick={() => {
                    getCurrentTab().then((tab) => {
                        if (tab.title != null && tab.url != null) {
                            saveCurrentPage(tab.title, tab.url, tab);
                        }
                    });
                }}>
                    {text}
                </button>
            </header>
        </div>
    );
};

export default App;
