import * as React from "react";
import * as ReactDOM from "react-dom";

import ScreenButton from "./components/ScreenButton";
// Get the element to prepend our app to. This could be any element on a specific website or even just `document.body`.

// Create a div to render the <App /> component to.
const root = document.createElement('div');
root.id = "iguana-root";
document.body.appendChild(root);

// Render the <App /> component.
ReactDOM.render(<ScreenButton />, root);
