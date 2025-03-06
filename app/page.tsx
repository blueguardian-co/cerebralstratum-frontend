'use client'

import React, { useEffect } from 'react';
import {
    PageSection
} from '@patternfly/react-core';

import dynamic from 'next/dynamic';

import { Point } from 'geojson';

import { useAuth } from './providers/AuthProvider';
import { MapProvider, useMap } from './providers/MapProvider';
import { useMyDevices } from './providers/MyDevices';
import SSEClient from './components/SSEClient'

type EventData = {
    location: {
        device_id: string,
        coordinates: Point,
        update_frequency: number,
        accuracy: number,
        speed: number,
        bearing: number,
        timestamp: Date
    };
    status: {
        device_id: number,
        summary: string,
        overall: string,
        battery: number,
        timestamp: Date
    };
    canbus: {
        device_id: string, // the ID of the tracker device
        id: number, // the ID of the CANBUS device emitting the payload
        payload: string
    };
};


const Map = dynamic(() => import('./components/Map'), { ssr: false });
/* TODO:
 1. Have `Map` container take up full screen, with UI overlaid on top

 Misc:
 - Create BlueGuardian Co logo
 - Creat animation that goes from `full globe` to specific area
*/
function spinGlobe(map: mapboxgl.Map, secondsPerRevolution: number = 360) {
    const distancePerSecond = 360 / secondsPerRevolution;
    return () => {
        const center = map.getCenter();
        center.lng -= distancePerSecond;
        map.easeTo({ center, duration: 1000, easing: (n) => n });
    };
}

function MapWithSpinningGlobe() {
    const { map } = useMap();

    useEffect(() => {
        if (map) {
            map.on('style.load', () => {
                map.setFog({});
            });

            const spin = spinGlobe(map);
            const interval = setInterval(spin, 1000); // Call `spin` every second

            return () => clearInterval(interval);
        }
    }, [map]);

    return <Map />;
}

export default function Home() {
    const { isAuthenticated } = useAuth();
    const { devices, isLoading, error } = useMyDevices();
    
    if (!isAuthenticated) {
        return (
            <>
                <PageSection isFilled={true}>
                    <MapProvider latitude={0} longitude={134} zoom={3} zoom_disabled={true} projection="globe">
                        <MapWithSpinningGlobe />
                    </MapProvider>
                </PageSection>
            </>
        );
    }
    if (isAuthenticated) {
        if (devices.length > 0 && !isLoading && !error) {
            devices.forEach(device => {
                SSEClient<EventData>(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/devices/by-id/${device.uuid}`,
                    ["location", "status", "canbus"]
                );
            })
        }

        return (
            <>
                <PageSection isFilled={true}>
                    <MapProvider latitude={-35.44665} longitude={149.09108} zoom={16}>
                        <Map/>
                    </MapProvider>
                </PageSection>
            </>
        );
    }
}
