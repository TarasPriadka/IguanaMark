import React, {useState} from "react";
import "../../App.css";
import {Card, Col, Container, Row} from "react-bootstrap";
import {listItemsAtom, replaceItemAtIndex} from "../../atoms";
import {useRecoilState} from "recoil";
import {AiOutlineFileImage, GrFormClose} from "react-icons/all";
import ListItemTitle from "./ListItemTitle";
import TagBar from "../TagBar";


function ListItem(props) {
    let url = "";
    let favicon = null;

    try {
        url = new URL(props.url)
        favicon = `https://icons.duckduckgo.com/ip2/${url.hostname}.ico`;
    } catch (_) {
    }

    const [listItems, setListItems] = useRecoilState(listItemsAtom);
    const [mouseIn, setMouseIn] = useState(false);

    const updateTitle = (newTitle) => {
        console.log(newTitle);
        let newValue = listItems[props.index]
        const newList = replaceItemAtIndex(listItems, props.index, {
            ...newValue,
            title: newTitle
        });
        setListItems(newList);
    }

    const followLink = () => {
        let newValue = listItems[props.index]
        const newList = replaceItemAtIndex(listItems, props.index, {
            ...newValue,
            tags: newValue.tags.map((tag) => {
                if (tag === "Unread") {
                    return "Read";
                } else {
                    return tag;
                }
            })
        });

        chrome.storage.local.set({
            listItems: newList
        }, () => {
            const newWindow = window.open(url, '_blank', 'noopener, noreferrer')
            if (newWindow) newWindow.opener = null;
        });
    }

    /**
     * React render
     */
    return <>
        <Card className="m-1"
              onMouseEnter={() => {
                  setMouseIn(true);
              }}
              onMouseLeave={() => {
                  setMouseIn(false);
              }}
        >
            <Card.Body className="p-0 m-0">
                <Row className="m-0 p-1">
                    <Col xs={1} className="read-icon-box m-auto px-0">
                        {favicon != null ?
                            <img src={favicon} className="read-icon"/> :
                            <AiOutlineFileImage className="read-icon"/>
                        }
                    </Col>
                    <Col xs={9} className="m-auto p-0">
                        <Container flex className="p-0">
                            <ListItemTitle title={props.title} updateTitle={updateTitle}/>
                            {" "}
                            {url !== "" && mouseIn ?
                                <span>
                                     - <a href={props.url} onClick={followLink}
                                          className="font-weight-light text-secondary"
                                >{url.hostname}</a></span> :
                                <span></span>
                            }

                        </Container>

                    </Col>
                    <Col xs={1} className="p-0">
                        <button variant="outline-secondary" className="list-button p-0 mb-1" onClick={() => {
                            setMouseIn(false);
                            setListItems(prevList => prevList.filter((e, i) => i !== props.index))
                        }}><GrFormClose style={{fontSize: "1.5em"}}/>
                        </button>
                    </Col>
                </Row>
                <Row className="m-auto p-1 mt-0">
                    <TagBar title={props.title} url={props.url} index={props.index}/>
                </Row>
            </Card.Body>
        </Card>
    </>
}

export default ListItem;
