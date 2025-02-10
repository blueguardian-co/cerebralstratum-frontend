'use client'

import { useAuth } from "../providers/AuthProvider";
import AppNotificationDrawer from "./NotificationDrawer";
import BackendNotificationService from "../services/BackendNotifications";
import SubscriptionNotificationService from "../services/SubscriptionNotifications";
import DeviceFilter from "./DeviceFilter";
import React, { useState, useContext, useEffect } from 'react';
import {
    Toolbar,
    ToolbarItem,
    ToolbarGroup,
    ToolbarContent,
    ToggleGroup,
    ToggleGroupItem,
    Page,
    PageSidebar,
    PageSidebarBody,
    PageToggleButton,
    NotificationBadge,
    NotificationBadgeVariant,
    MenuToggle,
    MenuToggleElement,
    Masthead,
    MastheadMain,
    MastheadToggle,
    MastheadLogo,
    MastheadBrand,
    MastheadContent,
    Nav,
    NavList,
    NavItem,
    Level,
    LevelItem,
    Icon,
    Dropdown,
    DropdownItem,
    DropdownList,
    ContentVariants,
    Content,
    Brand,
    Button,
    Avatar
} from '@patternfly/react-core';

import BarsIcon from '@patternfly/react-icons/dist/esm/icons/bars-icon';
import BellIcon from '@patternfly/react-icons/dist/esm/icons/bell-icon';
import MoonIcon from '@patternfly/react-icons/dist/esm/icons/moon-icon';
import SunIcon from '@patternfly/react-icons/dist/esm/icons/sun-icon';
import MicrochipIcon from '@patternfly/react-icons/dist/esm/icons/microchip-icon';

import Image from 'next/image';

/* TODO:
- Neaten up CSS for Masthead to have it more consistent
*/

function countUnreadNotifications(backendNotifications, subscriptionNotifications) {
    const backendUnreadCount = backendNotifications.filter(notification => !notification.read).length;
    const subscriptionUnreadCount = subscriptionNotifications.filter(notification => !notification.read).length;
    return backendUnreadCount + subscriptionUnreadCount;
}

function isSubscriptionEntitlementExhausted(userProfile) {
    if (userProfile === null ) {
        return true;
    }
    if (userProfile.subscription_entitlement >= userProfile.subscription_used){
        return false;
    }
    return true;
}

export default function AppMasthead(
    {
        isDarkThemeEnabled,
        setDarkThemeEnabled,
        isSidebarOpen,
        setSidebarOpen,
        isNotificationDrawerOpen,
        onCloseNotificationDrawer,
        backendNotifications,
        setBackendNotifications,
        subscriptionNotifications,
        setSubscriptionNotifications,
        userProfile,
    }
) {
    const { isAuthenticated, user, login, logout } = useAuth();
    const [isAccountOpen, setIsAccountOpen] = React.useState(false);
    const [isDeviceOpen, setIsDeviceOpen] = React.useState(false);

    const onAccountToggleClick = () => {
        setIsAccountOpen(!isAccountOpen);
    };
    const onDeviceToggleClick = () => {
        setIsDeviceOpen(!isDeviceOpen);
    };

    const onDarkThemeToggleClick = () => {
        setDarkThemeEnabled(!isDarkThemeEnabled);
    };

    if (!isAuthenticated) {
        return(
            <Masthead id="page-masthead">
                <MastheadMain>
                    <MastheadBrand>
                        <MastheadLogo>
                            <Brand
                                src={
                                    isDarkThemeEnabled
                                    ? "/cerebral-stratum-darkmode-full.png"
                                    : "/cerebral-stratum-lightmode-full.png"
                                }
                                alt="CEREBRAL STRATUM Logo"
                                widths={{ default: '350px' }}
                                heights={{ default: '50px' }}
                            />
                        </MastheadLogo>
                    </MastheadBrand>
                </MastheadMain>
                <MastheadContent>
                    <Toolbar id="masthead-toolbar" isFullHeight={true}>
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
        React.useEffect(() => {
            const backendUserProfile = async () => {
                await BackendUserProfile
            };
        });

        const [avatarUrl, setAvatarUrl] = useState( "https://www.gravatar.com/avatar/?s=50&d=identicon");

        const getGravatarUrl = async (email) => {
            if (!email) return "https://www.gravatar.com/avatar/?s=50%d=identicon";

            const encoder = new TextEncoder();
            const emailBytes = encoder.encode(email.trim().toLowerCase());
            const hashBuffer = await crypto.subtle.digest('SHA-256', emailBytes);

            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

            return `https://www.gravatar.com/avatar/${hashHex}?s=50&d=identicon`;
        };

        useEffect(() => {
            if (user?.email) {
                const generateAvatarUrl = async () => {
                    const url = await getGravatarUrl(user.email);
                    setAvatarUrl(url);
                };
                generateAvatarUrl();
            }
        }, [isAuthenticated, user?.email]);

        return (
            <Masthead id="page-masthead">
                <MastheadMain>
                    <MastheadLogo>
                        <Brand
                            src={
                                isDarkThemeEnabled
                                    ? "/cerebral-stratum-darkmode-full.png"
                                    : "/cerebral-stratum-lightmode-full.png"
                            }
                            alt="CEREBRAL STRATUM Logo"
                            widths={{ default: '300px' }}
                            heights={{ default: '50px' }}
                        />
                    </MastheadLogo>
                </MastheadMain>
                <MastheadContent>
                    <Toolbar id="masthead-toolbar" isFullHeight={true}>
                        <ToolbarContent>
                            <ToolbarGroup align={{default: 'alignStart'}} alignItems={"center"}>
                                <ToolbarContent>
                                    <ToolbarItem>
                                        <Dropdown
                                            isOpen={isDeviceOpen}
                                            onOpenChange={(isDeviceOpen) => setIsDeviceOpen(isDeviceOpen)}
                                            ouiaId="AccountDropdown"
                                            toggle={(toggleDeviceRef) => (
                                                <MenuToggle
                                                    ref={toggleDeviceRef}
                                                    onClick={onDeviceToggleClick}
                                                    isExpanded={isDeviceOpen}
                                                    icon={<Icon><MicrochipIcon /></Icon>}
                                                >
                                                    <Content>
                                                        Manage Devices
                                                    </Content>
                                                </MenuToggle>
                                            )}
                                            shouldFocusToggleOnSelect
                                        >
                                            <DropdownItem  ouiaId="DeviceRegistrationButton" isDisabled={isSubscriptionEntitlementExhausted(userProfile)}>
                                                Register Device
                                            </DropdownItem>
                                        </Dropdown>
                                    </ToolbarItem>
                                    <ToolbarItem>
                                        <DeviceFilter />
                                    </ToolbarItem>
                                </ToolbarContent>
                            </ToolbarGroup>
                            <ToolbarGroup align={{default: 'alignEnd'}} alignItems={"center"}>
                                <ToolbarItem>
                                    <ToggleGroup aria-label="Dark theme toggle">
                                        <ToggleGroupItem
                                            icon={<SunIcon style={!isDarkThemeEnabled ? {filter: "invert(1)"} : {filter: "invert(0)"}} />}
                                            aria-label={"Light Theme"}
                                            buttonId={"toggle-group-light-theme"}
                                            isSelected={!isDarkThemeEnabled}
                                            onClick={onDarkThemeToggleClick}
                                        />
                                        <ToggleGroupItem
                                            icon={<MoonIcon style={isDarkThemeEnabled ? {filter: "invert(1)"} : {filter: "invert(0)"}} />}
                                            aria-label={"Dark Theme"}
                                            buttonId={"toggle-group-dark-theme"}
                                            isSelected={isDarkThemeEnabled}
                                            onClick={onDarkThemeToggleClick}
                                        />
                                    </ToggleGroup>
                                </ToolbarItem>
                                <ToolbarItem visibility={{ default: 'visible' }} selected={isNotificationDrawerOpen}>
                                    <NotificationBadge
                                        variant={
                                            countUnreadNotifications(backendNotifications, subscriptionNotifications) > 0
                                                ? NotificationBadgeVariant.unread
                                                : NotificationBadgeVariant.read
                                        }
                                        count={countUnreadNotifications(backendNotifications, subscriptionNotifications)}
                                        onClick={onCloseNotificationDrawer}
                                        aria-label="Notifications"
                                        isExpanded={isNotificationDrawerOpen}
                                        ouiaId="NotificationBadge"
                                    >
                                    </NotificationBadge>
                                </ToolbarItem>
                                <ToolbarItem>
                                    <Dropdown
                                        isOpen={isAccountOpen}
                                        onOpenChange={(isAccountOpen) => setIsAccountOpen(isAccountOpen)}
                                        ouiaId="AccountDropdown"
                                        toggle={(toggleAccountRef) => (
                                            <MenuToggle
                                                ref={toggleAccountRef}
                                                onClick={onAccountToggleClick}
                                                isExpanded={isAccountOpen}
                                                icon={<Avatar
                                                    src={avatarUrl}
                                                    alt={`${user?.preferred_username}'s avatar`}
                                                    className={"pf-v6-c-avatar pf-m-sm"}
                                                    style={{verticalAlign: "bottom"}}
                                                    isBordered
                                                />}
                                            >
                                                {user?.given_name} {user?.family_name}
                                            </MenuToggle>
                                        )}
                                        shouldFocusToggleOnSelect
                                    >
                                        <DropdownItem
                                            // Ensure Patternfly styling is inherited
                                            component={(props) =>
                                                <Content
                                                    {...props}
                                                    component={ContentVariants.a}
                                                    href={`${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/account/#/`}
                                                    target="_blank"
                                                    noreferrer="true"
                                                    noopen="true"
                                                    alt={"Access and manage your account. This is an external link."}
                                                >
                                                    Account
                                                </Content>
                                            }
                                        >
                                        </DropdownItem>
                                        <DropdownItem isDisabled={true} ouiaId="ManageSubscriptionButton">
                                            Manage Subscription
                                        </DropdownItem>
                                        <DropdownItem onClick={logout} ouiaId="LogoutButton">
                                            Logout
                                        </DropdownItem>
                                    </Dropdown>
                                </ToolbarItem>
                            </ToolbarGroup>
                        </ToolbarContent>
                    </Toolbar>
                </MastheadContent>
                <BackendNotificationService
                    backendNotifications={backendNotifications}
                    setBackendNotifications={setBackendNotifications}
                />
                <SubscriptionNotificationService
                    subscriptionNotifications={subscriptionNotifications}
                    setSubscriptionNotifications={setSubscriptionNotifications}
                    userProfile={userProfile}
                />
            </Masthead>
        );
    }
}