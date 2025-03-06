import apiClient from '../components/ApiClient';

import React, { useState } from 'react';
import {
    NotificationDrawer,
    NotificationDrawerBody,
    NotificationDrawerHeader,
    NotificationDrawerGroup,
    NotificationDrawerGroupList,
    NotificationDrawerList,
    NotificationDrawerListItem,
    NotificationDrawerListItemProps,
    NotificationDrawerListItemBody,
    NotificationDrawerListItemHeader,
} from '@patternfly/react-core';

export default function AppNotificationDrawer(
    {
        onCloseNotificationDrawer,
        isNotificationDrawerOpen,
        backendNotificationGroupExpanded,
        setBackendNotificationGroupExpanded,
        backendNotifications,
        setBackendNotifications,
        subscriptionNotificationGroupExpanded,
        setSubscriptionNotificationGroupExpanded,
        subscriptionNotifications,
        setSubscriptionNotifications,
    }
){

    /* Backend Notification State Management */
    const toggleBackendDrawer = (_event, value) => {
        setBackendNotificationGroupExpanded(value);
    };

    const toggleBackendNotificationReadState = (id) => {
        setBackendNotifications((prevNotifications) =>
            prevNotifications.id === id
                ? { ...prevNotifications, read: !prevNotifications.read }
                : prevNotifications
        );
    };

    /* Subscription Notification State Management */
    const toggleSubscriptionDrawer = (_event, value) => {
        setSubscriptionNotificationGroupExpanded(value);
    };

    const toggleSubscriptionNotificationReadState = (id) => {
        setSubscriptionNotifications((prevNotifications) =>
            prevNotifications.id === id
                ? { ...prevNotifications, read: !prevNotifications.read }
                : prevNotifications
        );
    };


    return (
        <NotificationDrawer>
            <NotificationDrawerHeader onClose={onCloseNotificationDrawer} />
            <NotificationDrawerBody>
                <NotificationDrawerGroupList>
                    <NotificationDrawerGroup
                        isExpanded={backendNotificationGroupExpanded}
                        onExpand={toggleBackendDrawer}
                        title={"Backend Notifications"}
                        count={backendNotifications.read ? 0 : 1}
                    >
                        <NotificationDrawerList
                            isHidden={!backendNotificationGroupExpanded}
                            aria-label="Backend Notifications"
                        >
                            {backendNotifications ? (
                                <NotificationDrawerListItem
                                    variant={backendNotifications.severity}
                                    isRead={backendNotifications.read}
                                    onClick={() => toggleBackendNotificationReadState(backendNotifications.id)}
                                    key={backendNotifications.id}
                                    tabIndex={backendNotifications.id}
                                >
                                    <NotificationDrawerListItemHeader
                                        title={backendNotifications.title}
                                        variant={backendNotifications.severity}
                                    />
                                    <NotificationDrawerListItemBody
                                        timestamp={backendNotifications.timestamp}
                                    >
                                        {backendNotifications.description}
                                    </NotificationDrawerListItemBody>
                                </NotificationDrawerListItem>
                            ) : (
                                <NotificationDrawerListItem
                                    variant="success"
                                >
                                    <NotificationDrawerListItemHeader
                                        title="No new notifications"
                                        variant="success"
                                    />
                                    <NotificationDrawerListItemBody
                                        timestamp={new Date().toISOString()}
                                    >
                                        No new notifications.
                                    </NotificationDrawerListItemBody>
                                </NotificationDrawerListItem>
                            )}
                        </NotificationDrawerList>
                    </NotificationDrawerGroup>
                    <NotificationDrawerGroup
                        isExpanded={subscriptionNotificationGroupExpanded}
                        onExpand={toggleSubscriptionDrawer}
                        title={"Subscription Notifications"}
                        count={subscriptionNotifications.read ? 0 : 1}
                    >
                        <NotificationDrawerList
                            isHidden={!subscriptionNotificationGroupExpanded}
                            aria-label="Subscription Notifications"
                        >
                            {subscriptionNotifications ? (
                                <NotificationDrawerListItem
                                    variant={subscriptionNotifications.severity}
                                    isRead={subscriptionNotifications.read}
                                    onClick={() => toggleSubscriptionNotificationReadState(subscriptionNotifications.id)}
                                    key={subscriptionNotifications.id}
                                    tabIndex={subscriptionNotifications.id}
                                >
                                    <NotificationDrawerListItemHeader
                                        title={subscriptionNotifications.title}
                                        variant={subscriptionNotifications.severity}
                                    />
                                    <NotificationDrawerListItemBody
                                        timestamp={subscriptionNotifications.timestamp}
                                    >
                                        {subscriptionNotifications.description}
                                    </NotificationDrawerListItemBody>
                                </NotificationDrawerListItem>
                            ) : (
                                <NotificationDrawerListItem
                                    variant="success"
                                >
                                    <NotificationDrawerListItemHeader
                                        title="No new notifications"
                                        variant="success"
                                    />
                                    <NotificationDrawerListItemBody
                                        timestamp={new Date().toISOString()}
                                    >
                                        No new notifications.
                                    </NotificationDrawerListItemBody>
                                </NotificationDrawerListItem>
                            )}
                        </NotificationDrawerList>
                    </NotificationDrawerGroup>
                </NotificationDrawerGroupList>
            </NotificationDrawerBody>
        </NotificationDrawer>
    );
}
