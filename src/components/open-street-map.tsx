import * as React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

export interface OpenStreetMapMarker {
  coordinate: MapCoordinate;
  title: string;
  description?: string;
  color?: string;
  type?: 'cooperative' | 'home' | 'driver' | 'user';
}

export interface OpenStreetMapPolyline {
  coordinates: MapCoordinate[];
  color: string;
  width?: number;
  dashArray?: string;
}

export interface OpenStreetMapRegion extends MapCoordinate {
  latitudeDelta: number;
  longitudeDelta: number;
}

interface OpenStreetMapProps {
  region: OpenStreetMapRegion;
  markers?: OpenStreetMapMarker[];
  polylines?: OpenStreetMapPolyline[];
  style?: StyleProp<ViewStyle>;
  driverCoord?: MapCoordinate | null;
}

const escapeForScript = (value: unknown) =>
  JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

const buildMapHtml = (data: {
  region: OpenStreetMapRegion;
  markers: OpenStreetMapMarker[];
  polylines: OpenStreetMapPolyline[];
}) => `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      crossorigin=""
    />
    <style>
      html, body, #map { height: 100%; width: 100%; margin: 0; background: #e2e8f0; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .map-badge {
        position: fixed; z-index: 999; top: 12px; left: 12px;
        display: flex; align-items: center; gap: 6px;
        padding: 7px 9px; border-radius: 10px;
        color: #ecfdf5; background: rgba(6, 78, 59, .92);
        box-shadow: 0 4px 14px rgba(15, 23, 42, .18);
        font-size: 11px; font-weight: 700; letter-spacing: .02em;
      }
      .map-badge span {
        display: block; width: 7px; height: 7px; border-radius: 99px; background: #fbbf24;
      }
      .marker-dot {
        display: grid; place-items: center; box-sizing: border-box;
        width: 32px; height: 32px; margin: -16px 0 0 -16px;
        border: 3px solid #fff; border-radius: 50% 50% 50% 7px;
        transform: rotate(-45deg); color: #fff;
        background: var(--marker-color, #047857);
        box-shadow: 0 3px 8px rgba(15, 23, 42, .28);
      }
      .marker-dot > span { transform: rotate(45deg); font-size: 13px; line-height: 1; }
      .marker-driver { border-radius: 50%; background: #2563eb; }
      .leaflet-popup-content-wrapper { border-radius: 10px; }
      .leaflet-popup-content { margin: 10px 12px; color: #1c1917; font-size: 12px; }
      .popup-title { font-weight: 800; color: #064e3b; margin-bottom: 3px; }
      .popup-description { color: #57534e; line-height: 1.35; }
      #map-error {
        display: none; height: 100%; padding: 24px; box-sizing: border-box;
        align-items: center; justify-content: center; text-align: center;
        color: #57534e; font-size: 13px; background: #f5f5f4;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <div id="map-error">Peta OpenStreetMap belum dapat dimuat. Periksa koneksi internet lalu coba lagi.</div>
    <div class="map-badge"><span></span> Peta OpenStreetMap</div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
    <script>
      (function () {
        const data = ${escapeForScript(data)};
        const errorElement = document.getElementById('map-error');

        if (!window.L) {
          document.getElementById('map').style.display = 'none';
          errorElement.style.display = 'flex';
          return;
        }

        const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (character) => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        })[character]);
        const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
        const zoom = clamp(Math.round(Math.log2(360 / Math.max(data.region.latitudeDelta, 0.0001))), 2, 18);
        const map = window.L.map('map', { zoomControl: true, attributionControl: true })
          .setView([data.region.latitude, data.region.longitude], zoom);

        window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        data.polylines.forEach((line) => {
          if (line.coordinates.length < 2) return;
          window.L.polyline(
            line.coordinates.map((coordinate) => [coordinate.latitude, coordinate.longitude]),
            { color: line.color, weight: line.width || 5, dashArray: line.dashArray || undefined, lineCap: 'round' }
          ).addTo(map);
        });

        const markerSymbols = { cooperative: '⌂', home: '⌂', driver: '🛵', user: '●' };
        let driverMarker = null;

        data.markers.forEach((item) => {
          const color = /^#[0-9a-fA-F]{3,8}$/.test(item.color || '') ? item.color : '#047857';
          const type = item.type || 'cooperative';
          const icon = window.L.divIcon({
            className: '',
            html: '<div class="marker-dot ' + (type === 'driver' ? 'marker-driver' : '') + '" style="--marker-color:' + color + '"><span>' + markerSymbols[type] + '</span></div>',
            iconSize: [32, 32],
            iconAnchor: [16, 31],
          });
          const marker = window.L.marker([item.coordinate.latitude, item.coordinate.longitude], { icon }).addTo(map);
          
          if (type === 'driver') {
            driverMarker = marker;
          }

          marker.bindPopup(
            '<div class="popup-title">' + escapeHtml(item.title) + '</div>' +
            (item.description ? '<div class="popup-description">' + escapeHtml(item.description) + '</div>' : '')
          );
        });

        // Add message listeners to update driver position smoothly without Webview reloads
        const updateDriverLocation = function(event) {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'updateDriver' && driverMarker) {
              driverMarker.setLatLng([msg.latitude, msg.longitude]);
              map.panTo([msg.latitude, msg.longitude], { animate: true, duration: 0.45 });
            }
          } catch(e) {}
        };
        window.addEventListener('message', updateDriverLocation);
        document.addEventListener('message', updateDriverLocation);
      })();
    </script>
  </body>
</html>`;

export default function OpenStreetMapView({
  region,
  markers = [],
  polylines = [],
  style,
  driverCoord,
}: OpenStreetMapProps) {
  const [hasLoadError, setHasLoadError] = React.useState(false);
  const webViewRef = React.useRef<WebView>(null);

  // Memoize markers to exclude volatile driverCoord from rebuilding HTML and reloading WebView
  const initialMarkers = React.useMemo(() => {
    const list = [...markers];
    if (driverCoord && !list.some((m) => m.type === 'driver')) {
      list.push({
        coordinate: driverCoord,
        title: 'Mang Ujang (Kurir Desa)',
        description: 'Sedang mengantarkan sembako Anda',
        color: '#3b82f6',
        type: 'driver',
      });
    }
    return list;
  }, [markers]);

  const html = React.useMemo(
    () => buildMapHtml({ region, markers: initialMarkers, polylines }),
    [initialMarkers, polylines, region]
  );

  React.useEffect(() => {
    setHasLoadError(false);
  }, [html]);

  // Post coordinate updates directly to Leaflet without reloading Webview
  React.useEffect(() => {
    if (driverCoord && webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: 'updateDriver',
          latitude: driverCoord.latitude,
          longitude: driverCoord.longitude,
        })
      );
    }
  }, [driverCoord]);

  if (hasLoadError) {
    return (
      <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f4', padding: 24 }, style]}>
        <Text style={{ color: '#57534e', fontSize: 12, textAlign: 'center' }}>
          Peta tidak dapat dimuat. Periksa koneksi internet lalu coba lagi.
        </Text>
      </View>
    );
  }

  return (
    <WebView
      ref={webViewRef}
      source={{ html }}
      originWhitelist={['*']}
      style={[{ flex: 1, backgroundColor: '#e2e8f0' }, style]}
      javaScriptEnabled
      domStorageEnabled
      onError={() => setHasLoadError(true)}
      onHttpError={() => setHasLoadError(true)}
    />
  );
}
