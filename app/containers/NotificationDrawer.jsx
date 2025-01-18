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
    }
){

    const toggleBackendDrawer = (_event, value) => {
        setBackendNotificationGroupExpanded(value);
    };

    const toggleReadState = (id) => {
        setBackendNotifications((prevNotifications) =>
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
                                            onClick={() => toggleReadState(notification.id)}
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
                                                {notification.body}
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
                                        variant="sucess"
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
