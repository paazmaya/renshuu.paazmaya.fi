import {
  MapContainer, TileLayer, useMap,
  CircleMarker,
  Popup
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import './Map.css';

export default function Map() {

  return (
    <MapContainer className="Map" center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <CircleMarker center={[51.505, -0.09]}>
        <Popup>
      A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </CircleMarker>
    </MapContainer>
  );
}
