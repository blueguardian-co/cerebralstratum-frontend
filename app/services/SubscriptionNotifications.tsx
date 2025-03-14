import { useEffect } from "react";

type SubscriptionNotification = {
    id: number,
    title: string,
    description: string,
    severity: 'success' | 'warning' | 'info',
    timestamp: string,
    read: boolean,
}

type BackendUserProfile = {
    keycloak_user_id: string;
    keycloak_org_id: string;
    created: Date;
    subscription_active: boolean;
    subscription_discount: number;
    subscription_entitlement: number;
    subscription_used: number;
}

type SubscriptionNotificationServiceProps = {
    subscriptionNotifications: SubscriptionNotification;
    setSubscriptionNotifications: React.Dispatch<React.SetStateAction<SubscriptionNotification>>;
    backendUserProfile: BackendUserProfile;
};

export default function SubscriptionNotificationService(
    { subscriptionNotifications, setSubscriptionNotifications, backendUserProfile }: SubscriptionNotificationServiceProps
) {
    useEffect(() => {
        let mounted = true;

        const fetchSubscriptionNotifications = async () => {
            if (!mounted || backendUserProfile === null) return;

            try {
                if (backendUserProfile.subscription_entitlement <= backendUserProfile.subscription_used) {
                    setSubscriptionNotifications(
                        {
                            id: 0,
                            title: "Subscription utilisation",
                            description: "You have used (" + backendUserProfile.subscription_used + "/" + backendUserProfile.subscription_entitlement + ") of your subscription entitlement.",
                            severity: ((backendUserProfile.subscription_used / backendUserProfile.subscription_entitlement) * 100) >= 80 ? 'warning' : 'info',
                            timestamp: new Date().toDateString(),
                            read: subscriptionNotifications.read ? true : false,
                        }
                    )
                    return;
                }
                if (subscriptionNotifications.title === 'Subscription fully utilised') {
                    if (backendUserProfile.subscription_entitlement >= backendUserProfile.subscription_used) {
                        setSubscriptionNotifications(
                            {
                                id: 0,
                                title: "Subscription utilisation",
                                description: "You have used (" + backendUserProfile.subscription_used + "/" + backendUserProfile.subscription_entitlement + ") of your subscription entitlement.",
                                severity: 'info',
                                timestamp: new Date().toDateString(),
                                read: false,
                            }
                        )
                    }
                    return;
                }
                if (subscriptionNotifications.title === 'Subscription utilisation') {
                    if (backendUserProfile.subscription_entitlement === backendUserProfile.subscription_used) {
                        setSubscriptionNotifications(
                            {
                                id: 0,
                                title: "Subscription fully utilised",
                                description: "You have used your full subscription entitlement (" + backendUserProfile.subscription_used + " of " + backendUserProfile.subscription_entitlement + ").",
                                severity: 'warning',
                                timestamp: new Date().toDateString(),
                                read: false,
                            }
                        )
                    }
                    return;
                }
            } catch (error) {
                if (!mounted) return;
                console.error('Error fetching subscription notifications:', error);
                return;
            }
        }
        fetchSubscriptionNotifications();

        return () => {
            mounted = false;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [backendUserProfile]);
    return null;
};