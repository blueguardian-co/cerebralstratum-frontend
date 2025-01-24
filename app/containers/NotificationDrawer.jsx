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
            prevNotifications.map((notification) =>
                notification.id === id
                    ? { ...notification, read: !notification.read }
                    : notification
            )
        );
    };

    /* Subscription Notification State Management */
    const toggleSubscriptionDrawer = (_event, value) => {
        setSubscriptionNotificationGroupExpanded(value);
    };

    const toggleSubscriptionNotificationReadState = (id) => {
        setSubscriptionNotifications((prevNotifications) =>
            prevNotifications.map((notification) =>
                notification.id === id
                    ? { ...notification, read: !notification.read }
                    : notification
            )
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
                        count={backendNotifications.filter(notification => !notification.read).length}
                    >
                        <NotificationDrawerList
                            isHidden={!backendNotificationGroupExpanded}
                            aria-label="Backend Notifications"
                        >
                            {backendNotifications.length > 0 ? (
                                backendNotifications.map((notification) => (
                                        <NotificationDrawerListItem
                                            variant={notification.severity}
                                            isRead={notification.read}
                                            onClick={() => toggleBackendNotificationReadState(notification.id)}
                                            key={notification.id}
                                            tabIndex={notification.id}
                                        >
                                            <NotificationDrawerListItemHeader
                                                title={notification.title}
                                                variant={notification.severity}
                                            />
                                            <NotificationDrawerListItemBody
                                                timestamp={notification.timestamp}
                                            >
                                                {notification.description}
                                            </NotificationDrawerListItemBody>
                                        </NotificationDrawerListItem>
                                    )
                                )
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
                        count={subscriptionNotifications.filter(notification => !notification.read).length}
                    >
                        <NotificationDrawerList
                            isHidden={!subscriptionNotificationGroupExpanded}
                            aria-label="Subscription Notifications"
                        >
                            {subscriptionNotifications.length > 0 ? (
                                subscriptionNotifications.map((notification) => (
                                        <NotificationDrawerListItem
                                            variant={notification.severity}
                                            isRead={notification.read}
                                            onClick={() => toggleSubscriptionNotificationReadState(notification.id)}
                                            key={notification.id}
                                            tabIndex={notification.id}
                                        >
                                            <NotificationDrawerListItemHeader
                                                title={notification.title}
                                                variant={notification.severity}
                                            />
                                            <NotificationDrawerListItemBody
                                                timestamp={notification.timestamp}
                                            >
                                                {notification.description}
                                            </NotificationDrawerListItemBody>
                                        </NotificationDrawerListItem>
                                    )
                                )
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
