import React, { useState } from 'react'
import Map from 'react-map-gl/maplibre'
import maplibregl from 'maplibre-gl'
import DeckGL from '@deck.gl/react'
import { ScatterplotLayer } from '@deck.gl/layers'
import 'maplibre-gl/dist/maplibre-gl.css'

interface MapComponentProps {
    viewState: {
        longitude: number
        latitude: number
        zoom: number
    }
    onViewStateChange: (viewState: any) => void
    points?: any[]
    zeroPoint?: { longitude: number; latitude: number } | null
    onSetZeroPoint?: (point: { longitude: number; latitude: number }) => void
}

export const MapComponent: React.FC<MapComponentProps> = ({
    viewState,
    onViewStateChange,
    points = [],
    zeroPoint,
    onSetZeroPoint
}) => {
    const [settingZeroPoint, setSettingZeroPoint] = useState(false)

    // Note: For offline maps without a token, we might need to use a self-hosted style
    // or a specific offline configuration. For now, we'll use a placeholder or public style if available.
    // If using Mapbox v2/v3, a token is mandatory for their styles.
    // We can use an empty style for now to avoid errors if no token is provided.
    const mapStyle = {
        version: 8,
        sources: {
            'osm': {
                type: 'raster',
                tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '&copy; OpenStreetMap Contributors',
                maxzoom: 19
            }
        },
        layers: [
            {
                id: 'osm',
                type: 'raster',
                source: 'osm',
            }
        ]
    }

    const handleMapClick = (event: any) => {
        console.log('Map clicked:', event)
        if (settingZeroPoint && onSetZeroPoint) {
            // DeckGL provides coordinates in event.coordinate
            const coords = event.coordinate || [event.lngLat?.lng, event.lngLat?.lat]
            if (coords && coords[0] !== undefined && coords[1] !== undefined) {
                console.log('Setting zero point:', coords)
                onSetZeroPoint({
                    longitude: coords[0],
                    latitude: coords[1]
                })
                setSettingZeroPoint(false)
            }
        }
    }

    // Create layers for visualization
    const layers = [
        // Zero point marker (larger and more visible)
        zeroPoint && new ScatterplotLayer({
            id: 'zero-point',
            data: [zeroPoint],
            getPosition: (d: any) => {
                console.log('Zero point position:', d)
                return [d.longitude, d.latitude]
            },
            getFillColor: [255, 0, 0, 255],
            getLineColor: [255, 255, 255, 255],
            getRadius: 15,
            radiusMinPixels: 15,
            radiusMaxPixels: 30,
            lineWidthMinPixels: 2,
            stroked: true,
        }),
        // Points and assets markers (larger)
        points.length > 0 && new ScatterplotLayer({
            id: 'points',
            data: points,
            getPosition: (d: any) => {
                // If it has a position (asset), use that
                if (d.position) {
                    console.log('Asset position:', d.position)
                    return [d.position.longitude, d.position.latitude]
                }
                // Otherwise, use the map center as placeholder (should calculate from zero point + offset)
                console.log('Point without position, using map center')
                return [viewState.longitude, viewState.latitude]
            },
            getFillColor: (d: any) => d.type === 'asset' ? [0, 255, 0, 255] : [0, 150, 255, 255],
            getLineColor: [255, 255, 255, 255],
            getRadius: 12,
            radiusMinPixels: 12,
            radiusMaxPixels: 24,
            lineWidthMinPixels: 2,
            stroked: true,
            pickable: true,
        }),
    ].filter(Boolean)

    console.log('Rendering map with:', { zeroPoint, pointsCount: points.length, layersCount: layers.length })

    return (
        <div style={{ width: '100%', height: '600px', position: 'relative' }}>
            {settingZeroPoint && (
                <div style={{
                    position: 'absolute',
                    top: 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(255, 0, 0, 0.9)',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    zIndex: 1000,
                    fontWeight: 'bold'
                }}>
                    Click on the map to set Zero Point (0,0,0)
                </div>
            )}
            {zeroPoint && (
                <div style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '3px',
                    zIndex: 1000,
                    fontSize: '12px'
                }}>
                    Zero Point: {zeroPoint.latitude.toFixed(6)}, {zeroPoint.longitude.toFixed(6)}
                </div>
            )}
            <button
                onClick={() => setSettingZeroPoint(!settingZeroPoint)}
                style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    zIndex: 1000,
                    padding: '8px 12px',
                    background: settingZeroPoint ? '#ff4444' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
            >
                {settingZeroPoint ? 'Cancel' : zeroPoint ? 'Reset Zero Point' : 'Set Zero Point'}
            </button>
            <DeckGL
                initialViewState={viewState}
                controller={true}
                onViewStateChange={({ viewState }) => onViewStateChange(viewState)}
                layers={layers}
                onClick={handleMapClick}
            >
                <Map
                    mapLib={maplibregl as any}
                    mapStyle={mapStyle as any}
                />
            </DeckGL>
        </div>
    )
}
