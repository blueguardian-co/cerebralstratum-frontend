import { useEffect } from "react";

type SubscriptionNotification = {
    id: number,
    title: string,
    description: string,
    severity: 'success' | 'warning' | 'info',
    timestamp: string,
    read: boolean,
}

type SubscriptionNotificationServiceProps = {
    subscriptionNotifications: SubscriptionNotification[];
    setSubscriptionNotifications: React.Dispatch<React.SetStateAction<SubscriptionNotification>>;
    userProfile: any;
};

export default function SubscriptionNotificationService(
    { subscriptionNotifications, setSubscriptionNotifications, userProfile }: SubscriptionNotificationServiceProps
) {

    useEffect(() => {
        const fetchSubscriptionNotifications = async () => {
                if (subscriptionNotifications[0].title === 'Initializing...') {
                    return;
                }
                if ((subscriptionNotifications[0].title === 'Subscription fully utilised' || subscriptionNotifications[0].title === 'Subscription utilisation') && subscriptionNotifications[0].read === true) {
                    return;
                }
                if (userProfile.subscription_entitlement === userProfile.subscription_used) {
                    setSubscriptionNotifications(
                        {
                            id: 0,
                            title: "Subscription fully utilised",
                            description: "You have used your full subscription entitlement (" + userProfile.subscription_used + " of " + userProfile.subscription_entitlement + ").",
                            severity: 'warning',
                            timestamp: new Date().toISOString(),
                            read: false,
                        }
                    )
                }
                if (userProfile.subscription_entitlement >= userProfile.subscription_used) {
                    setSubscriptionNotifications(
                        {
                            id: 0,
                            title: "Subscription utilisation",
                            description: "You have used (" + userProfile.subscription_used + "/" + userProfile.subscription_entitlement + ") of you subscription entitlement.",
                            severity: 'info',
                            timestamp: new Date().toISOString(),
                            read: false,
                        }
                    )
                }
        };
        fetchSubscriptionNotifications();
    }, [subscriptionNotifications, setSubscriptionNotifications, userProfile]);
    return null;
};