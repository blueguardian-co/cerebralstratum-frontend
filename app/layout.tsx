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
    const onCloseNotificationDrawer = () => {setIsNotificationDrawerOpen((prevState) => !prevState);};
    const [backendNotificationGroupExpanded, setBackendNotificationGroupExpanded] = React.useState(false);
    const [subscriptionNotificationGroupExpanded, setSubscriptionNotificationGroupExpanded] = React.useState(false);
    const [userProfile] = React.useState(null);

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
            setDarkThemeEnabled(userSetPreference === "dark");
        } else {
            const mediaQueryPreference = getMediaQueryPreference();
            setDarkThemeEnabled(mediaQueryPreference === "dark");
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
    const defaultBackendNotification = {
        id: -1,
        title: 'Initialising...',
        description: 'Fetching backend status...',
        severity: 'info',
        timestamp: new Date(),
        read: false,
    };

    const [backendNotifications, setBackendNotifications] = React.useState(() => {
        if (typeof window === 'undefined') return defaultBackendNotification;

        try {
            const saved = localStorage.getItem('backend_notifications');
            return saved ? JSON.parse(saved) : defaultBackendNotification;
        } catch {
            return defaultBackendNotification;
        }
    });

    /* Subscription Notification Management */
    const defaultSubscriptionNotification = {
        id: -1,
        title: 'Initialiding...',
        description: 'Fetching subscription status...',
        severity: 'info',
        timestamp: new Date(),
        read: false,
    };

    const [subscriptionNotifications, setSubscriptionNotifications] = React.useState(() => {
        if (typeof window === 'undefined') return defaultSubscriptionNotification;

        try {
            const saved = localStorage.getItem('subscription_notifications');
            return saved ? JSON.parse(saved) : defaultSubscriptionNotification;
        } catch {
            return defaultSubscriptionNotification;
        }
    });


    React.useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem('backend_notifications', JSON.stringify(backendNotifications));
            localStorage.setItem('subscription_notifications', JSON.stringify(subscriptionNotifications));
        } catch (error) {
            console.error('Error saving notifications to localStorage:', error);
        }
    }, [backendNotifications, subscriptionNotifications]);

    
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
