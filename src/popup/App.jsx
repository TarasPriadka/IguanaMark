import React from "react";
import {useRecoilState, useRecoilValue} from "recoil";
import "./App.css";

import {appLoadedAtom, quickMarkVisibleAtom} from "./atoms.js";
import AppNavbar from "./components/AppNavbar.jsx";
import ListItemContainer from "./components/ListItemContainer.jsx";


function App() {
    let [quickMarkVisible, setQuickMarkVisible] = useRecoilState(quickMarkVisibleAtom);
    let appLoaded = useRecoilValue(appLoadedAtom);

    return (!appLoaded ? <></> : <>
        <div className="container-fluid App p-1">
            <AppNavbar/>
            <hr className="m-0 mb-2"/>
            <div className="scrollable">
                <ListItemContainer/>
            </div>
        </div>
        <div className="checkbox-wrapper noselect">
            <div className="col checkbox-col  pl-3 float-start" onClick={() => {
                setQuickMarkVisible(!quickMarkVisible);
            }}>
                <input type="checkbox" checked={quickMarkVisible}/>
                <span className="animated"/>
                Quick Mark Button
            </div>
            {/*<div className="col">*/}
            {/*    <AiFillPlusSquare className="add-button"/>*/}
            {/*</div>*/}
        </div>
    </>)
}

export default App;
