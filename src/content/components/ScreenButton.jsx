import Draggable from 'react-draggable';
import React, {useState} from "react";
import "./ScreenButton.css";
import {Button} from "react-bootstrap";


function ScreenButton(props) {
    this.unmarkedURL = chrome.runtime.getURL('content/unmarked.svg');
    this.markedURL = chrome.runtime.getURL('content/marked.svg');

    const [bookmarkExists, setBookmarkExists] = useState(false);

    return <Draggable>
        <div className="buttonContainer" hidden={!this.state.quickMarkVisible}>
            <Button
                className={`quickmarkButton animated ${this.state.bookmarkExists ? "activated" : ""}`}
                id="saveUrl"
                onClick={() => {
                    setBookmarkExists(!bookmarkExists)
                }}
            >
                <img className="mark noselect"
                     src={bookmarkExists ? this.markedURL : this.unmarkedURL}
                     alt={bookmarkExists ? '★' : '☆'}
                />
            </Button>
        </div>
    </Draggable>
}

// /**
//  * On-screen quick-mark button for creating bookmarks quickly
//  */
// class ScreenButton extends React.Component<IProps, IState> {
//
//     private unmarkedURL: string;
//     private markedURL: string;
//
//     /**
//      * constructor
//      * @param props properties for the component. None now. See IProps
//      */
//     constructor(props: any) {
//         super(props);
//
//         this.state = {
//             bookmarkExists: false,
//             quickMarkVisible: false
//         }
//
//         this.unmarkedURL = chrome.runtime.getURL('content/unmarked.svg');
//         this.markedURL = chrome.runtime.getURL('content/marked.svg');
//
//         // have to initialize the state this way because checkBookmark is async
//         getBookmarkExists(window.location.href, this.setBookmarkExists);
//
//         chrome.storage.sync.get('quickMarkVisible', r => this.setState({
//             quickMarkVisible: r['quickMarkVisible']
//         }));
//
//         this.addListeners();
//     }
//
//     /**
//      * Add listeners for outside events that change content state
//      */
//     private addListeners = () => {
//         chrome.runtime.onMessage.addListener(request => {
//             try {
//                 switch (request.action) {
//
//                     case 'broadcast-update':
//                         if (request.url == window.location.href)
//                             this.setBookmarkExists(request.bookmarkExists);
//                         break;
//
//                     case 'quickMarkVisible':
//                         this.setState({
//                             quickMarkVisible: request.quickMarkVisible
//                         });
//                         break;
//
//                 }
//             } catch (e) {
//                 console.error(e);
//             }
//         });
//     }
//
//     /**
//      * React render method
//      */
//     render() {
//         /**
//          * For detecting whether the click event is an actual click or from dragging the button.
//          */
//         let isDragging = false;
//
//         return (
//             <Draggable onDrag={() => {
//                 isDragging = true
//             }}>
//                 <div className="buttonContainer" hidden={!this.state.quickMarkVisible}>
//                     <button
//                         className={`quickmarkButton animated ${this.state.bookmarkExists ? "activated" : ""}`}
//                         id="saveUrl"
//                         onClick={() => {
//                             if (!isDragging)
//                                 if (this.state.bookmarkExists) {
//                                     removeCurrentPage(window.location.href);
//                                 } else {
//                                     saveCurrentPage(document.title, window.location.href);
//                                 }
//                             isDragging = false;
//                         }}>
//                         <img className="mark noselect"
//                             src={this.state.bookmarkExists ? this.markedURL : this.unmarkedURL}
//                             alt={this.state.bookmarkExists ? '★' : '☆'}
//                         />
//                     </button>
//                 </div>
//             </Draggable>
//         );
//     }
//
//     /**
//      * Set bookmark existence state
//      * @param exists whether bookmark now exists or not
//      */
//     private setBookmarkExists = (exists: boolean) => {
//         this.setState({
//             bookmarkExists: exists
//         });
//     }
// }

export default ScreenButton;
