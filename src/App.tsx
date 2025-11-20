import { useState } from 'react'
import { ProjectControls } from './components/ProjectControls'

import { MapComponent } from './components/MapComponent'
import { InputModule } from './components/InputModule'
import { AssetLibrary } from './components/AssetLibrary'
import { OutputModule } from './components/OutputModule'

function App() {
    const [project, setProject] = useState<any>(null)
    const [zeroPoint, setZeroPoint] = useState<{ longitude: number; latitude: number } | null>(null)
    const [viewState, setViewState] = useState({
        longitude: -58.8344,
        latitude: -27.469213,
        zoom: 16
    })

    const handleProjectLoaded = (loadedProject: any) => {
        setProject(loadedProject)
        if (loadedProject.mapCenter) {
            setViewState({
                longitude: loadedProject.mapCenter[0],
                latitude: loadedProject.mapCenter[1],
                zoom: loadedProject.mapCenter[2]
            })
        }
    }

    const handleSaveProject = async () => {
        if (project) {
            const updatedProject = {
                ...project,
                mapCenter: [viewState.longitude, viewState.latitude, viewState.zoom]
            }
            await window.ipcRenderer.project.save(updatedProject)
            setProject(updatedProject)
        }
    }

    const handleAddPoint = (point: any) => {
        if (!project) return
        const updatedProject = {
            ...project,
            points: [...(project.points || []), point]
        }
        setProject(updatedProject)
    }

    const handleAddAsset = (assetType: string) => {
        if (!project) return
        const asset = {
            id: crypto.randomUUID(),
            type: 'asset',
            assetType,
            position: {
                longitude: viewState.longitude,
                latitude: viewState.latitude
            }
        }
        console.log('Adding asset:', asset)
        const updatedProject = {
            ...project,
            points: [...(project.points || []), asset]
        }
        setProject(updatedProject)
    }

    return (
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <h1>ForensicMap 3D</h1>
            <ProjectControls onProjectLoaded={handleProjectLoaded} />

            <div style={{ display: 'flex', flex: 1 }}>
                <div style={{ flex: 3, position: 'relative' }}>
                    <MapComponent
                        viewState={viewState}
                        onViewStateChange={setViewState}
                        points={project?.points || []}
                        zeroPoint={zeroPoint}
                        onSetZeroPoint={setZeroPoint}
                    />
                </div>
                <div style={{ flex: 1, paddingLeft: '10px', overflowY: 'auto' }}>
                    {project && (
                        <>
                            <div className="project-info">
                                <h2>{project.name}</h2>
                                <button onClick={handleSaveProject}>Save Project</button>
                            </div>
                            <InputModule onAddPoint={handleAddPoint} />
                            <AssetLibrary onAddAsset={handleAddAsset} />
                            <OutputModule project={project} />
                            <div style={{ marginTop: '20px' }}>
                                <h3>Points & Assets</h3>
                                <ul>
                                    {project.points?.map((p: any) => (
                                        <li key={p.id}>
                                            {p.type === 'asset' ? `Asset: ${p.assetType} ` : `${p.label} (${p.mode})`}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default App
