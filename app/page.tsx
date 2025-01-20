'use client'

import React, { useEffect } from 'react';
import {
    PageSection
} from '@patternfly/react-core';
import dynamic from 'next/dynamic';
import { useAuth } from "./components/AuthProvider";
import { MapProvider, useMap } from './components/MapProvider';

const Map = dynamic(() => import('./components/Map'), { ssr: false });
/* TODO:
 1. Add Dark Mode
 2. Change z-index of `Map` in `Page`

 Misc:
 - Create CEREBRAL STRATUM logo
 - Create BlueGuardian Co logo
 - Creat animation that goes from `full globe` to specific area
*/
function spinGlobe(map, secondsPerRevolution = 360) {
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

    return (
        <>
            <PageSection isFilled={true}>
                <MapProvider latitude={-35.44665} longitude={149.09108} zoom={16}>
                    <Map />
                </MapProvider>
            </PageSection>
        </>
    );
}
