import { IpcRenderer } from "electron";

declare global {
    interface Window {
        api: any;
    }
}