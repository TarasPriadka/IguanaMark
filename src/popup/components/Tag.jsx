import React, {useEffect, useState} from "react";
import {Badge} from "react-bootstrap";
import {IconContext} from "react-icons";
import {GrFormClose} from "react-icons/all";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import "../App.css";
import {searchTextAtom, tagColorsAtom} from "../atoms";
import OutsideHandler from "./ClickOutside"

export function Tag(props) {
    const [colors, setColors] = useRecoilState(tagColorsAtom)
    const [myColor, setMyColor] = useState(colors["Default"]);
    const setSearchText = useSetRecoilState(searchTextAtom);
    let removeIcon = <></>
    if (props.removeTag) {
        removeIcon = (<IconContext.Provider
            value={{color: 'white'}}
        >
            <GrFormClose
                className="tag-button-close"
                onClick={() => {
                    props.removeTag(props.name)
                }}
            />
        </IconContext.Provider>)
    }

    const randomColor = () => {
        function randomRGB() {
            return [
                Math.floor(Math.random() * 0xFF),
                Math.floor(Math.random() * 0xFF),
                Math.floor(Math.random() * 0xFF)
            ]
        }

        /**
         * Luminosity measure for a given rgb value.
         * Used for contrast measure between colors.
         */
        function lum(r, g, b) {
            return .2126 * Math.pow(r / 255, 2.4)
                + .7152 * Math.pow(g / 255, 2.4)
                + .0722 * Math.pow(b / 255, 2.4);
        }

        // High and low thresholds for luminosity
        // to prevent too dark or too light colors
        const LUM_LOW = .01, LUM_HIGH = .5;

        let r = 255, g = 255, b = 255;
        let l = 1;
        while (l < LUM_LOW || l > LUM_HIGH) {
            [r, g, b] = randomRGB();
            l = lum(r, g, b);
        }
        return `rgb(${r}, ${g}, ${b})`
    };

    useEffect(() => {
        if (!(props.name in colors)) {
            let newColor = randomColor();
            setColors(currentColors => {
                let newColors = {
                    ...currentColors
                }
                newColors[props.name] = newColor;
                return newColors;
            });
            setMyColor(newColor);

        } else {
            setMyColor(colors[props.name]);
        }
    }, [props.name, setColors, colors]);

    return <Badge pill className="tag"
                  ref={(node) => {
                      if (node) {
                          node.style.setProperty("background-color", myColor, "important");
                      }
                  }}
    >
        <span onClick={() => {
            setSearchText(props.name)
        }}> {props.name} </span>

        {removeIcon}
    </Badge>
}

/**
 * Add new Tags button
 * @param props props including addTag method
 * @returns {JSX.Element}
 * @constructor
 */
export function PlusTag(props) {

    const colors = useRecoilValue(tagColorsAtom)
    const [creatingTag, setCreatingTag] = useState(false);
    const [newTagName, setNewTagName] = useState("");

    let color = colors["+"];

    return <Badge pill className={`tag ${creatingTag ? "pt-0" : ""}`}
                  ref={(node) => {
                      if (node) {
                          node.style.setProperty("background-color", color, "important");
                      }
                  }}
                  onClick={() => {
                      setCreatingTag(true)
                  }}
    >
        {creatingTag ?
            <OutsideHandler
                onOutside={() => {
                    if (newTagName !== "") {
                        props.addTag(newTagName);
                    }

                    setCreatingTag(false);
                    setNewTagName("");
                }}
            >
                <form
                    onSubmit={() => {
                        props.addTag(newTagName);
                        setNewTagName("");
                        setCreatingTag(false);
                    }}>
                    <input
                        className="tag-creation sleek-input"
                        placeholder="New Tag"
                        value={newTagName}
                        onChange={(event => setNewTagName(event.target.value))}

                    />
                </form>
            </OutsideHandler>
            : <div className="tag-inside">+</div>
        }

    </Badge>
}