"use client";

import {
  Map,
  MapControls,
  MapMarker,
  MapPopup,
  MarkerContent,
  type MapRef,
} from "@/components/ui/map";
import { cn } from "@/lib/utils";
import { MapPinned } from "lucide-react";
import * as React from "react";

const mapPins = [
  {
    id: "center-1",
    name: "ArenaGo Downtown",
    sport: "Padel · 6 courts",
    coords: [-122.399, 37.794],
  },
  {
    id: "center-2",
    name: "Bayside Sports Hub",
    sport: "Pickleball · 10 courts",
    coords: [-122.411, 37.781],
  },
  {
    id: "center-3",
    name: "Riverside Courts",
    sport: "Tennis · 8 courts",
    coords: [-122.423, 37.792],
  },
];

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

const MapView = React.forwardRef<MapRef, { className?: string }>(
  function MapView({ className }, ref) {
    const mapRef = React.useRef<MapRef>(null);
  const [userLocation, setUserLocation] = React.useState<{
    longitude: number;
    latitude: number;
  } | null>(null);
  const hasCenteredRef = React.useRef(false);
  const [initialViewport, setInitialViewport] = React.useState(DEFAULT_VIEWPORT);
  const [drawerOpen, setDrawerOpen] = React.useState(true);

  const recentSearches = [
    {
      id: "r1",
      name: "Sân Pickleball Quang Minh",
      detail: "6810.6km | 1488 Duy Tân, Hòa Thuận Tây",
    },
    {
      id: "r2",
      name: "Sân Bóng Đá SeaMart Sport",
      detail: "8108.5km | 24 Matti Pickerbellel - Cổng 1",
    },
  ];

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
        {mapPins.map((pin) => (
          <MapMarker
            key={pin.id}
            longitude={pin.coords[0]}
            latitude={pin.coords[1]}
            anchor="bottom"
          >
            <MarkerContent>
              <div className="flex items-center gap-2 rounded-full bg-background/90 px-3 py-2 text-xs font-semibold shadow-lg">
                <MapPinned className="h-3.5 w-3.5 text-primary" />
                {pin.name}
              </div>
            </MarkerContent>
          </MapMarker>
        ))}
        <MapPopup longitude={-122.399} latitude={37.794}>
          <div className="rounded-2xl border border-border/60 bg-background/95 p-3 text-xs shadow-lg">
            <p className="font-semibold">ArenaGo Downtown</p>
            <p className="text-muted-foreground">Open courts: 4</p>
          </div>
        </MapPopup>
        <MapControls className="top-32 right-4" showZoom={false}
          showCompass
          showLocate/>
        </Map>
      </div>
    );
  }
);

export default MapView;
