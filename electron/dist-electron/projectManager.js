"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectManager = void 0;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
class ProjectManager {
    constructor() {
        this.setupHandlers();
    }
    setupHandlers() {
        electron_1.ipcMain.handle('project:create', async (_, name) => {
            const project = {
                id: crypto.randomUUID(),
                name,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                mapCenter: [-58.8344, -27.469213, 16], // Corrientes default
                points: []
            };
            return project;
        });
        electron_1.ipcMain.handle('project:save', async (_, project) => {
            const { canceled, filePath } = await electron_1.dialog.showSaveDialog({
                title: 'Save Project',
                defaultPath: `${project.name}.json`,
                filters: [{ name: 'ForensicMap Project', extensions: ['json'] }]
            });
            if (canceled || !filePath)
                return false;
            fs_1.default.writeFileSync(filePath, JSON.stringify(project, null, 2));
            return true;
        });
        electron_1.ipcMain.handle('project:load', async () => {
            const { canceled, filePaths } = await electron_1.dialog.showOpenDialog({
                title: 'Load Project',
                properties: ['openFile'],
                filters: [{ name: 'ForensicMap Project', extensions: ['json'] }]
            });
            if (canceled || filePaths.length === 0)
                return null;
            const content = fs_1.default.readFileSync(filePaths[0], 'utf-8');
            return JSON.parse(content);
        });
    }
}
exports.ProjectManager = ProjectManager;
