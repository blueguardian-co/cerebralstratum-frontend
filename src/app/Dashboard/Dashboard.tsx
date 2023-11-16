import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import { BannerStatus } from '../Banner/Banner';

// Start MapBox
//import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;

const mapContainer = React.useRef(null);
const map = React.useRef(null);
const [lng, setLng] = React.useState(-70.9);
const [lat, setLat] = React.useState(42.35);
const [zoom, setZoom] = React.useState(9);

React.useEffect(() => {
  if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom
    });
});
// End MapBox

const Dashboard: React.FunctionComponent = () => (
  <PageSection>
    <Title headingLevel="h1" size="lg">Devices Overview</Title>
    <div ref={mapContainer} className="map-container" />
    <BannerStatus />
  </PageSection>
)

export { Dashboard };
