import React, { useState } from 'react'

interface InputModuleProps {
    onAddPoint: (point: any) => void
}

export const InputModule: React.FC<InputModuleProps> = ({ onAddPoint }) => {
    const [mode, setMode] = useState<'baseline' | 'triangulation'>('baseline')
    const [x, setX] = useState(0)
    const [y, setY] = useState(0)
    const [distA, setDistA] = useState(0)
    const [distB, setDistB] = useState(0)
    const [label, setLabel] = useState('')

    const handleSubmit = () => {
        const point = {
            id: crypto.randomUUID(),
            label,
            mode,
            data: mode === 'baseline' ? { x, y } : { distA, distB },
            // In a real app, we'd calculate lat/lng based on the zero point and these offsets
            // For now, we'll just store the raw data
        }
        onAddPoint(point)
        setLabel('')
        setX(0)
        setY(0)
        setDistA(0)
        setDistB(0)
    }

    return (
        <div className="input-module" style={{ padding: '15px', background: '#2a2a2a', marginTop: '10px', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '10px', borderBottom: '2px solid #4CAF50', paddingBottom: '8px' }}>📍 Input Module</h3>

            <div style={{
                background: '#1a1a1a',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '15px',
                fontSize: '13px',
                lineHeight: '1.5'
            }}>
                <strong>How to use:</strong>
                <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    <li>Set the Zero Point on the map first</li>
                    <li>Choose measurement mode below</li>
                    <li>Enter label and measurements</li>
                    <li>Click "Add Point"</li>
                </ol>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#4CAF50' }}>Measurement Mode:</div>
                <label style={{ display: 'block', marginBottom: '5px', cursor: 'pointer' }}>
                    <input
                        type="radio"
                        value="baseline"
                        checked={mode === 'baseline'}
                        onChange={() => setMode('baseline')}
                        style={{ marginRight: '8px' }}
                    />
                    <span>📏 Baseline/Offset</span>
                    <div style={{ fontSize: '11px', color: '#aaa', marginLeft: '24px' }}>
                        X = distance along baseline, Y = perpendicular offset
                    </div>
                </label>
                <label style={{ display: 'block', cursor: 'pointer' }}>
                    <input
                        type="radio"
                        value="triangulation"
                        checked={mode === 'triangulation'}
                        onChange={() => setMode('triangulation')}
                        style={{ marginRight: '8px' }}
                    />
                    <span>📐 Triangulation</span>
                    <div style={{ fontSize: '11px', color: '#aaa', marginLeft: '24px' }}>
                        Distance A and Distance B from two reference points
                    </div>
                </label>
            </div>

            <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>
                    Label:
                </label>
                <input
                    type="text"
                    placeholder="e.g., Evidence 1, Skid Mark, Debris"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px',
                        background: '#1a1a1a',
                        border: '1px solid #555',
                        borderRadius: '4px',
                        color: 'white'
                    }}
                />
            </div>

            {mode === 'baseline' ? (
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px' }}>X (Baseline) - meters:</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={x || ''}
                            onChange={(e) => setX(Number(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '8px',
                                background: '#1a1a1a',
                                border: '1px solid #555',
                                borderRadius: '4px',
                                color: 'white'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px' }}>Y (Offset) - meters:</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={y || ''}
                            onChange={(e) => setY(Number(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '8px',
                                background: '#1a1a1a',
                                border: '1px solid #555',
                                borderRadius: '4px',
                                color: 'white'
                            }}
                        />
                    </div>
                </div>
            ) : (
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px' }}>Distance A - meters:</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={distA || ''}
                            onChange={(e) => setDistA(Number(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '8px',
                                background: '#1a1a1a',
                                border: '1px solid #555',
                                borderRadius: '4px',
                                color: 'white'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px' }}>Distance B - meters:</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={distB || ''}
                            onChange={(e) => setDistB(Number(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '8px',
                                background: '#1a1a1a',
                                border: '1px solid #555',
                                borderRadius: '4px',
                                color: 'white'
                            }}
                        />
                    </div>
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={!label}
                style={{
                    width: '100%',
                    padding: '12px',
                    background: label ? '#4CAF50' : '#555',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: label ? 'pointer' : 'not-allowed',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    transition: 'background 0.2s'
                }}
            >
                ➕ Add Point
            </button>
        </div>
    )
}
