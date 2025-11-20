import React, { useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface OutputModuleProps {
    project: any
    viewState: {
        latitude: number
        longitude: number
        zoom: number
    }
}

export const OutputModule: React.FC<OutputModuleProps> = ({ project, viewState }) => {
    const [exporting, setExporting] = useState(false)

    const handleExport = async () => {
        if (!project) return

        setExporting(true)

        try {
            const doc = new jsPDF('p', 'mm', 'a4')

            // Header
            doc.setFontSize(20)
            doc.text(`ForensicMap Report: ${project.name}`, 10, 15)
            doc.setFontSize(10)
            doc.text(`Date: ${new Date().toLocaleString()}`, 10, 22)
            doc.text(`Zero Point: ${project.zeroPoint ? `${project.zeroPoint.latitude.toFixed(6)}, ${project.zeroPoint.longitude.toFixed(6)}` : 'Not set'}`, 10, 27)

            // Generate map image manually using Tile Stitching
            // This bypasses WebGL preservation issues by reconstructing the map view from standard images
            let mapCaptured = false
            try {
                console.log('Generating map image from tiles...')
                const canvas = document.createElement('canvas')
                const width = 800
                const height = 600
                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext('2d')

                if (ctx) {
                    // Fill background
                    ctx.fillStyle = '#f0f0f0'
                    ctx.fillRect(0, 0, width, height)

                    // Math helpers for Web Mercator
                    const zoom = viewState.zoom
                    const lat = viewState.latitude
                    const lon = viewState.longitude

                    const lon2px = (l: number, z: number) => (l + 180) / 360 * Math.pow(2, z) * 256
                    const lat2px = (l: number, z: number) => (1 - Math.log(Math.tan(l * Math.PI / 180) + 1 / Math.cos(l * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z) * 256

                    const centerX = lon2px(lon, zoom)
                    const centerY = lat2px(lat, zoom)

                    // Calculate bounds to know which tiles to fetch
                    const halfWidth = width / 2
                    const halfHeight = height / 2

                    const tileZ = Math.floor(zoom)
                    const scale = Math.pow(2, zoom - tileZ)
                    const tileSize = 256 * scale

                    const startX = Math.floor((centerX - halfWidth) / tileSize)
                    const endX = Math.floor((centerX + halfWidth) / tileSize) + 1
                    const startY = Math.floor((centerY - halfHeight) / tileSize)
                    const endY = Math.floor((centerY + halfHeight) / tileSize) + 1

                    // Fetch and draw tiles
                    const promises = []
                    for (let x = startX; x <= endX; x++) {
                        for (let y = startY; y <= endY; y++) {
                            // Wrap x for world repetition
                            const tileX = (x % Math.pow(2, tileZ) + Math.pow(2, tileZ)) % Math.pow(2, tileZ)

                            const url = `https://tile.openstreetmap.org/${tileZ}/${tileX}/${y}.png`

                            promises.push(new Promise<void>((resolve) => {
                                const img = new Image()
                                img.crossOrigin = 'anonymous'
                                img.onload = () => {
                                    // Calculate position
                                    // The tile's top-left in world pixels (at current zoom level)
                                    // We need to convert tile coordinates back to world pixels
                                    // But simpler: calculate offset relative to center

                                    // Tile position in tile units at integer zoom
                                    const tileWorldX = x * 256 * scale
                                    const tileWorldY = y * 256 * scale

                                    const drawX = tileWorldX - (centerX - halfWidth)
                                    const drawY = tileWorldY - (centerY - halfHeight)

                                    ctx.drawImage(img, drawX, drawY, tileSize, tileSize)
                                    resolve()
                                }
                                img.onerror = () => resolve() // Continue even if tile fails
                                img.src = url
                            }))
                        }
                    }

                    await Promise.all(promises)

                    // Draw Zero Point
                    if (project.zeroPoint) {
                        console.log('Drawing Zero Point:', project.zeroPoint)
                        const zx = lon2px(project.zeroPoint.longitude, zoom) - (centerX - halfWidth)
                        const zy = lat2px(project.zeroPoint.latitude, zoom) - (centerY - halfHeight)

                        ctx.beginPath()
                        ctx.arc(zx, zy, 8, 0, Math.PI * 2)
                        ctx.fillStyle = 'red'
                        ctx.fill()
                        ctx.lineWidth = 2
                        ctx.strokeStyle = 'white'
                        ctx.stroke()

                        ctx.fillStyle = 'black'
                        ctx.font = 'bold 12px Arial'
                        ctx.fillText('ZP', zx + 10, zy + 4)
                    } else {
                        console.log('No Zero Point to draw')
                    }

                    // Draw Points (Measurements)
                    if (project.points && project.points.length > 0) {
                        console.log(`Drawing ${project.points.length} points`)
                        project.points.forEach((p: any, i: number) => {
                            // Calculate position
                            let px, py

                            if (p.longitude !== undefined && p.latitude !== undefined) {
                                // Use actual geographic coordinates if available
                                px = lon2px(p.longitude, zoom) - (centerX - halfWidth)
                                py = lat2px(p.latitude, zoom) - (centerY - halfHeight)
                            } else if (p.x !== undefined && p.y !== undefined) {
                                // Fallback: Use local x/y measurements to visualize relative to center (or Zero Point)
                                // 1 meter approx X pixels at this zoom?
                                // Let's just use a visual scale factor for the report
                                const scaleFactor = 5 // 5 pixels per meter
                                px = (width / 2) + (Number(p.x) * scaleFactor)
                                py = (height / 2) - (Number(p.y) * scaleFactor) // Invert Y for screen coords
                            } else {
                                // Default to center
                                px = width / 2
                                py = height / 2
                            }

                            console.log(`Point ${i}:`, { label: p.label, px, py })

                            ctx.beginPath()
                            ctx.arc(px, py, 6, 0, Math.PI * 2)
                            ctx.fillStyle = 'blue'
                            ctx.fill()
                            ctx.lineWidth = 2
                            ctx.strokeStyle = 'white'
                            ctx.stroke()

                            ctx.fillStyle = 'black'
                            ctx.font = '10px Arial'
                            ctx.fillText(p.label || `#${i + 1}`, px + 8, py + 3)
                        })
                    }

                    // Draw Assets
                    if (project.assets && project.assets.length > 0) {
                        console.log(`Drawing ${project.assets.length} assets`)
                        project.assets.forEach((a: any, i: number) => {
                            if (a.position) {
                                const ax = lon2px(a.position.longitude, zoom) - (centerX - halfWidth)
                                const ay = lat2px(a.position.latitude, zoom) - (centerY - halfHeight)

                                ctx.beginPath()
                                ctx.arc(ax, ay, 8, 0, Math.PI * 2)
                                ctx.fillStyle = 'green'
                                ctx.fill()
                                ctx.lineWidth = 2
                                ctx.strokeStyle = 'white'
                                ctx.stroke()

                                ctx.fillStyle = 'black'
                                ctx.font = 'bold 10px Arial'
                                ctx.fillText(a.name || `Asset ${i + 1}`, ax + 10, ay + 4)
                            }
                        })
                    }

                    const imgData = canvas.toDataURL('image/png')
                    const imgWidth = 190
                    const imgHeight = (height * imgWidth) / width
                    doc.addImage(imgData, 'PNG', 10, 35, imgWidth, Math.min(imgHeight, 120))

                    mapCaptured = true
                    console.log('Map generated from tiles successfully')
                }
            } catch (e) {
                console.error('Tile generation failed:', e)
            }

            // Fallback: Create a visual representation if capture failed
            if (!mapCaptured) {
                // Add a box with map information instead of screenshot
                doc.setDrawColor(200, 200, 200)
                doc.setFillColor(240, 240, 240)
                doc.rect(10, 35, 190, 120, 'FD')

                doc.setFontSize(12)
                doc.setTextColor(100, 100, 100)
                doc.text('Map View (Capture Failed)', 105, 50, { align: 'center' })

                doc.setFontSize(10)
                doc.text(`Center: ${viewState.latitude.toFixed(6)}, ${viewState.longitude.toFixed(6)}`, 105, 60, { align: 'center' })
                doc.text(`Zoom Level: ${viewState.zoom.toFixed(2)}`, 105, 67, { align: 'center' })

                if (project.zeroPoint) {
                    doc.text(`Zero Point: ${project.zeroPoint.latitude.toFixed(6)}, ${project.zeroPoint.longitude.toFixed(6)}`, 105, 77, { align: 'center' })
                }

                doc.text(`Total Points: ${project.points?.length || 0}`, 105, 87, { align: 'center' })

                doc.setFontSize(8)
                doc.setTextColor(150, 150, 150)
                doc.text('Note: Live map screenshots require additional browser permissions.', 105, 100, { align: 'center' })
                doc.text('Use the application to view the interactive map.', 105, 106, { align: 'center' })

                doc.setTextColor(0, 0, 0)
            }

            // Points and Assets Table
            let y = 165
            doc.setFontSize(14)
            doc.text('Measurements & Assets:', 10, y)
            y += 8

            doc.setFontSize(9)

            if (project.points && project.points.length > 0) {
                project.points.forEach((p: any, index: number) => {
                    if (y > 280) { // New page if needed
                        doc.addPage()
                        y = 20
                    }

                    let text = ''
                    if (p.type === 'asset') {
                        text = `${index + 1}. Asset: ${p.assetType}`
                        if (p.position) {
                            text += ` at (${p.position.latitude.toFixed(6)}, ${p.position.longitude.toFixed(6)})`
                        }
                    } else {
                        text = `${index + 1}. ${p.label} - ${p.mode}`
                        if (p.mode === 'baseline') {
                            text += `: X=${p.data.x}m, Y=${p.data.y}m`
                        } else {
                            text += `: A=${p.data.distA}m, B=${p.data.distB}m`
                        }
                    }

                    doc.text(text, 10, y)
                    y += 6
                })
            } else {
                doc.text('No points or assets added yet.', 10, y)
            }

            // Footer
            doc.setFontSize(8)
            doc.setTextColor(128, 128, 128)
            doc.text('Generated by ForensicMap 3D', 10, 290)

            doc.save(`${project.name}_report.pdf`)
            console.log('PDF saved successfully')
        } catch (error) {
            console.error('PDF export error:', error)
            alert('Failed to export PDF. Check console for details.')
        } finally {
            setExporting(false)
        }
    }

    return (
        <div className="output-module" style={{
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
                📄 Output
            </h3>
            <div style={{
                background: '#1a1a1a',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '15px',
                fontSize: '13px'
            }}>
                Export a PDF report with map screenshot and measurements
            </div>
            <button
                onClick={handleExport}
                disabled={exporting || !project}
                style={{
                    width: '100%',
                    padding: '12px',
                    background: (exporting || !project) ? '#555' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: (exporting || !project) ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                }}
            >
                {exporting ? '📥 Exporting...' : '📄 Export PDF Report'}
            </button>
        </div>
    )
}
