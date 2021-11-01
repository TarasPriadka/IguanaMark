import React from "react";

import "./App.css";

import AppNavbar from "./components/AppNavbar.jsx";
import ListItemContainer from "./components/ListItemContainer.jsx";
import {iguanaClickedAtom, quickMarkVisibleAtom} from "./atoms.js";

import {useRecoilState, useRecoilValue} from "recoil";
import ListItemForm from "./components/ListItemCreationForm.jsx";


function App() {
    const iguanaClicked = useRecoilValue(iguanaClickedAtom);
    let [quickMarkVisible, setQuickMarkVisible] = useRecoilState(quickMarkVisibleAtom);

    return <>
        <div className="container-fluid App p-1">
            <AppNavbar/>
            {iguanaClicked ? <ListItemForm/> : <></>}
            <hr/>
            <div className="scrollable">
                <ListItemContainer/>
            </div>
        </div>
        <div className={"checkbox-wrapper noselect pl-3"} onClick={() => {
            setQuickMarkVisible(!quickMarkVisible);
        }}>
                    <input type="checkbox" checked={quickMarkVisible}/>
                    <span className="animated"/>
                    Quick Mark Button
                </div>
    </>
}

export default App;
