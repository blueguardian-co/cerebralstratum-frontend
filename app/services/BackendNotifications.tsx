import { useEffect } from "react";
import apiClient, { configureHeaders } from "../components/ApiClient";
import { useAuth } from "../providers/AuthProvider";

type BackendNotification = {
    id: number,
    title: string,
    description: string,
    severity: 'success' | 'warning' | 'info',
    timestamp: string,
    read: boolean,
}

type BackendNotificationServiceProps = {
    backendNotifications: BackendNotification[];
    setBackendNotifications: React.Dispatch<React.SetStateAction<BackendNotification[]>>;
};


export default function BackendNotificationService(
    {backendNotifications, setBackendNotifications}: BackendNotificationServiceProps
): null {
    const { token } = useAuth();

    useEffect(() => {
        const fetchBackendNotifications = async () => {
            if (backendNotifications[0].title === 'Initializing...') {
                return;
            }
            try {
                // Configure headers dynamically with the token
                configureHeaders(token);
                const response = await apiClient.get('/q/health/live');
                if (response.status !== 200) {
                    if (backendNotifications[0].title === 'Connection to the backend is unhealthy' && backendNotifications[0].read === true) {
                        return;
                    }
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
                    if (backendNotifications[0].title === 'Backend online' && backendNotifications[0].read === true) {
                        return;
                    }
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
                if (backendNotifications[0].title === 'Error connecting to the backend' && backendNotifications[0].read === true) {
                    return;
                }
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
    }, [token, backendNotifications, setBackendNotifications]);
    return null;
};