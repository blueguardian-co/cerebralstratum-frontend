'use client'

import "./globals.css";
import React, { useState } from 'react';
import {
    Page
} from '@patternfly/react-core';
import AppMasthead from './containers/Masthead';
import AppSidebar from './containers/Sidebar';
import AuthProvider from "./components/AuthProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {

    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <html lang="en">
        <body>
        <AuthProvider>
        <Page
            masthead={ <AppMasthead isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} /> }
            sidebar={ <AppSidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} /> }
        >
            {children}
        </Page>
        </AuthProvider>
        </body>
        </html>
    );
}
