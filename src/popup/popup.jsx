/**
 * Main module which mounts React root
 */

import React from 'react';
import {RecoilRoot} from 'recoil';
import ReactDOM from 'react-dom';
import './App.css';
import App from "./App.jsx"
import ChromeSyncer from "./ChromeSyncer"; // listener which syncs data to storage when atoms change

ReactDOM.render(
    <React.StrictMode>
        <RecoilRoot>
            <ChromeSyncer/>
            <App/>
        </RecoilRoot>
    </React.StrictMode>,
    document.getElementById('root')
);
