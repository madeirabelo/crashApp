import React from 'react'

interface AssetLibraryProps {
    onAddAsset: (assetType: string) => void
}

export const AssetLibrary: React.FC<AssetLibraryProps> = ({ onAddAsset }) => {
    const assets = [
        { id: 'sedan', name: 'Generic Sedan', icon: '🚗', color: '#4A90E2' },
        { id: 'pickup', name: 'Generic Pickup', icon: '🚙', color: '#E8A735' },
        { id: 'cone', name: 'Traffic Cone', icon: '🚧', color: '#FF6B35' },
        { id: 'marker', name: 'Evidence Marker', icon: '📍', color: '#E74C3C' }
    ]

    return (
        <div className="asset-library" style={{
            padding: '15px',
            background: '#2a2a2a',
            marginTop: '10px',
            borderRadius: '8px'
        }}>
            <h3 style={{
                marginTop: 0,
                marginBottom: '10px',
                borderBottom: '2px solid #4CAF50',
                paddingBottom: '8px'
            }}>
                🎨 Asset Library
            </h3>
            <div style={{
                background: '#1a1a1a',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '15px',
                fontSize: '13px'
            }}>
                Click an asset to place it at the current map center
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {assets.map(asset => (
                    <button
                        key={asset.id}
                        onClick={() => onAddAsset(asset.id)}
                        style={{
                            padding: '12px 8px',
                            background: asset.color,
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '13px',
                            transition: 'transform 0.1s, box-shadow 0.1s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)'
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)'
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1)'
                            e.currentTarget.style.boxShadow = 'none'
                        }}
                    >
                        <span style={{ fontSize: '24px' }}>{asset.icon}</span>
                        <span style={{ fontSize: '11px' }}>{asset.name}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}
