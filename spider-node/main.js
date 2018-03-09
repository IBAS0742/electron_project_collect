const electron = require('electron');
const fs = require('fs');
const ipc = electron.ipcMain;
const app = electron.app;
const Menu = electron.Menu;
const BrowserWindow = electron.BrowserWindow;
const BrowserView = electron.BrowserView;
const log4js = require('log4js');
log4js.configure({
    appenders: {
        mainLog: { type: 'file', filename : __dirname + '/logs/mainLog.log' },
        fetchEventDearAll : { type: 'file', filename : __dirname + '/logs/fetchEventDearAll.log' },
        fetchEventDearError : { type: 'file', filename : __dirname + '/logs/fetchEventDearError.log' },
        fetchEventDearPass : { type: 'file', filename : __dirname + '/logs/fetchEventDearPass.log' },
        process : { type: 'file', filename : __dirname + '/logs/process.log' }
    },
    categories: {
        default : { appenders: ['mainLog'], level: 'info' },
        fetchEventDearAll : { appenders: ['fetchEventDearAll'], level: 'ALL' },
        fetchEventDearError : { appenders: ['fetchEventDearError'], level: 'error' },
        fetchEventDearPass : { appenders: ['fetchEventDearPass'], level: 'info' },
        process : { appenders: ['process'], level: 'ALL' }
    }
});

const fetchEventDear = require("./util/fetchEventDear").fetchEventDear(log4js,fs,__dirname);

let mainParams = {
    webPreferences: {webSecurity: false},
    width: "100%",
    height: "100%",
    icon: __dirname + '/icon.png',
    // titleBarStyle: 'hidden-inset',
    backgroundColor: '#fff',
    show: false
};

var mainViewContactEvent;
const menuTemplate = [
    {
        label: 'Edit',
        submenu: [
            {
                role: 'undo'
            },
            {
                role: 'redo'
            },
            {
                type: 'separator'
            },
            {
                role: 'cut'
            },
            {
                role: 'copy'
            },
            {
                role: 'paste'
            },
            {
                role: 'pasteandmatchstyle'
            },
            {
                role: 'delete'
            },
            {
                role: 'selectall'
            }
        ]
    },
    {
        label: 'View',
        submenu: [
            {
                role: 'reload'
            },
            {
                role: 'forcereload'
            },
            {
                role: 'toggledevtools'
            },
            {
                type: 'separator'
            },
            {
                role: 'resetzoom'
            },
            {
                type: 'separator'
            },
            {
                role: 'togglefullscreen'
            }
        ]
    },
    {
        role: 'window',
        submenu: [
            {
                label: '显示模拟请求页面',
                click() {
                    var size = mainWindow.getSize();
                    view.setBounds({ x: 0, y: 0, width: size[0], height: size[1] });
                }
            },
            {
                label : "隐藏模拟请求页面",
                click() {
                    view.setBounds({ x: 0, y: 0, width: 0, height: 0 });
                }
            },
            {
                label : "修改模拟请求页面链接",
                click() {
                    mainViewContactEvent.sender.send("fetchBack",[
                        "baseAPI",
                        "prompt",
                        {
                            title : "请输入链接地址（http:// 和 https:// 记得带上）",
                            event : "baseAPI-changeBGURL"
                        }
                    ]);
                    view.setBounds({ x: 0, y: 0, width: 0, height: 0 });
                }
            }
        ]
    }
];

function createWindow() {
    mainWindow = new BrowserWindow(mainParams);
    mainWindow.setTitle("title");

    mainWindow.loadURL(`file://${__dirname}/VIEW/index.html`);

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

var view;

app.on('ready', () => {
    createWindow();


    view = new BrowserView({
        webPreferences: {
            nodeIntegration: false,
            preload: __dirname + '/util/saveDomToFile.js' // 但预加载的 js 文件内仍可以使用 Nodejs 的 API
        }
    });
    mainWindow.setBrowserView(view);
    view.setBounds({ x: 0, y: 0, width: 0, height: 0 });
    view.webContents.loadURL(`file://${__dirname}/VIEW/blank.html`)
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {});

/**
 * obj
 *      带有 view 属性时，为对 view 对象的操作
 * */
ipc.on("fetchFore",function (e,obj) {
    if (obj.view) {
        /**
         * url : ""
         * */
        view.webContents.loadURL(obj.url);
    } else if (obj.contact) {
        mainViewContactEvent = e;
    } else {
        fetchEventDear(e,obj);
    }
});

var mainLog = log4js.getLogger("mainLog");
mainLog.info("启动成功");

