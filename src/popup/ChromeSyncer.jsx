import React, {useEffect} from "react";

import {appLoadedAtom, listItemsAtom, quickMarkVisibleAtom, tagColorsAtom} from "./atoms";
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
    let [appLoaded, setAppLoaded] = useRecoilState(appLoadedAtom);

    /**
     * Folds a list of atoms into objects with name, getter and setter for easier later updates.
     * @param atoms list of atoms to fold into objects
     * @returns list of folded items. Looks like {atomName: {value: atomValue, setter: setterFunction}, ...}
     */
    function atomFolder(atoms) {
        let obj = {}
        atoms.map((atom) => {
            let [getter, setter] = useRecoilState(atom);
            obj[atom.key] = {
                value: getter,
                setter: setter
            }
        })
        return obj;
    }

    //folded atoms which will be watched and synced
    let atoms = atomFolder([
        tagColorsAtom,
        listItemsAtom,
        quickMarkVisibleAtom,
    ]);

    //recoil values which will be watched
    let atomGetters = Object.values(atoms).map((atom) => {
        return atom['value']
    })
    atomGetters.push(appLoaded);

    /**
     * Fetches data from chrome and updates atoms with the fetched data.
     */
    function fetchChrome() {
        let atomNames = Object.keys(atoms);

        chrome.storage.local.get(atomNames, function (result) {
            console.log("Fetching data from Chrome Storage.");
            for (const atomName in result) {
                atoms[atomName]["setter"](result[atomName]);
            }
            setAppLoaded(true);
        });
    }

    /**
     * Sync all of the watched atoms to chrome store.
     */
    function syncChrome() {
        console.log("Syncing data to Chrome Storage.")
        let obj = {}
        for (const atomName in atoms) {
            obj[atomName] = atoms[atomName]['value'];
        }
        chrome.storage.local.set(obj);
    }

    /*
     * Main logic which tracks the change in atom states, syncs and fetches data.
     */
    useEffect(() => {
        if (appLoaded) {
            chrome.runtime.sendMessage({action: "quickmark", quickMarkVisible: atoms.quickMarkVisible.value})
            syncChrome();
        } else {
            fetchChrome();
        }
    }, atomGetters);

    return <></>

}

export default ChromeSyncer;