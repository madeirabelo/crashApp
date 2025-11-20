import React, { useState } from 'react'

interface ProjectControlsProps {
    onProjectLoaded: (project: any) => void
}

export const ProjectControls: React.FC<ProjectControlsProps> = ({ onProjectLoaded }) => {
    const [projectName, setProjectName] = useState('')

    const handleCreate = async () => {
        if (!projectName) return
        const project = await window.ipcRenderer.project.create(projectName)
        onProjectLoaded(project)
    }

    const handleLoad = async () => {
        const project = await window.ipcRenderer.project.load()
        if (project) {
            onProjectLoaded(project)
            setProjectName(project.name)
        }
    }

    const handleSave = async () => {
        // In a real app, we'd get the current state from the parent
        // For now, we'll just trigger a save with the current name
        // This part needs to be connected to the actual project state in App.tsx
        console.log('Save triggered')
    }

    return (
        <div className="project-controls" style={{ padding: '10px', background: '#333', marginBottom: '10px' }}>
            <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project Name"
                style={{ marginRight: '10px', padding: '5px' }}
            />
            <button onClick={handleCreate} style={{ marginRight: '5px' }}>Create New</button>
            <button onClick={handleLoad} style={{ marginRight: '5px' }}>Load</button>
            <button onClick={handleSave}>Save</button>
        </div>
    )
}
