import React, {useEffect, useRef} from "react";

/**
 * Hook that alerts clicks outside of the passed ref
 */
function useOutsideAlerter(ref, action) {
    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                action()
            }
        }

        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, action]);
}

/**
 * Component that alerts if you click outside of it
 */
export default function OutsideHandler(props) {
    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef, props.onOutside);

    return <div ref={wrapperRef}>{props.children}</div>;
}