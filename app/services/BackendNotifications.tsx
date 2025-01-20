import React, { useEffect } from "react";
import apiClient, { configureHeaders } from "../components/ApiClient";
import { useAuth } from "../components/AuthProvider"; // Import `useAuth` here

export default function BackendNotificationService({ backendNotifications, setBackendNotifications }) {
    const { token } = useAuth();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                // Configure headers dynamically with the token
                configureHeaders(token);
                const response = await apiClient.get('/q/health');
                if (response.status !== 200) {
                    const notifications = [
                        {
                            id: 0,
                            title: 'Connection to the backend is unhealthy',
                            description: 'There is something degrading the connection with the backend.',
                            severity: 'warning',
                            timestamp: new Date().toISOString(),
                            read: false,
                        }
                    ]
                } else {
                    const notifications = [
                        {
                            id: 0,
                            title: 'Backend online',
                            description: 'Successfully connected to the backend.',
                            severity: 'success',
                            timestamp: new Date().toISOString(),
                            read: false,
                        }
                    ]
                }
                if (backendNotifications[0].title === 'Initializing...') {
                    if (backendNotifications[0].read === true && backendNotifications[0].title === notifications[0].title) {
                        console.log('No change in backend notifications.');
                        setBackendNotifications(backendNotifications);
                    }
                }
                setBackendNotifications(notifications);
                } catch(error) {
                const notifications = [
                    {
                        id: 0,
                        title: 'Error connecting to the backend',
                        description: 'This is an error when connecting to the backend.',
                        severity: 'warning',
                        timestamp: new Date().toISOString(),
                        read: false,
                    }
                ]
                console.log('backendNotifications', backendNotifications);
                if (backendNotifications[0].read === true && backendNotifications[0].title === notifications[0].title) {
                    console.log('No change in backend notifications.');
                    setBackendNotifications(backendNotifications);
                } else {
                    setBackendNotifications(notifications);
                }
                    console.error('Error fetching backend notifications:', error);
                }
        };

        fetchNotifications();
    }, [token, setBackendNotifications]);
    return null;
};