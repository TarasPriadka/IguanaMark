import React, {useEffect, useState} from "react";
import "../../App.css";


function ListItemTitle(props) {
    const [titleClicked, setTitleClicked] = useState(false);
    const [title, setTitle] = useState(props.title);
    const [newTitle, setNewTitle] = useState(title);

    useEffect(() => {
        setTitle(props.title);
    }, [props.title])

    /**
     * React render
     */
    return <span className="m-0">
            <span className="m-0 p-0" onClick={() => {
                props.followLink();
            }} style={{cursor: "pointer"}}>
                {title}
            </span>
    </span>
    // return <span className="m-0">
    //     {!titleClicked ?
    //         <span className="m-0 p-0" onClick={() => {
    //             setTitleClicked(true)
    //         }} style={{cursor: "pointer"}}>
    //             {title}
    //         </span>
    //         :
    //         <OutsideHandler
    //             onOutside={() => {
    //                 setTitleClicked(false);
    //                 setNewTitle(title);
    //             }}
    //         >
    //             <span className="sleek-input title-input">
    //                 <form
    //                     onSubmit={(event) => {
    //                         props.updateTitle(newTitle);
    //                         setTitleClicked(false);
    //                         setTitle(newTitle);
    //                         event.preventDefault();
    //                     }}
    //                 >
    //                     <input
    //                         className="sleek-input title-input"
    //                         onChange={(e) => {
    //                             setNewTitle(e.target.value)
    //                         }}
    //                         placeholder="New Title"
    //                         value={newTitle}
    //                     />
    //                 </form>
    //             </span>
    //         </OutsideHandler>
    //     }
    // </span>
}

export default ListItemTitle;
