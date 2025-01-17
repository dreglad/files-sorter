import { app, BrowserWindow, Tray, Menu } from 'electron';
import * as path from 'path';


const isDevEnv = process && process.mainModule && process.mainModule.filename.indexOf('app.asar') === -1;
let isQuiting = false;
let win: BrowserWindow;
let appTray: Tray;
const trayMenu = [
    {
        label: 'Quit',
        click: () => {
            isQuiting = true;
            app.quit();
            app.exit();
        }
    },
    {
        label: 'Open',
        click: () => {
            win.show();
        }
    }
];

// Live reload for the render process, this validation makes sure to activate it only in development mode
if (isDevEnv) {
    require('electron-reload')('dist/app');
}

function init() {
    win = createWindow();
    setTimeout(() => {
        win.show()
        win.focus();
    }, 1000);

    // Avoid creating the tray for dev env because it causes problems when auto reloading,
    // Its not necessary for debbugging, hence not worth trying to fix.
    if (!isDevEnv) {
      appTray = createTray();
      appTray.on('click', () => {
        win.show();
        win.focus();
      });
    }
}

function createWindow(): BrowserWindow {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1210,
        height: 700,
        show: false,
        maximizable: false,
        webPreferences: {
            devTools: isDevEnv,
            worldSafeExecuteJavaScript: true,
            nodeIntegration: true,
            enableRemoteModule: true
        },
        // skipTaskbar: !isDevEnv,
        icon: getIcon(512)
    });
    win.removeMenu();

    // Path to index on the dist folder
    win.loadURL(path.join("file://", __dirname, "./app/index.html"));
    if (isDevEnv) {
        win.webContents.toggleDevTools();
    }

    win.on('close', onWindowClose);
    if (process.platform === 'darwin') {
        app.dock.hide();
    }

    return win;
}


function onWindowClose(event: any) {
    if (isDevEnv) {
        app.quit();
        return;
    }

    if (!isQuiting) {
        event.preventDefault();
        win.hide();
        return false;
    }
}

function createTray(): Tray {
    const tray = new Tray(getIcon(16));
    const contextMenu = Menu.buildFromTemplate(trayMenu);
    tray.setToolTip('Files sorter');
    tray.setContextMenu(contextMenu);
    return tray;
}

function getIcon(res: number) {
    const skips = isDevEnv ? '../' : '../../';
    return path.join(__dirname, skips, `icons/icon-fs-@${res}px.png`);
}

app.on('ready', init);