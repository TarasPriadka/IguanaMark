import React from "react";
import {useRecoilState, useSetRecoilState} from "recoil";
import "../App.css";
import {Container, Form, Navbar} from "react-bootstrap";
import {iguanaClickedAtom, searchSubmitAtom, searchTextAtom} from "../atoms";


function AppNavbar() {
    const [searchText, setSearchText] = useRecoilState(searchTextAtom);
    const setSubmit = useSetRecoilState(searchSubmitAtom);
    const [iguanaClicked, setIguanaClicked] = useRecoilState(iguanaClickedAtom);

    return <Container className="p-1">
        <Navbar className="pb-2">
            <Form className="iguana-search" onSubmit={() => {
                setSubmit(true);
            }}>
                <Form.Control
                    placeholder="Search"
                    type="search"
                    onChange={(e) => {
                        setSearchText(e.target.value);
                    }}
                    value={searchText}
                    className="form-control iguana-searchbar"
                />
            </Form>

            <Navbar.Brand className="p-0 m-0 iguana-logo">
                <img
                    src="/logo.svg"
                    width="45px"
                    height="45px"
                    className="d-inline-block align-top"
                    alt="Iguana"
                />
            </Navbar.Brand>

        </Navbar>
    </Container>
}

export default AppNavbar;
