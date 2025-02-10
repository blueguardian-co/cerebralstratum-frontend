'use client'

import "./globals.css";
import React, { useEffect, useState } from 'react';
import {
    Page
} from '@patternfly/react-core';
import AppMasthead from './containers/Masthead';
import AppSidebar from './containers/Sidebar';
import AppNotificationDrawer from "./containers/NotificationDrawer";
import AuthProvider from "./providers/AuthProvider";
import MyDevicesProvider from "./providers/MyDevices";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const [isDarkThemeEnabled, setDarkThemeEnabled] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = React.useState(false);
    const onCloseNotificationDrawer = (event: any) => {setIsNotificationDrawerOpen((prevState) => !prevState);};
    const [backendNotificationGroupExpanded, setBackendNotificationGroupExpanded] = React.useState(false);
    const [subscriptionNotificationGroupExpanded, setSubscriptionNotificationGroupExpanded] = React.useState(false);
    const [userProfile, setUserProfile] = React.useState(null);

    /*
    * Handle Dark Theme
    * Credit: https://sreetamdas.com/blog/the-perfect-dark-mode
    */
    const getMediaQueryPreference = () => {
        const mediaQuery = "(prefers-color-scheme: dark)";
        const mql = window.matchMedia(mediaQuery);
        const hasPreference = typeof mql.matches === "boolean";
        if (hasPreference) {
            return mql.matches ? "dark" : "light";
        }
    };
    const storeUserSetPreference = (pref: string): void => {
        localStorage.setItem("theme", pref);
    };
    const getUserSetPreference = (): string | null => {
        return localStorage.getItem("theme");
    };
    useEffect(() => {
        const userSetPreference: string | null = getUserSetPreference();
        if (userSetPreference !== null) {
            setDarkThemeEnabled(userSetPreference === "dark" ? true : false);
        } else {
            const mediaQueryPreference = getMediaQueryPreference();
            setDarkThemeEnabled(mediaQueryPreference === "dark" ? true : false );
        }
    }, []);
    
    useEffect(() => {
        if (typeof isDarkThemeEnabled !== "undefined") {
            if (isDarkThemeEnabled) {
                storeUserSetPreference("dark");
            } else {
                storeUserSetPreference("light");
            }
        }
    }, [isDarkThemeEnabled]);

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
        isDarkThemeEnabled ?
            <html lang="en" className={"pf-v6-theme-dark"}>
            <body>
            <AuthProvider>
                <MyDevicesProvider>
                    <Page
                        masthead={
                            <AppMasthead
                                isDarkThemeEnabled={isDarkThemeEnabled}
                                setDarkThemeEnabled={setDarkThemeEnabled}
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
                </MyDevicesProvider>
            </AuthProvider>
            </body>
            </html>
        :
            <html lang="en">
            <body>
            <AuthProvider>
                <MyDevicesProvider>
                    <Page
                        masthead={
                            <AppMasthead
                                isDarkThemeEnabled={isDarkThemeEnabled}
                                setDarkThemeEnabled={setDarkThemeEnabled}
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
                </MyDevicesProvider>
            </AuthProvider>
            </body>
            </html>
    );
}
