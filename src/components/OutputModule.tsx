import React from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface OutputModuleProps {
    project: any
}

export const OutputModule: React.FC<OutputModuleProps> = ({ project }) => {
    const handleExport = async () => {
        if (!project) return

        const doc = new jsPDF()

        // Header
        doc.setFontSize(20)
        doc.text(`ForensicMap Report: ${project.name}`, 10, 10)
        doc.setFontSize(12)
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, 20)

        // Map Capture (Placeholder logic - capturing WebGL canvas is tricky)
        // In a real app, we'd need to preserve drawing buffer or use a specific map export function
        // For now, we'll try to capture the whole app container or just warn
        const mapElement = document.querySelector('.mapboxgl-map') as HTMLElement
        if (mapElement) {
            try {
                // Note: This often fails with WebGL contexts unless preserveDrawingBuffer is set
                const canvas = await html2canvas(mapElement, { useCORS: true })
                const imgData = canvas.toDataURL('image/png')
                doc.addImage(imgData, 'PNG', 10, 30, 180, 100)
            } catch (e) {
                console.error('Map capture failed', e)
                doc.text('[Map Image Capture Failed - WebGL Context]', 10, 50)
            }
        }

        // Points Table
        let y = 140
        doc.text('Measurements & Assets:', 10, y)
        y += 10

        project.points?.forEach((p: any, index: number) => {
            const text = p.type === 'asset'
                ? `${index + 1}. Asset: ${p.assetType}`
                : `${index + 1}. ${p.label} (${p.mode})`

            doc.text(text, 10, y)
            y += 7
        })

        doc.save(`${project.name}_report.pdf`)
    }

    return (
        <div className="output-module" style={{ padding: '10px', background: '#444', marginTop: '10px' }}>
            <h3>Output</h3>
            <button onClick={handleExport} style={{ width: '100%' }}>Export PDF Report</button>
        </div>
    )
}
