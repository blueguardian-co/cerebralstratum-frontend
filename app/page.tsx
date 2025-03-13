'use client'

import {
    PageSection
} from '@patternfly/react-core';

import dynamic from 'next/dynamic';

import MapProvider, { useMap } from './providers/MapProvider';

const Map = dynamic(() => import('./components/Map'), { ssr: false });
/* TODO:
 1. Have `Map` container take up full screen, with UI overlaid on top

 Misc:
 - Create BlueGuardian Co logo
 - Creat animation that goes from `full globe` to specific area
*/

export default function Home() {
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
