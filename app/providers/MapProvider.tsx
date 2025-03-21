'use client';
import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import {EventSource} from 'eventsource'

import { useAuth } from './AuthProvider';
import { useMyDevices, Device } from './MyDevices';


mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

type MapContextType = {
    map: mapboxgl.Map | null;
};

const MapContext = createContext<MapContextType | undefined>(undefined);

export const useMap = (): MapContextType => {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error('useMap must be used within a MapProvider');
    }
    return context;
};

type MapProps = {
    latitude: number;
    longitude: number;
    zoom: number;
    zoom_disabled?: boolean;
    projection?: string;
    children?: React.ReactNode;
};

type EventData = {
    location: {
        device_id: string,
        coordinates: [number, number],
        update_frequency: number,
        accuracy: number,
        speed: number,
        bearing: number,
        timestamp: Date
    };
    // status: {
    //     device_id: number,
    //     summary: string,
    //     overall: string,
    //     battery: number,
    //     timestamp: Date
    // };
    // canbus: {
    //     device_id: string, // the ID of the tracker device
    //     id: number, // the ID of the CANBUS device emitting the payload
    //     payload: string
    // };
};

function spinGlobe(map: mapboxgl.Map, secondsPerRevolution: number = 720) {
    const distancePerSecond = 360 / secondsPerRevolution;
    return () => {
        const center = map.getCenter();
        center.lng -= distancePerSecond;
        map.easeTo({ center, duration: 1000, easing: (n) => n });
    };
}

export const MapProvider: React.FC<MapProps> = ({ latitude, longitude, zoom, zoom_disabled, projection }) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const [map, setMap] = useState<mapboxgl.Map | null>(null);
    const [eventDataMap, setEventDataMap] = useState<Record<string, EventData>>({});
    const markersRef = useRef<Record<string, mapboxgl.Marker>>({});

    const { token, isAuthenticated } = useAuth();
    const {devices, selectedDevices} = useMyDevices();

    const handleEventData = useCallback(
        (deviceId: string, eventType: string, data: EventData) => {
            setEventDataMap(prev => ({
                ...prev,
                [deviceId]: {
                    ...prev[deviceId],
                    [eventType]: data
                }
            }));
        },
        [setEventDataMap]
    );

    function setupDeviceEventSource(eventType: string, device: Device, token: string | null, callback: { (eventType: string, data: EventData): void; }) {
        const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/devices/by-id/${device.uuid}/${eventType}`, {
            fetch: (input, init) =>
                fetch(input, {
                    ...init,
                    headers: {
                        // @ts-expect-error ESLint can't handle the `init.headers` typing
                        ...init.headers,
                        Authorization: `Bearer ${token}`,
                    },
                }),
        });
        
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.debug("Received event data:", data);
            callback("location", data);
        };

        eventSource.onerror = (error) => {
            console.error("Event source error:", error);
        };

        return eventSource;
    }

    useEffect(() => {
        if (isAuthenticated && devices && devices.length > 0) {
            const cleanupFunctions: Record<string, () => void> = {};

            devices.forEach(device => {
                const eventSource = setupDeviceEventSource(
                    "location",
                    device,
                    token,
                    (eventType: string, data: EventData) => handleEventData(device.uuid, eventType, data)
                );

                cleanupFunctions[device.uuid] = () => eventSource.close();
            });

            return () => {
                Object.values(cleanupFunctions).forEach(cleanup => cleanup());
            };
        }
    }, [devices, isAuthenticated, token, handleEventData]);


    useEffect(() => {
        if (!map || !selectedDevices) return;

        // Clean up markers for devices that are no longer selected
        Object.keys(markersRef.current).forEach(deviceId => {
            if (!selectedDevices.some((device: string) => device === deviceId)) {
                markersRef.current[deviceId].remove();
                delete markersRef.current[deviceId];
            }
        });

        // Create markers for newly selected devices
        selectedDevices.forEach((selectedDevice: string) => {
            const deviceId = selectedDevice;
            const deviceData = eventDataMap[deviceId];
            
            if (deviceData?.location?.coordinates) {
                // If marker doesn't exist for this device, create one
                if (!markersRef.current[deviceId]) {
                    const marker = new mapboxgl.Marker()
                        .setLngLat(deviceData.location.coordinates)
                        .addTo(map);
                    markersRef.current[deviceId] = marker;
                } else {
                    // If marker exists, update its position
                    markersRef.current[deviceId].setLngLat(deviceData.location.coordinates);
                }
            }
        });
    }, [map, selectedDevices, eventDataMap]);

    useEffect(() => {
        if (!isAuthenticated) {
            if (map) {
                map.setCenter([134, 0])
                map.setZoom(2)
                map.scrollZoom.disable();
                map.setProjection("globe")
                map.on('style.load', () => {
                    map.setFog({});
                });

                const spin = spinGlobe(map);
                const interval = setInterval(spin, 1000); // Call `spin` every second

                return () => clearInterval(interval);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map]);


    useEffect(() => {
        if (!mapContainerRef.current) return;

        const mapInstance = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [longitude, latitude],
            zoom: zoom,
            projection: projection || 'mercator',
        });

        if (isAuthenticated) {
            mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
        }

        mapInstance.on('render', () => {
            mapInstance.resize();
        });

        setMap(mapInstance);

        return () => {
            mapInstance.remove();
            setMap(null);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [latitude, longitude, zoom, zoom_disabled, projection]);

    return (
        <MapContext.Provider value={{ map }}>
            <div className="map-container" ref={mapContainerRef}>
            </div>
        </MapContext.Provider>
    );
};

export default MapProvider;