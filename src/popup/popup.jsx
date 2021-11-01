/**
 * Main module which mounts React root
 */

import React from 'react';
import {RecoilRoot} from 'recoil';
import ReactDOM from 'react-dom';
import './index.css';
import App from "./App.jsx"
import ChromeSyncer from "./ChromeSyncer";

ReactDOM.render(
    <React.StrictMode>
        <RecoilRoot>
            <ChromeSyncer/>
            <App/>
        </RecoilRoot>
    </React.StrictMode>,
    document.getElementById('root')
);
