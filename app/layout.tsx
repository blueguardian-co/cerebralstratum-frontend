'use client'

import "./globals.css";
import React, { useState } from 'react';
import {
    Page
} from '@patternfly/react-core';
import AppMasthead from './containers/Masthead';
import AppSidebar from './containers/Sidebar';
import AppNotificationDrawer from "./containers/NotificationDrawer";
import AuthProvider from "./components/AuthProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {

    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = React.useState(false);
    const onCloseNotificationDrawer = (event) => {setIsNotificationDrawerOpen((prevState) => !prevState);};
    const [backendNotificationGroupExpanded, setBackendNotificationGroupExpanded] = React.useState(false);
    const [backendNotifications, setBackendNotifications] = React.useState(() => {
        if (typeof window !== 'undefined') {
            const savedNotifications = localStorage.getItem('backend_notifications');
            return savedNotifications
                ? JSON.parse(savedNotifications)
                : [
                    {
                        id: -1,
                        title: 'Initializing...',
                        description: 'Fetching backend status...',
                        severity: 'info',
                        timestamp: new Date().toISOString(),
                        read: false,
                    }
                ];
        } else {
            return [
                {
                    id: -1,
                    title: 'Initializing...',
                    description: 'Fetching backend status...',
                    severity: 'info',
                    timestamp: new Date().toISOString(),
                    read: false,
                }
            ];
        }
    });

    React.useEffect(() => {
        localStorage.setItem('backend_notifications', JSON.stringify(backendNotifications));
    }, [backendNotifications]);
    
    return (
        <html lang="en">
        <body>
        <AuthProvider>
        <Page
            masthead={
                <AppMasthead
                    isSidebarOpen={isSidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    backendNotifications={backendNotifications}
                    setBackendNotifications={setBackendNotifications}
                    isNotificationDrawerOpen={isNotificationDrawerOpen}
                    setIsNotificationDrawerOpen={setIsNotificationDrawerOpen}
                    onCloseNotificationDrawer={onCloseNotificationDrawer}
                />
            }
            sidebar={
                <AppSidebar
                    isSidebarOpen={isSidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />
            }
            notificationDrawer={
                isNotificationDrawerOpen && (
                <AppNotificationDrawer
                    onCloseNotificationDrawer={onCloseNotificationDrawer}
                    isNotificationDrawerOpen={isNotificationDrawerOpen}
                    backendNotificationGroupExpanded={backendNotificationGroupExpanded}
                    setBackendNotificationGroupExpanded={setBackendNotificationGroupExpanded}
                    backendNotifications={backendNotifications}
                    setBackendNotifications={setBackendNotifications}
                />)
            }
            isNotificationDrawerExpanded={isNotificationDrawerOpen}
        >
            {children}
        </Page>
        </AuthProvider>
        </body>
        </html>
    );
}
