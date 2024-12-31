'use client';

import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set the Mapbox access token (for client-side access)
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

type MapProps = {
    latitude: number; // Initial latitude for the map
    longitude: number; // Initial longitude for the map
    zoom: number; // Initial zoom level
};

const Map: React.FC<MapProps> = ({ latitude, longitude, zoom }) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        // Ensure that the map is created only on the client side
        if (!mapContainerRef.current) return;

        // Initialize the map instance
        const map = new mapboxgl.Map({
            container: mapContainerRef.current, // Reference to the map div
            style: 'mapbox://styles/mapbox/streets-v11', // Default Mapbox style
            center: [longitude, latitude], // Initial center of the map
            zoom: zoom, // Initial zoom level
        });

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.on('render', function () {
            map.resize();
        });

        // Store the map instance reference for potential cleanup
        mapInstanceRef.current = map;

        // Cleanup function to remove the map on component unmount
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [latitude, longitude, zoom]);

    return (
        <div
            ref={mapContainerRef}
            className="map-container"
        >
        </div>
    );
};

export default Map;