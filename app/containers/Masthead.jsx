'use client'

import React, { useState, useContext } from 'react';
import {
    Toolbar,
    ToolbarItem,
    ToolbarGroup,
    ToolbarContent,
    SearchInput,
    Page,
    PageSidebar,
    PageSidebarBody,
    PageToggleButton,
    Masthead,
    MastheadMain,
    MastheadToggle,
    MastheadLogo,
    MastheadBrand,
    MastheadContent,
    Nav,
    NavList,
    NavItem,
    ContentVariants,
    Content,
    Button,
    Avatar
} from '@patternfly/react-core';
import BarsIcon from '@patternfly/react-icons/dist/esm/icons/bars-icon';
import { useAuth } from "../components/AuthProvider";

/* TODO:
- Neaten up CSS for Masthead to have it more consistent
*/
export default function AppMasthead({ isSidebarOpen, setSidebarOpen }) {
    const { isAuthenticated, token, user, login, logout, keycloak } = useAuth();

    if (!isAuthenticated) {
        return(
            <Masthead id="page-masthead">
                <MastheadMain>
                    {/*<MastheadToggle>*/}
                    {/*    <PageToggleButton*/}
                    {/*        aria-label="Global navigation"*/}
                    {/*        variant="plain"*/}
                    {/*        onClick={() => setSidebarOpen(!isSidebarOpen)}*/}
                    {/*    >*/}
                    {/*        <BarsIcon />*/}
                    {/*    </PageToggleButton>*/}
                    {/*</MastheadToggle>*/}
                    <MastheadBrand>
                        <MastheadLogo component="a">BLUEGUARDIAN CO</MastheadLogo>
                    </MastheadBrand>
                </MastheadMain>
                <MastheadContent>
                    <Toolbar id="masthead-toolbar">
                        <ToolbarContent>
                            <ToolbarGroup align={{ default: 'alignEnd' }}>
                                <ToolbarItem>
                                    <Button onClick={login} variant="primary" ouiaId="LoginButton">Login</Button>
                                </ToolbarItem>
                            </ToolbarGroup>
                        </ToolbarContent>
                    </Toolbar>
                </MastheadContent>
            </Masthead>
        );
    }
    if (isAuthenticated) {
        return (
            <Masthead id="page-masthead">
                <MastheadMain>
                    {/*<MastheadToggle>*/}
                    {/*    <PageToggleButton*/}
                    {/*        aria-label="Global navigation"*/}
                    {/*        variant="plain"*/}
                    {/*        onClick={() => setSidebarOpen(!isSidebarOpen)}*/}
                    {/*    >*/}
                    {/*        <BarsIcon />*/}
                    {/*    </PageToggleButton>*/}
                    {/*</MastheadToggle>*/}
                    <MastheadBrand>
                        <MastheadLogo>BLUEGUARDIAN CO</MastheadLogo>
                    </MastheadBrand>
                </MastheadMain>
                <MastheadContent>
                    <Toolbar id="masthead-toolbar">
                        <ToolbarContent>
                            <ToolbarGroup align={{default: 'alignStart'}}>
                                <ToolbarContent>
                                    <ToolbarItem>
                                        <SearchInput placeholder="Filter by device name"/>
                                    </ToolbarItem>
                                    <ToolbarItem>
                                        <Button variant="primary" ouiaId="DeviceRegistrationButton">
                                            Register Device
                                        </Button>
                                    </ToolbarItem>
                                </ToolbarContent>
                            </ToolbarGroup>
                            <ToolbarGroup align={{default: 'alignEnd'}}>
                                <ToolbarItem>
                                    <Content>
                                        {user?.given_name} {user?.family_name}
                                    </Content>
                                    <Avatar
                                        src="https://www.patternfly.org/images/668560cd.svg"
                                        alt="User's avatar"/>
                                </ToolbarItem>
                                <ToolbarItem>
                                    <Button onClick={logout} variant="primary" ouiaId="LogoutButton">Logout</Button>
                                </ToolbarItem>
                            </ToolbarGroup>
                        </ToolbarContent>
                    </Toolbar>
                </MastheadContent>
            </Masthead>
        );
    }
}