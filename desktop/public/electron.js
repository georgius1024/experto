const electron = require('electron')
const { app, BrowserWindow, Menu } = electron
app.commandLine.appendSwitch('ignore-certificate-errors', '1')
app.commandLine.appendSwitch('allow-insecure-localhost', '1')
app.commandLine.appendSwitch('allow-running-insecure-content', '1')

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true
const path = require('path')
const isDev = require('electron-is-dev')
let mainWindow
const installExtensions = async () => {
  const installer = require('electron-devtools-installer')
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS']
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS
  for (const name of extensions) {
    try {
      await installer.default(installer[name], forceDownload)
    } catch (e) {
      console.log(`Error installing ${name} extension: ${e.message}`)
    }
  }
}

async function createMainWindow() {
  if (isDev) {
    installExtensions()
  }
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    thickFrame: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      backgroundThrottling: false,
      webSecurity: false
    }
  })
  mainWindow.loadURL(isDev ? 'http://localhost:7000' : `file://${path.join(__dirname, '../build/index.html')}`)
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.show()
    if (isDev) {
      // Open the DevTools.
      //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
      mainWindow.webContents.openDevTools()
      // add inspect element on right click menu
      mainWindow.webContents.on('context-menu', (e, props) => {
        Menu.buildFromTemplate([
          {
            label: 'Inspect element',
            click() {
              mainWindow.inspectElement(props.x, props.y)
            }
          }
        ]).popup(mainWindow)
      })
    }
  })
  mainWindow.on('closed', () => (mainWindow = null))
}

app.on('ready', createMainWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow()
  }
})
