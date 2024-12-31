'use client'

import "./globals.css";
import React, { useState } from 'react';
import {
    Page,
    PageSidebar,
    PageSidebarBody,
    Nav,
    NavList,
    NavItem,
} from '@patternfly/react-core';
import BarsIcon from '@patternfly/react-icons/dist/esm/icons/bars-icon';
import AppMasthead from './containers/Masthead';

export default function RootLayout({ children }: { children: React.ReactNode }) {

    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const AppSidebar = (
        <PageSidebar isSidebarOpen={isSidebarOpen}>
            <PageSidebarBody>
                <Nav ouiaId={0}>
                    <NavList>
                        <NavItem to="/" ouiaId={0} itemId={0} isActive={true}>
                            Map
                        </NavItem>
                    </NavList>
                </Nav>
            </PageSidebarBody>
        </PageSidebar>
    );

    return (
        <html lang="en">
        <body>
        <Page
            masthead={ AppMasthead( { isSidebarOpen, setSidebarOpen }) }
            sidebar={ AppSidebar }
        >
            {children}
        </Page>
        </body>
        </html>
    );
}
