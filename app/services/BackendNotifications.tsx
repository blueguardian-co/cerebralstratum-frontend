import React, { useEffect } from "react";
import apiClient, { configureHeaders } from "../components/ApiClient";
import { useAuth } from "../components/AuthProvider";

export default function BackendNotificationService({ backendNotifications, setBackendNotifications }) {
    const { token } = useAuth();

    useEffect(() => {
        const fetchBackendNotifications = async () => {
            if (backendNotifications[0].title === 'Initializing...') {
                console.log('Backend notifications are initialising.');
                return;
            }
            try {
                // Configure headers dynamically with the token
                configureHeaders(token);
                const response = await apiClient.get('/q/health');
                if (response.status !== 200) {
                    setBackendNotifications(
                        [
                            {
                                id: 0,
                                title: 'Connection to the backend is unhealthy',
                                description: 'There is something degrading the connection with the backend.',
                                severity: 'warning',
                                timestamp: new Date().toISOString(),
                                read: false,
                            }
                        ]
                    );
                } else {
                    setBackendNotifications(
                        [
                            {
                                id: 0,
                                title: 'Backend online',
                                description: 'Successfully connected to the backend.',
                                severity: 'success',
                                timestamp: new Date().toISOString(),
                                read: false,
                            }
                        ]
                    );
                }
            } catch(error) {
                setBackendNotifications(
                    [
                        {
                            id: 0,
                            title: 'Error connecting to the backend',
                            description: 'There is an error when connecting to the backend.',
                            severity: 'warning',
                            timestamp: new Date().toISOString(),
                            read: false,
                        }
                    ]
                );
                console.error('Error fetching backend notifications:', error);
            }
        };
        fetchBackendNotifications();
    }, [token, setBackendNotifications]);
    return null;
};