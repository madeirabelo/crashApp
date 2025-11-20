import { ipcMain, dialog, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'

export interface ProjectData {
    id: string
    name: string
    createdAt: string
    updatedAt: string
    mapCenter: [number, number, number] // lng, lat, zoom
    points: any[]
}

export class ProjectManager {
    constructor() {
        this.setupHandlers()
    }

    private setupHandlers() {
        ipcMain.handle('project:create', async (_, name: string) => {
            const project: ProjectData = {
                id: crypto.randomUUID(),
                name,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                mapCenter: [-58.8344, -27.469213, 16], // Corrientes default
                points: []
            }
            return project
        })

        ipcMain.handle('project:save', async (_, project: ProjectData) => {
            const { canceled, filePath } = await dialog.showSaveDialog({
                title: 'Save Project',
                defaultPath: `${project.name}.json`,
                filters: [{ name: 'ForensicMap Project', extensions: ['json'] }]
            })

            if (canceled || !filePath) return false

            fs.writeFileSync(filePath, JSON.stringify(project, null, 2))
            return true
        })

        ipcMain.handle('project:load', async () => {
            const { canceled, filePaths } = await dialog.showOpenDialog({
                title: 'Load Project',
                properties: ['openFile'],
                filters: [{ name: 'ForensicMap Project', extensions: ['json'] }]
            })

            if (canceled || filePaths.length === 0) return null

            const content = fs.readFileSync(filePaths[0], 'utf-8')
            return JSON.parse(content) as ProjectData
        })
    }
}
