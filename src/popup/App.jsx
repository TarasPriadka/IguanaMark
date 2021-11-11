import React from "react";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {AiFillPlusSquare} from "react-icons/all";
import "./App.css";

import {getCurrentTab} from "../background/background";
import {appLoadedAtom, listItemsAtom, quickMarkVisibleAtom} from "./atoms.js";
import AppNavbar from "./components/AppNavbar.jsx";
import ListItemContainer from "./components/ListItemContainer.jsx";
import {saveCurrentPage} from "../libs/ui";


function App() {
    let [quickMarkVisible, setQuickMarkVisible] = useRecoilState(quickMarkVisibleAtom);
    const setListItems = useSetRecoilState(listItemsAtom);
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
            <div className="col">
                <AiFillPlusSquare className="add-button" onClick={() => {
                    getCurrentTab().then((tab) => {
                        chrome.tabs.sendMessage(tab.id, {action: "getCurDocument"}, (docText) => {
                            saveCurrentPage(tab.url, tab.title, docText, tab);
                            // setListItems(newListItems)
                        })
                    });
                }}/>
            </div>
        </div>
    </>)
}

export default App;
