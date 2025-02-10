import { useEffect, useState } from "react";

const SSEClient = <T = any>(url: string, events: string[], options?: EventSourceInit) => {
    const [error, setError] = useState<Error | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [eventData, setEventData] = useState<Record<string, T | null>>({});

    useEffect(() => {
        let eventSource: EventSource | null = null;

        try {
            eventSource = new EventSource(url, options);

            if (eventSource !== null && events.length > 0) {
                events.forEach((named_event) => {
                    // @ts-ignore
                    eventSource.addEventListener(named_event, (event) => {
                        const data: T = JSON.parse(event.data);
                        setEventData((prev) => ({
                            ...prev,
                            [named_event]: data
                        }));
                    });
                });
            }

            // Listen for default unnamed events
            eventSource.onmessage = (event) => {
                const data: T = JSON.parse(event.data);
                setEventData((prev) => ({
                    ...prev,
                    default: data, // events will be available using `default` key
                }));

            };

            eventSource.onerror = () => {
                console.error("Error with SSE connection");
                setError(new Error("SSE connection failed"));
                setIsConnected(false);

                setTimeout(() => {
                    // Retry logic (reinitialize EventSource)
                }, 5000);
            };

            eventSource.onopen = () => {
                setIsConnected(true);
                setError(null);
            };
        } catch (err) {
            console.error("Failed to initialize SSE:", err);
            setError(err as Error);
        }

        // Cleanup on unmount
        return () => {
            eventSource?.close();
        };
    }, [url, events, options]);

    return { eventData, error, isConnected };
};

export default SSEClient;