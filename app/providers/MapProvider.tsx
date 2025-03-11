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

export const MapProvider: React.FC<MapProps> = ({ latitude, longitude, zoom, zoom_disabled, projection, children }) => {
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

    function setupDeviceEventSource(eventType: string, device: Device, token: string | null, callback) {
        console.debug("Setting up event source for device: " + device.uuid);
        // @ts-ignore
        const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/devices/by-id/${device.uuid}/${eventType}`, {
            fetch: (input, init) =>
                fetch(input, {
                    ...init,
                    headers: {
                        ...init.headers,
                        Authorization: `Bearer ${token}`,
                    },
                }),
        });

        eventSource.onopen = (event) => {
            console.debug("Event source opened:", event);
        };

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
            console.debug("Setting up event sources for devices: " + devices.map((device) => device.uuid).join(", "));
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
            if (!selectedDevices.some(device => device === deviceId)) {
                markersRef.current[deviceId].remove();
                delete markersRef.current[deviceId];
            }
        });

        // Create markers for newly selected devices
        selectedDevices.forEach(selectedDevice => {
            const deviceId = selectedDevice;
            const deviceData = eventDataMap[deviceId];

            // Only create markers for devices with location data
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
        if (!mapContainerRef.current) return;

        const mapInstance = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [longitude, latitude],
            zoom: zoom,
            projection: projection || 'mercator',
        });

        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

        if (zoom_disabled) {
            mapInstance.scrollZoom.disable();
        }

        mapInstance.on('render', () => {
            mapInstance.resize();
        });

        setMap(mapInstance);

        return () => {
            mapInstance.remove();
            setMap(null);
        };
    }, [latitude, longitude, zoom, zoom_disabled, projection]);

    return (
        <MapContext.Provider value={{ map }}>
            <div className="map-container" ref={mapContainerRef}>
            </div>
        </MapContext.Provider>
    );
};

export default MapProvider;