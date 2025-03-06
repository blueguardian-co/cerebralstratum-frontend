import { useEffect, useState, useRef } from "react";

const SSEClient = <T = unknown>(url: string, events: string[], token: string | null, options?: EventSourceInit) => {
    const [error, setError] = useState<Error | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [eventData, setEventData] = useState<Record<string, T | null>>({});
    const eventSourceRef = useRef<EventSource | null>(null);
    const retryCountRef = useRef(0);
    const maxRetries = 5;
    const baseRetryDelay = 5000;

    const createEventSource = () => {
        if (!url) {
            setError(new Error("URL is required"));
            return null;
        }
        if (!token) {
            setError(new Error("Token is required"));
            return null;
        }

        try {
            const urlWithToken = new URL(url);
            if (token) {
                urlWithToken.searchParams.append('access_token', token);
            }

            const eventSource = new EventSource(urlWithToken, options);
            
            if (events.length > 0) {
                events.forEach((named_event) => {
                    eventSource.addEventListener(named_event, ((event: MessageEvent) => {
                        try {
                            const data: T = JSON.parse(event.data);
                            setEventData((prev) => ({
                                ...prev,
                                [named_event]: data
                            }));
                        } catch (e) {
                            console.error(`Error parsing event data for ${named_event}:`, e);
                        }
                    }) as EventListener);
                });
            }

            // Default event handler
            eventSource.onmessage = (event) => {
                try {
                    const data: T = JSON.parse(event.data);
                    setEventData((prev) => ({
                        ...prev,
                        default: data,
                    }));
                } catch (e) {
                    console.error("Error parsing default event data:", e);
                }
            };

            // Error handler
            eventSource.onerror = (event) => {
                const errorEvent = event as ErrorEvent;
                console.error("SSE connection error:", errorEvent);
                setIsConnected(false);

                if (eventSource.readyState === EventSource.CLOSED) {
                    const retryDelay = Math.min(baseRetryDelay * Math.pow(2, retryCountRef.current), 30000);

                    if (retryCountRef.current < maxRetries) {
                        console.log(`Retrying connection in ${retryDelay}ms (attempt ${retryCountRef.current + 1}/${maxRetries})`);
                        setTimeout(() => {
                            retryCountRef.current += 1;
                            eventSource.close();
                            eventSourceRef.current = createEventSource();
                        }, retryDelay);
                    } else {
                        setError(new Error(`SSE connection failed after ${maxRetries} attempts`));
                        eventSource.close();
                    }
                }
            };

            // Connection opened handler
            eventSource.onopen = () => {
                console.log("SSE connection established");
                setIsConnected(true);
                setError(null);
                retryCountRef.current = 0; // Reset retry counter on successful connection
            };

            return eventSource;
        } catch (err) {
            const error = err as Error;
            console.error("Failed to initialize SSE:", error.message);
            setError(error);
            return null;
        }
    };

    useEffect(() => {
        eventSourceRef.current = createEventSource();

        return () => {
            if (eventSourceRef.current) {
                console.log("Closing SSE connection");
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, [url, JSON.stringify(events), JSON.stringify(options)]);

    return {
        eventData,
        error,
        isConnected,
        reconnect: () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
            retryCountRef.current = 0;
            eventSourceRef.current = createEventSource();
        }
    };
};

export default SSEClient;