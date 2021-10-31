import React from "react";

import "./App.css";

import AppNavbar from "./components/AppNavbar.jsx";
import ListItemContainer from "./components/ListItemContainer.jsx";
import {iguanaClickedAtom} from "./atoms.js";
import {useRecoilValue} from "recoil";
import ListItemForm from "./components/ListItemCreationForm.jsx";


function App() {
    const iguanaClicked = useRecoilValue(iguanaClickedAtom);

    return <div className="container-fluid App p-1">
        <AppNavbar/>
        {iguanaClicked ? <ListItemForm/> : <></>}
        <hr/>
        <div className="scrollable">
            <ListItemContainer/>
        </div>
    </div>
}

export default App;
