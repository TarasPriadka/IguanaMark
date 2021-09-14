import React from "react";
import {saveCurrentPage, removeCurrentPage, getBookmarkExists} from "../../libs/ui";
import "./App.css";
import Tab = chrome.tabs.Tab;

/**
 * Interface for the properties of the ScreenButton component
 */
interface IProps {
}

/**
 * Interface for the state of the ScreenButton component
 */
interface IState {
    bookmarkExists?: boolean
    quickMarkVisible?: boolean
}

/**
 * Returns the current tab
 * @return tab current active tab
 */
async function getCurrentTab(): Promise<Tab> {
    let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });
    return tab;
}

class App extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);

        this.state = {
            bookmarkExists: false,
            quickMarkVisible: false
        }

        getCurrentTab().then(tab => getBookmarkExists(tab.url!, this.setBookmarkExists))

        chrome.storage.sync.get('quickMarkVisible', storage => {
            this.setState({
                quickMarkVisible: storage['quickMarkVisible']
            })
        })

    }

    /**
     * React render
     */
    render() {
        return (
            <div className="App">
                <button className="linkButton animated noselect" id="saveUrl" onClick={() => {
                    getCurrentTab().then((tab) => {
                        if (tab.title != null && tab.url != null) {
                            if (this.state.bookmarkExists) {
                                removeCurrentPage(tab.url)
                            } else {
                                saveCurrentPage(tab.title, tab.url, tab)
                            }
                            this.setBookmarkExists(!this.state.bookmarkExists)
                        }
                    });
                }}>
                    {this.state.bookmarkExists ? "Unmark Current Page" : "Mark Current Page"}
                </button>
                <br/>
                <span className={"checkboxWrapper noselect"} onClick={() => {
                    this.setQuickMarkVisible(!this.state.quickMarkVisible)
                }}>
                    <input type="checkbox" checked={this.state.quickMarkVisible}/>
                    <span className="animated"/>
                    Quick Mark Button
                </span>
            </div>
        );
    }

    /**
     * Sets the visibility of the quickMark button
     * @param visible visibility of the quickMark button
     */
    private setQuickMarkVisible = (visible: boolean) => {
        chrome.storage.sync.set({quickMarkVisible: visible})

        // send out message for content page to update dynamically
        getCurrentTab().then(tab => {
            if (tab.id)
                chrome.tabs.sendMessage(tab.id, {
                    action: 'quickMarkVisible',
                    quickMarkVisible: visible
                })
        })

        this.setState({
            quickMarkVisible: visible
        })
    }

    /**
     * Set bookmark existence state
     * @param exists whether bookmark now exists or not
     */
    private setBookmarkExists = (exists: boolean) => {
        this.setState({
            bookmarkExists: exists
        })
    }
}

export default App;
