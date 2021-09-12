import { ipcRenderer, contextBridge } from 'electron';

contextBridge.exposeInMainWorld('api', {
  ipcRenderer,
});
