import { app, BrowserWindow, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let allMusicFiles: string[] = [];
const USER_HOME = process.env.HOME || process.env.USERPROFILE;
const getPath = (name: string) => {
    return `${USER_HOME}/.freemusic/userdata/${name}.json`;
};
const getTmplPath = (name: string) => {
    return path.resolve(__dirname, `./tmpl/${name}.json`);
};
const listDataFilePath = getPath('list');
const configFilePath = getPath('config');
const listDataTmplPath = getTmplPath('list');
const configTmplPath = getTmplPath('config');

const localFilePath = `${USER_HOME}/.freemusic`;
if (!fs.existsSync(localFilePath)) {
    fs.mkdirSync(localFilePath);
    fs.mkdirSync(`${USER_HOME}/.freemusic/userdata`);
}
if (!fs.existsSync(listDataFilePath)) {
    fs.createReadStream(listDataTmplPath).pipe(fs.createWriteStream(listDataFilePath));
}
if (!fs.existsSync(configFilePath)) {
    fs.createReadStream(configTmplPath).pipe(fs.createWriteStream(configFilePath));
}

let musicDir = '';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
    app.quit();
}

const createWindow = (): void => {
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            nativeWindowOpen: true,
            contextIsolation: true,
            nodeIntegrationInWorker: false,
            nodeIntegrationInSubFrames: false,
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });

    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    mainWindow.on('ready-to-show', () => mainWindow.show());
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// 获取歌单数据
ipcMain.handle('get-songs', () => {
    const json = fs.readFileSync(listDataFilePath).toString();
    return JSON.parse(json);
});

function toArrayBuffer(buf) {
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}

ipcMain.handle('get-song', (event, name) => {
    const filePath = path.resolve(musicDir, name);
    const isFileExist = fs.existsSync(filePath);
    if (!isFileExist) {
        return {
            code: -1,
            message: 'file not exist',
        };
    }
    const fileData = fs.readFileSync(filePath);
    return {
        code: 0,
        message: 'success',
        data: toArrayBuffer(fileData),
    };
});

ipcMain.handle('add-list', (event, name) => {
    const json = fs.readFileSync(listDataFilePath).toString();
    const data = JSON.parse(json);
    data.push({
        id: data.length + 1,
        name,
        songs: [],
    });
    fs.writeFileSync(listDataFilePath, JSON.stringify(data));
    return data;
});

ipcMain.handle('add-song-to-list', (event, song, listId) => {
    const json = fs.readFileSync(listDataFilePath).toString();
    const data = JSON.parse(json);
    const index = data.findIndex((d) => d.id === listId);
    data[index].songs.push(song);
    fs.writeFileSync(listDataFilePath, JSON.stringify(data));
    return data;
});

ipcMain.handle('get-lyric', (event, name) => {
    const filePath = path.resolve(musicDir, name);
    const isFileExist = fs.existsSync(filePath);
    if (!isFileExist) {
        return [];
    }
    const lrc = fs.readFileSync(filePath).toString();
    const data = lrc.split('\r').map((a) => {
        const arr = a.match(/\[(.*)\](.*)/);
        return {
            time: arr[1],
            text: arr[2],
        };
    });
    const parseTime = (time) => {
        const [min, sec] = time.split(':');
        return Number(min) * 60 + Number(sec);
    };
    return data
        .map((d, index) => {
            const startTime = parseTime(d.time);
            let endTime;
            if (index < data.length - 1) {
                endTime = parseTime(data[index + 1].time);
            }
            return {
                text: d.text,
                startTime,
                endTime,
            };
        })
        .slice(0, -1);
});

ipcMain.handle('get-config', () => {
    const conf = fs.readFileSync(configFilePath).toString();
    const data = JSON.parse(conf);
    musicDir = data.musicDir;
    return data;
});

ipcMain.handle('set-config', (event, config) => {
    musicDir = config.musicDir;
    fs.writeFileSync(configFilePath, JSON.stringify(config));
    return;
});

ipcMain.handle('refresh-all-songs', () => {
    const files = fs.readdirSync(musicDir);
    allMusicFiles = files.filter((f) => f.endsWith('.mp3'));
    const listData = JSON.parse(fs.readFileSync(listDataFilePath).toString());
    let newListData;
    if (!listData.length) {
        newListData = [
            {
                id: 1,
                name: '所有音乐',
                songs: allMusicFiles,
            },
        ];
    } else {
        newListData = listData.slice();
        newListData[0].songs = allMusicFiles;
    }
    fs.writeFileSync(listDataFilePath, JSON.stringify(newListData));
    return newListData;
});
