import React, {useEffect, useState} from "react";

import {listItemsAtom, quickMarkVisibleAtom, tagColorsAtom} from "./atoms";
import {useRecoilState} from "recoil";


/**
 * This provides a wrapper for the module which watches for any updates to the atom values and launches Chrome
 * storage updates when atom value changes.
 *
 * @returns {JSX.Element}
 * @constructor
 */
function ChromeSyncer() {

    //Flag for application readiness. Needed to make sure that the data is fetched when the popup is opened.
    let [appLoaded, setAppLoaded] = useState(false);

    chrome.runtime.onMessage.addListener(request => {
        try {
            switch (request.action) {
                case 'broadcast-update':
                    if (request.url == window.location.href)
                        setMarked(request.bookmarkExists);
                    break;

                case 'quickMarkVisible':
                    setQuickMarkVisible(request.quickMarkVisible)
                    break;
            }
        } catch (e) {
            console.error(e);
        }
    });

    /**
     * Folds a list of atoms into objects with name, getter and setter for easier later updates.
     * @param atoms list of atoms to fold into objects
     * @returns list of folded items
     */
    function atomFolder(atoms) {
        return atoms.map((atom) => {
            let [getter, setter] = useRecoilState(atom);
            return {
                name: atom.key,
                getter: getter,
                setter: setter
            }
        })
    }

    //folded atoms which will be watched and synced
    let atoms = atomFolder([
        listItemsAtom,
        quickMarkVisibleAtom,
        tagColorsAtom
    ]);

    //recoil values which will be watched
    let atomGetters = atoms.map((atom) => {
        return atom['getter']
    })
    atomGetters.push(appLoaded);

    /**
     * Fetches data from chrome and updates atoms with the fetched data.
     */
    function fetchChrome() {
        let atomNames = atoms.map((atom) => {
            return atom['name'];
        })

        chrome.storage.local.get(atomNames, function (result) {
            console.log("Fetching data from Chrome Storage.");
            Object.keys(result).forEach((atomName) => {
                atoms.filter((a) => a['name'] === atomName)[0]["setter"](result[atomName]);
            })
        });
    }

    /**
     * Sync all of the watched atoms to chrome store.
     */
    function syncChrome() {
        console.log("Syncing data to Chrome Storage.")
        let obj = {}
        atoms.forEach((atom) => {
            obj[atom['name']] = atom['getter'];
        });
        chrome.storage.local.set(obj);
    }

    /*
     * Main logic which tracks the change in atom states, syncs and fetches data.
     */
    useEffect(() => {
        if (appLoaded) {
            syncChrome();
        } else {
            fetchChrome();
            setAppLoaded(true);
        }
    }, atomGetters);

    return <></>

}

export default ChromeSyncer;