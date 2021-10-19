import React from 'react';
import {RecoilRoot} from 'recoil';
import ReactDOM from 'react-dom';
import './index.css';
import App from "./App.jsx"

ReactDOM.render(
    <React.StrictMode>
        <RecoilRoot>
            <App/>
        </RecoilRoot>
    </React.StrictMode>,
    document.getElementById('root')
);
