import React from "react";
import {useRecoilState, useSetRecoilState} from "recoil";
import "../App.css";
import {Container, Form, FormControl, Navbar} from "react-bootstrap";
import {iguanaClickedAtom, searchSubmitAtom, searchTextAtom} from "../atoms";


function AppNavbar() {
    const [searchText, setSearchText] = useRecoilState(searchTextAtom);
    const setSubmit = useSetRecoilState(searchSubmitAtom);
    const [iguanaClicked, setIguanaClicked] = useRecoilState(iguanaClickedAtom);

    return <>
        <Navbar className="p-0 pb-2">
            <Container>
                <Form className="d-flex" onSubmit={() => {
                    setSubmit(true);
                }}>
                    <FormControl
                        type="search"
                        placeholder="Search"
                        className="me-2"
                        aria-label="Search"
                        onChange={(e) => {
                            setSearchText(e.target.value);
                        }}
                        value={searchText}

                    />
                </Form>
                <Container className="" onClick={() => {
                    setIguanaClicked(!iguanaClicked);
                }}>
                    <Navbar.Brand>
                        <img
                            src="/logo.svg"
                            width="50"
                            height="50"
                            className="d-inline-block align-top"
                            alt="Iguana"
                        />
                    </Navbar.Brand>
                </Container>
            </Container>
        </Navbar>
    </>


}

export default AppNavbar;
