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

    return (
        <NotificationDrawer>
            <NotificationDrawerHeader onClose={onCloseNotificationDrawer} />
            <NotificationDrawerBody>
                <NotificationDrawerGroupList>
                    <NotificationDrawerGroup
                        isExpanded={backendNotificationGroupExpanded}
                        onExpand={toggleBackendDrawer}
                        title={"Backend Notifications"}
                        count={backendNotifications.length}
                    >
                        <NotificationDrawerList
                            isHidden={!backendNotificationGroupExpanded}
                            aria-label="Backend Notifications"
                        >
                            {backendNotifications.length > 0 ? (
                                backendNotifications.map((notification) => (
                                        <NotificationDrawerListItem
                                            variant={notification.severity}
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
                                <div style={{ padding: '1rem', color: '#666' }}>No notifications to display</div>
                            )}
                        </NotificationDrawerList>
                    </NotificationDrawerGroup>
                </NotificationDrawerGroupList>
            </NotificationDrawerBody>
        </NotificationDrawer>
    );
}
