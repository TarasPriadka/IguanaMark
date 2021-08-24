// src/App.tsx

import React, {useState} from "react";
import "./App.css";

async function saveCurrentPage() {

    let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    chrome.runtime.sendMessage({
            action: "save-bookmark",
            title: tab.title,
            url: tab.url,
            tab: tab
        },
    );

}

const App = () => {
    const [text, setText] = useState("Save Current Page")

    return (
        <div className="App">
            <header className="App-header">
                <button className="button" id="saveUrl" onClick={() => {
                    saveCurrentPage()
                    // console.log("SS.");
                    // setText("clicked.")
                }}>
                    {text}
                </button>
            </header>
        </div>
    );
};

export default App;
