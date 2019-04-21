const electron = require('electron')
const { app, BrowserWindow, Menu } = electron
app.commandLine.appendSwitch('ignore-certificate-errors', '1')

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true
const path = require('path')
const isDev = require('electron-is-dev')
let mainWindow, popupWindow
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
  process.createPopupWindow = createPopupWindow
}

async function createPopupWindow(code) {
  popupWindow = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    width: 900,
    height: 680,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      backgroundThrottling: false,
      webSecurity: false
    }
  })
  popupWindow.maximize()
  popupWindow.loadURL(
    isDev
      ? 'http://localhost:7000?presenter=' + code
      : `file://${path.join(__dirname, '../build/index.html?presenter=' + code)}`
  )
  popupWindow.webContents.once('did-finish-load', () => {
    popupWindow.show()
    if (isDev) {
      // Open the DevTools.
      popupWindow.webContents.openDevTools()
      // add inspect element on right click menu
      popupWindow.webContents.on('context-menu', (e, props) => {
        Menu.buildFromTemplate([
          {
            label: 'Inspect element',
            click() {
              popupWindow.inspectElement(props.x, props.y)
            }
          }
        ]).popup(popupWindow)
      })
    }
  })
  popupWindow.on('closed', () => (popupWindow = null))
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
