'use client'

import React, { useState } from 'react';
import {
    Toolbar,
    ToolbarItem,
    ToolbarGroup,
    ToolbarContent,
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
    Avatar
} from '@patternfly/react-core';
import BarsIcon from '@patternfly/react-icons/dist/esm/icons/bars-icon';

export default function AppMasthead({ isSidebarOpen, setSidebarOpen }) {
    return (
        <Masthead id="page-masthead">
            <MastheadMain>
                <MastheadToggle>
                    <PageToggleButton
                        aria-label="Global navigation"
                        variant="plain"
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                    >
                        <BarsIcon />
                    </PageToggleButton>
                </MastheadToggle>
                <MastheadBrand>
                    <MastheadLogo component="a">BLUEGUARDIAN CO</MastheadLogo>
                </MastheadBrand>
            </MastheadMain>
            <MastheadContent>
                <Toolbar id="masthead-toolbar">
                    <ToolbarContent>
                        <ToolbarGroup align={{ default: 'alignCenter' }}>
                            <ToolbarItem>
                                <Content component={ContentVariants.h1}>
                                    CEREBRAL STRATUM
                                </Content>
                            </ToolbarItem>
                        </ToolbarGroup>
                        <ToolbarGroup align={{ default: 'alignEnd' }}>
                            <ToolbarItem>
                                <Content>
                                    Bob Jones
                                </Content>
                                <Avatar
                                    src="https://www.patternfly.org/images/668560cd.svg"
                                    alt="User's avatar"/>
                            </ToolbarItem>
                        </ToolbarGroup>
                    </ToolbarContent>
                </Toolbar>
            </MastheadContent>
        </Masthead>
    );
}