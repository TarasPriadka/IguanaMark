// src/ScreenButton.tsx

import React, {useState} from "react";
import saveCurrentPage from "../../libs/ui";

import "./ScreenButton.css";


const ScreenButton = () => {
    const [text, setText] = useState("Save Current Page")

    return (
        <div className="back-to-top">
            <header className="AppHeader">
                <button className="button" id="saveUrl" onClick={() => {
                    saveCurrentPage(document.title, window.location.href, null);
                }}>
                    {text}
                </button>
            </header>
        </div>
    );
};

export default ScreenButton;
