const electron = require('electron');
const fs = require('fs');
const ipc = electron.ipcMain;
const app = electron.app;
const Menu = electron.Menu;
const BrowserWindow = electron.BrowserWindow;
const BrowserView = electron.BrowserView;
/**
 * 这里使用了 log4js ，但是只是简单的使用，更多使用方法阅读官方文档
 * 如果解注以下配置，请解开 fetchEventDear 定义中的 第一个参数，将 null 改为 log4js 则前端页面将可以使用 log4sj
 * 同时可以修改 util/fetchEventDear.js 中使用 log 的定义
 * 其中的 logManager 复制管理 log 如何进行保存，修改时建议不要修改接口结构
 * 如果执意修改结构，请修改前端接口处对应的结构
 * logManager 结构这里不重复赘述，在 fetchEventDear.js 相关处已经进行声明
 * https://www.npmjs.com/package/log4js
 */
// const log4js = require('log4js');
// log4js.configure({
//     appenders: {
//         mainLog: { type: 'file', filename : __dirname + '/logs/mainLog.log' },
//         fetchEventDearAll : { type: 'file', filename : __dirname + '/logs/fetchEventDearAll.log' },
//         fetchEventDearError : { type: 'file', filename : __dirname + '/logs/fetchEventDearError.log' },
//         fetchEventDearPass : { type: 'file', filename : __dirname + '/logs/fetchEventDearPass.log' },
//         process : { type: 'file', filename : __dirname + '/logs/process.log' }
//     },
//     categories: {
//         default : { appenders: ['mainLog'], level: 'info' },
//         fetchEventDearAll : { appenders: ['fetchEventDearAll'], level: 'ALL' },
//         fetchEventDearError : { appenders: ['fetchEventDearError'], level: 'error' },
//         fetchEventDearPass : { appenders: ['fetchEventDearPass'], level: 'info' },
//         process : { appenders: ['process'], level: 'ALL' }
//     }
// });
const fetchEventDear = require("./util/fetchEventDear").fetchEventDear(null,fs,__dirname);

let mainParams = {
    webPreferences: {webSecurity: false},
    width: "100%",
    height: "100%",
    icon: __dirname + '/icon.png',
    // titleBarStyle: 'hidden-inset',
    backgroundColor: '#fff',
    show: false
};

function createWindow() {
    mainWindow = new BrowserWindow(mainParams);
    mainWindow.setTitle("title");

    mainWindow.loadURL(`file://${__dirname}/VIEW/index.html`);

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', () => {
    createWindow();
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
    fetchEventDear(e,obj);
});


