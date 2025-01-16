'use client'
import React, { useState } from 'react';
import {
    Page,
    PageSidebar,
    PageSidebarBody,
    Nav,
    NavList,
    NavItem,
} from '@patternfly/react-core';

export default function AppSidebar({ isSidebarOpen, setSidebarOpen }) {
    return (
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
}