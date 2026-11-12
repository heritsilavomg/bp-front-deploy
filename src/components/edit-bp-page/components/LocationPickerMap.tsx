"use client";

import { useEffect, useRef, useState } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { LatLngExpression, LeafletMouseEvent, Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

type LocationPickerMapProps = {
    latitude?: number;
    longitude?: number;
    onChange: (latitude: number, longitude: number) => void;
};

const FALLBACK_CENTER: LatLngExpression = [-18.8792, 47.5079];
const DEFAULT_ZOOM = 13;

function MapViewport({ center }: { center: LatLngExpression }) {
    const map = useMap();

    useEffect(() => {
        map.setView(center, map.getZoom(), { animate: true });
    }, [center, map]);

    return null;
}

function MapSelection({ onChange }: { onChange: (event: LeafletMouseEvent) => void }) {
    useMapEvents({ click: onChange });
    return null;
}

function MapInstanceBridge({ onReady }: { onReady: (map: LeafletMap) => void }) {
    const map = useMap();

    useEffect(() => {
        onReady(map);

        const container = map.getContainer();

        // Force Leaflet à recalculer sa taille et repositionner correctement
        // ses panes (dont les CircleMarker) dès que le conteneur a une taille
        // réelle (> 0). Un simple setTimeout(0) peut s'exécuter avant que le
        // layout CSS (flex/grid/modale) ait fini de dimensionner le parent.
        const resizeObserver = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            const { width, height } = entry.contentRect;
            if (width > 0 && height > 0) {
                map.invalidateSize();
            }
        });

        resizeObserver.observe(container);

        // Filet de sécurité pour les cas où le conteneur a déjà sa taille
        // finale dès le montage (le ResizeObserver ne se déclenche alors
        // pas forcément immédiatement selon les navigateurs).
        const timeout = setTimeout(() => map.invalidateSize(), 0);

        return () => {
            resizeObserver.disconnect();
            clearTimeout(timeout);
        };
    }, [map, onReady]);

    return null;
}

function isValidCoordinate(value?: number): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

export default function LocationPickerMap({ latitude, longitude, onChange }: LocationPickerMapProps) {
    const hasSavedLocation = isValidCoordinate(latitude) && isValidCoordinate(longitude);
    const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(
        hasSavedLocation ? [latitude, longitude] : null,
    );
    const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
    const [center, setCenter] = useState<LatLngExpression>(
        hasSavedLocation ? [latitude, longitude] : FALLBACK_CENTER,
    );
    const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
    const hasRequestedLocation = useRef(false);
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (hasSavedLocation) {
            const savedPosition: [number, number] = [latitude, longitude];
            setSelectedPosition(savedPosition);
            setCenter(savedPosition);
        }

        if (hasRequestedLocation.current) return;
        hasRequestedLocation.current = true;
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const currentPosition: [number, number] = [coords.latitude, coords.longitude];
                setCurrentPosition(currentPosition);
                if (!hasSavedLocation) {
                    setSelectedPosition(currentPosition);
                    setCenter(currentPosition);
                    onChangeRef.current(coords.latitude, coords.longitude);
                }
            },
            () => {
                // Madagascar is kept as the fallback when geolocation is denied.
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
        );
    }, [hasSavedLocation, latitude, longitude]);

    const handleMapClick = (event: LeafletMouseEvent) => {
        const nextPosition: [number, number] = [event.latlng.lat, event.latlng.lng];
        setSelectedPosition(nextPosition);
        setCenter(nextPosition);
        onChangeRef.current(event.latlng.lat, event.latlng.lng);
    };

    const savedPosition = hasSavedLocation ? ([latitude, longitude] as [number, number]) : null;
    const resolvedSelectedPosition = savedPosition ?? selectedPosition;
    const shouldShowSelectedMarker = Boolean(resolvedSelectedPosition);

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
            <MapContainer center={center} zoom={DEFAULT_ZOOM} scrollWheelZoom className="h-72 w-full sm:h-80">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapInstanceBridge onReady={setMapInstance} />
                <MapViewport center={center} />
                <MapSelection onChange={handleMapClick} />
                {currentPosition && (
                    <CircleMarker
                        center={currentPosition}
                        radius={9}
                        pathOptions={{ color: "#1d4ed8", fillColor: "#3b82f6", fillOpacity: 0.9 }}
                    />
                )}
                {shouldShowSelectedMarker && (
                    <CircleMarker
                        center={resolvedSelectedPosition as LatLngExpression}
                        radius={9}
                        pathOptions={{ color: "#166534", fillColor: "#22c55e", fillOpacity: 0.9 }}
                    />
                )}
            </MapContainer>
            {currentPosition && mapInstance && (
                <div className="flex justify-end border-t border-slate-200 bg-white px-3 py-2">
                    <button
                        type="button"
                        onClick={() => mapInstance.setView(currentPosition, mapInstance.getZoom(), { animate: true })}
                        className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
                        title="Recentrer sur ma position actuelle"
                    >
                        Recentrer sur ma position
                    </button>
                </div>
            )}
            <p className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Cliquez sur la carte pour sélectionner l&apos;emplacement de votre activité.
            </p>
        </div>
    );
}