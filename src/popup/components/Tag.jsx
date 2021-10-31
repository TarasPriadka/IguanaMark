import React, {useEffect, useState} from "react";
import "../App.css";
import {Badge} from "react-bootstrap";
import {tagColors} from "../atoms";
import {useRecoilState, useRecoilValue} from "recoil";
import {GrFormClose} from "react-icons/all";
import {IconContext} from "react-icons";
import OutsideHandler from "./ClickOutside"

export function Tag(props) {
    const [colors, setColors] = useRecoilState(tagColors)
    const [myColor, setMyColor] = useState(colors["Default"]);
    const [mouseIn, setMouseIn] = useState(false);
    const [closeColor, setCloseColor] = useState("white")

    const randomColor = () => {
        return Math.floor(Math.random() * 16777215).toString(16);
    };

    useEffect(() => {
        if (!(props.name in colors)) {
            let newColor = "#" + randomColor();
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
                  onMouseEnter={() => {
                      setMouseIn(true);
                  }}
                  onMouseLeave={() => {
                      setMouseIn(false);
                  }}
    >
        {props.name}
        <IconContext.Provider
            value={{color: 'white'}}
        >
            <GrFormClose
                className="tag-button-close"
                onClick={() => {
                    props.removeTag(props.name)
                }}
            />
        </IconContext.Provider>

    </Badge>
}


export function PlusTag(props) {

    const colors = useRecoilValue(tagColors)
    const [creatingTag, setCreatingTag] = useState(false);
    const [newTagName, setNewTagName] = useState("");

    let color = colors["+"];

    return <Badge pill className="tag"
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