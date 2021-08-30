// src/ScreenButton.tsx

import React, {useState} from "react";
import saveCurrentPage from "../../libs/ui";
import Draggable from 'react-draggable'; // The default

import "./ScreenButton.css";


const ScreenButton = () => {
    const [text, setText] = useState("★")

    return (
        <Draggable>
            <div className="back-to-top">
                <header className="AppHeader">
                    <button className="linkButton circle" id="saveUrl" onClick={() => {
                        saveCurrentPage(document.title, window.location.href, null);
                    }}>
                        {text}
                    </button>
                </header>
            </div>
        </Draggable>
    );
};

export default ScreenButton;
