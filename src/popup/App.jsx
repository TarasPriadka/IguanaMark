import React from "react";
import {useRecoilState, useRecoilValue} from "recoil";
import {AiFillPlusSquare} from "react-icons/all";
import "./App.css";

import {iguanaClickedAtom, quickMarkVisibleAtom} from "./atoms.js";
import AppNavbar from "./components/AppNavbar.jsx";
import ListItemContainer from "./components/ListItemContainer.jsx";
import ListItemForm from "./components/ListItemCreationForm.jsx";


function App() {
    const iguanaClicked = useRecoilValue(iguanaClickedAtom);
    let [quickMarkVisible, setQuickMarkVisible] = useRecoilState(quickMarkVisibleAtom);

    return <>
        <div className="container-fluid App p-1">
            <AppNavbar/>
            {iguanaClicked ? <ListItemForm/> : <></>}
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
            <div className="col">
                <AiFillPlusSquare className="add-button"/>
            </div>
        </div>
    </>
}

export default App;
