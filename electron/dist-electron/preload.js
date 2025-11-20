"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// --------- Expose some API to the Renderer process ---------
electron_1.contextBridge.exposeInMainWorld('ipcRenderer', {
    on(...args) {
        const [channel, listener] = args;
        return electron_1.ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
    },
    off(...args) {
        const [channel, ...omit] = args;
        return electron_1.ipcRenderer.off(channel, ...omit);
    },
    send(...args) {
        const [channel, ...omit] = args;
        return electron_1.ipcRenderer.send(channel, ...omit);
    },
    invoke(...args) {
        const [channel, ...omit] = args;
        return electron_1.ipcRenderer.invoke(channel, ...omit);
    },
    project: {
        create: (name) => electron_1.ipcRenderer.invoke('project:create', name),
        save: (project) => electron_1.ipcRenderer.invoke('project:save', project),
        load: () => electron_1.ipcRenderer.invoke('project:load'),
    },
    // You can expose other APTs you need here.
    // ...
});
