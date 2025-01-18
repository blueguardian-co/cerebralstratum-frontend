'use client'

import { useAuth } from "../components/AuthProvider";
import AppNotificationDrawer from "./NotificationDrawer";
import BackendNotificationService from "../services/BackendNotifications";
import React, { useState, useContext, useEffect } from 'react';
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
    Button,
    Avatar
} from '@patternfly/react-core';
import BarsIcon from '@patternfly/react-icons/dist/esm/icons/bars-icon';
import BellIcon from '@patternfly/react-icons/dist/esm/icons/bell-icon';
import { MicrochipIcon } from '@patternfly/react-icons/dist/esm/icons/microchip-icon';

/* TODO:
- Neaten up CSS for Masthead to have it more consistent
*/
export default function AppMasthead(
    {
        isSidebarOpen,
        setSidebarOpen,
        isNotificationDrawerOpen,
        onCloseNotificationDrawer,
        backendNotifications,
        setBackendNotifications
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
                    <Toolbar id="masthead-toolbar" isFullHeight={true}>
                        <ToolbarContent>
                            <ToolbarGroup align={{default: 'alignStart'}}>
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
                                            <DropdownItem  ouiaId="DeviceRegistrationButton">
                                                Register Device
                                            </DropdownItem>
                                        </Dropdown>
                                    </ToolbarItem>
                                    <ToolbarItem>
                                        <SearchInput placeholder="Filter displayed devices"/>
                                    </ToolbarItem>
                                </ToolbarContent>
                            </ToolbarGroup>
                            <ToolbarGroup align={{default: 'alignEnd'}}>
                                <ToolbarItem visibility={{ default: 'visible' }} selected={isNotificationDrawerOpen}>
                                    <NotificationBadge
                                        variant={
                                            backendNotifications.length > 0
                                                ? NotificationBadgeVariant.unread
                                                : NotificationBadgeVariant.read
                                        }
                                        onClick={onCloseNotificationDrawer}
                                        aria-label="Notifications"
                                        isExpanded={isNotificationDrawerOpen}
                                    >
                                        <BellIcon />
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
                                                    size="sm"
                                                />
                                                }
                                            >
                                                <Content>
                                                    {user?.given_name} {user?.family_name}
                                                </Content>
                                            </MenuToggle>
                                        )}
                                        shouldFocusToggleOnSelect
                                    >
                                        <DropdownItem>
                                            <Content
                                                component={ContentVariants.a}
                                                href={`${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/account/#/`}
                                                target="_blank"
                                                noreferrer="true"
                                                noopen="true"
                                                alt={"Access and manage your account. This is an external link."}
                                            >
                                                Account
                                            </Content>
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
            </Masthead>
        );
    }
}