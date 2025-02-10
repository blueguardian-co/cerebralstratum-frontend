'use client';

import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

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

export const MapProvider: React.FC<MapProps> = ({ latitude, longitude, zoom, zoom_disabled, projection, children }) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const [map, setMap] = useState<mapboxgl.Map | null>(null);

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
                {children}
            </div>
        </MapContext.Provider>
    );
};

export default MapProvider;