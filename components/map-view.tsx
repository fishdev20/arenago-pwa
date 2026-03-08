"use client";

import {
  Map,
  MapClusterLayer,
  MapControls,
  MapMarker,
  MarkerContent,
  type MapRef,
} from "@/components/ui/map";
import { cn } from "@/lib/utils";
import * as React from "react";

const MAP_STYLE_LIGHT = "https://tiles.openfreemap.org/styles/liberty";
const MAP_STYLE_DARK =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const MAP_VIEW_KEY = "arenago.map.viewport";

const DEFAULT_VIEWPORT = {
  center: [24.9384, 60.1699] as [number, number],
  zoom: 12.5,
  pitch: 0,
  bearing: 0,
};

type MapPin = {
  id: string;
  name: string;
  sport?: string;
  coords: [number, number];
};

type ViewportBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

const MapView = React.forwardRef<
  MapRef,
  {
    className?: string;
    markers?: MapPin[];
    onBoundsChange?: (bounds: ViewportBounds) => void;
    onMarkerClick?: (id: string, coordinates: [number, number]) => void;
  }
>(function MapView({ className, markers, onBoundsChange, onMarkerClick }, ref) {
    const mapRef = React.useRef<MapRef>(null);
  const [userLocation, setUserLocation] = React.useState<{
    longitude: number;
    latitude: number;
  } | null>(null);
  const hasCenteredRef = React.useRef(false);
  const [initialViewport, setInitialViewport] = React.useState(DEFAULT_VIEWPORT);
  const visiblePins = React.useMemo(() => markers ?? [], [markers]);
  const clusterData = React.useMemo(
    () =>
      ({
        type: "FeatureCollection",
        features: visiblePins.map((pin) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [pin.coords[0], pin.coords[1]],
          },
          properties: {
            id: pin.id,
            name: pin.name,
            sport: pin.sport ?? "",
          },
        })),
      }) as GeoJSON.FeatureCollection<GeoJSON.Point>,
    [visiblePins]
  );

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(MAP_VIEW_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as {
        center?: [number, number];
        zoom?: number;
        pitch?: number;
        bearing?: number;
      };
      if (
        Array.isArray(parsed.center) &&
        typeof parsed.center[0] === "number" &&
        typeof parsed.center[1] === "number"
      ) {
        setInitialViewport({
          center: parsed.center,
          zoom: typeof parsed.zoom === "number" ? parsed.zoom : DEFAULT_VIEWPORT.zoom,
          pitch: typeof parsed.pitch === "number" ? parsed.pitch : DEFAULT_VIEWPORT.pitch,
          bearing:
            typeof parsed.bearing === "number" ? parsed.bearing : DEFAULT_VIEWPORT.bearing,
        });
        hasCenteredRef.current = true;
      }
    } catch {
      // ignore invalid stored value
    }
  }, []);

  React.useEffect(() => {
    if (!("geolocation" in navigator)) return;

    let watchId: number | null = null;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          longitude: pos.coords.longitude,
          latitude: pos.coords.latitude,
        };
        setUserLocation(coords);
        if (!hasCenteredRef.current && mapRef.current) {
          mapRef.current.flyTo({
            center: [coords.longitude, coords.latitude],
            zoom: 14,
            duration: 1200,
          });
          hasCenteredRef.current = true;
        }

        watchId = navigator.geolocation.watchPosition(
          (watchPos) => {
            setUserLocation({
              longitude: watchPos.coords.longitude,
              latitude: watchPos.coords.latitude,
            });
          },
          () => {
            // Ignore watch errors; keep last known location.
          },
          {
            enableHighAccuracy: true,
            maximumAge: 10_000,
            timeout: 10_000,
          }
        );
      },
      () => {
        // Ignore errors; map still renders without location.
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10_000,
        timeout: 10_000,
      }
    );

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

    React.useImperativeHandle(ref, () => mapRef.current as MapRef, []);

    return (
      <div className={cn("relative h-full w-full", className)}>
      <Map
        ref={mapRef}
        className="absolute inset-0"
        styles={{ light: MAP_STYLE_LIGHT, dark: MAP_STYLE_DARK }}
        projection={{ type: "mercator" }}
        maxZoom={14}
        center={initialViewport.center}
        zoom={initialViewport.zoom}
        pitch={initialViewport.pitch}
        bearing={initialViewport.bearing}
        onViewportChange={(viewport) => {
          localStorage.setItem(MAP_VIEW_KEY, JSON.stringify(viewport));
          const bounds = mapRef.current?.getBounds();
          if (bounds) {
            onBoundsChange?.({
              north: bounds.getNorth(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              west: bounds.getWest(),
            });
          }
        }}
      >
        {userLocation ? (
          <MapMarker
            longitude={userLocation.longitude}
            latitude={userLocation.latitude}
            anchor="center"
          >
            <MarkerContent>
              <div className="relative flex h-5 w-5 items-center justify-center">
                <span className="absolute inline-flex h-6 w-6 animate-ping rounded-full bg-primary/30" />
                <span className="h-3 w-3 rounded-full border-2 border-background bg-primary shadow" />
              </div>
            </MarkerContent>
          </MapMarker>
        ) : null}
        <MapClusterLayer
          data={clusterData}
          clusterMaxZoom={15}
          clusterRadius={48}
          clusterThresholds={[20, 100]}
          pointColor="#f97316"
          clusterColors={["#22c55e", "#f59e0b", "#ef4444"]}
          onPointClick={(feature, coordinates) => {
            const id = String(feature.properties?.id ?? "");
            if (!id) return;
            onMarkerClick?.(id, coordinates);
          }}
        />
        <MapControls className="top-32 right-4" showZoom={false}
          showCompass
          showLocate/>
        </Map>
      </div>
    );
  }
);

export default MapView;
