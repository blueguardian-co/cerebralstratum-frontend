'use client'
import { useState } from "react";
import ReactMapGL from "react-map-gl";

export default function Map() {
  const [viewport, setViewport] = useState({
  width: "100%",
  height: "100%",
  // The latitude and longitude of the center of London
  latitude: 51.5074,
  longitude: -0.1278,
  zoom: 10
});

let mapboxKey = process.env.MAPBOX_KEY
if ( mapboxKey === undefined ) {
  console.log('MAPBOX_KEY environment variable is not defined. Using the Public API token');
  mapboxKey = 'pk.eyJ1IjoiYWxleC1ibHVlZ3VhcmRpYW4iLCJhIjoiY2xlaHY4aTM3MGkybzN0bXJvc3pyeXVxYSJ9.83Mzyl-W1DGt12VkCuhMyg';
}

return <ReactMapGL
  mapStyle="mapbox://styles/mapbox/streets-v12"
  mapboxAccessToken={mapboxKey}
  {...viewport}
  onViewportChange={(nextViewport) => setViewport(nextViewport)}
  >
</ReactMapGL>
}