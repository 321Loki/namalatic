import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { distanceInKm } from '../utils/helpers';

// default leaflet icons break with bundlers, so set them manually
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function FitMap({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(points, { padding: [40, 40] });
    } else {
      map.setView(points[0], 14);
    }
  }, [map, points]);

  return null;
}

function MapView({ latitude, longitude, title }) {
  const [userPos, setUserPos] = useState(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState('');

  const hotelPos = useMemo(() => [Number(latitude), Number(longitude)], [latitude, longitude]);
  const points = useMemo(() => (userPos ? [hotelPos, userPos] : [hotelPos]), [hotelPos, userPos]);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setGeoError('Your browser does not support the Geolocation API.');
      return;
    }

    setLocating(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPos([position.coords.latitude, position.coords.longitude]);
        setLocating(false);
      },
      (err) => {
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission was denied.'
            : 'Could not get your current location.'
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="map">
      <MapContainer
        key={`${hotelPos[0]}-${hotelPos[1]}`}
        center={hotelPos}
        zoom={14}
        scrollWheelZoom={false}
        className="map__box"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={hotelPos}>
          <Popup>{title}</Popup>
        </Marker>

        {userPos && (
          <>
            <CircleMarker center={userPos} radius={8} pathOptions={{ color: '#d6336c', fillOpacity: 0.8 }}>
              <Popup>You are here</Popup>
            </CircleMarker>
            <Polyline positions={points} pathOptions={{ color: '#1c5fd4', dashArray: '6 8' }} />
          </>
        )}

        <FitMap points={points} />
      </MapContainer>

      <div className="map__footer">
        <button type="button" className="btn btn-outline btn-sm" onClick={handleLocate} disabled={locating}>
          {locating ? 'Finding you...' : 'Show distance from my location'}
        </button>
        {userPos && (
          <span className="map__distance">
            You are about {distanceInKm(userPos, hotelPos).toFixed(1)} km away (straight line)
          </span>
        )}
        {geoError && <span className="error-text">{geoError}</span>}
      </div>
    </div>
  );
}

export default MapView;
