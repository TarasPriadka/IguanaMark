import * as React from "react";
import * as ReactDOM from "react-dom";

import App from "./components/App";
import "./popup.css";

var mountNode = document.getElementById("smartmark-root");
ReactDOM.render(<App />, mountNode);