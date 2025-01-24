'use client'

import "./globals.css";
import React, { useEffect, useState } from 'react';
import {
    Page
} from '@patternfly/react-core';
import AppMasthead from './containers/Masthead';
import AppSidebar from './containers/Sidebar';
import AppNotificationDrawer from "./containers/NotificationDrawer";
import AuthProvider, { useAuth } from "./components/AuthProvider";
import apiClient, { configureHeaders } from "./components/ApiClient";

export default function RootLayout({ children }: { children: React.ReactNode }) {

    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = React.useState(false);
    const onCloseNotificationDrawer = (event: any) => {setIsNotificationDrawerOpen((prevState) => !prevState);};
    const [backendNotificationGroupExpanded, setBackendNotificationGroupExpanded] = React.useState(false);
    const [subscriptionNotificationGroupExpanded, setSubscriptionNotificationGroupExpanded] = React.useState(false);
    const [userProfile, setUserProfile] = React.useState(null);

    /* Backend Notification Management */
    const [backendNotifications, setBackendNotifications] = React.useState(() => {
        if (typeof window !== 'undefined') {
            const savedBackendNotifications = localStorage.getItem('backend_notifications');
            return savedBackendNotifications
                ? JSON.parse(savedBackendNotifications)
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

    /* Subscription Notification Management */
    const [subscriptionNotifications, setSubscriptionNotifications] = React.useState(() => {
        if (typeof window !== 'undefined') {
            const savedSubscriptionNotifications = localStorage.getItem('subscription_notifications');
            return savedSubscriptionNotifications
                ? JSON.parse(savedSubscriptionNotifications)
                : [
                    {
                        id: -1,
                        title: 'Initializing...',
                        description: 'Fetching subscription status...',
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
                    description: 'Fetching subscription status...',
                    severity: 'info',
                    timestamp: new Date().toISOString(),
                    read: false,
                }
            ];
        }
    });

    React.useEffect(() => {
        localStorage.setItem('subscription_notifications', JSON.stringify(subscriptionNotifications));
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
                    subscriptionNotifications={subscriptionNotifications}
                    setSubscriptionNotifications={setSubscriptionNotifications}
                    isNotificationDrawerOpen={isNotificationDrawerOpen}
                    onCloseNotificationDrawer={onCloseNotificationDrawer}
                    userProfile={userProfile}
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
                    setSubscriptionNotificationGroupExpanded={setSubscriptionNotificationGroupExpanded}
                    subscriptionNotificationGroupExpanded={subscriptionNotificationGroupExpanded}
                    subscriptionNotifications={subscriptionNotifications}
                    setSubscriptionNotifications={setSubscriptionNotifications}
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
