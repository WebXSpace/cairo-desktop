import { app, BrowserWindow, Menu, nativeImage, Tray } from 'electron';
import { resolve } from 'path';
import { t } from '../locale';
import { mode, openDevTools, VITE_DEV_SERVER_URL } from './env';
import { WCBridge } from './wcbridge';
import { ElectronApp, SCM } from '@electron-webxapp/app';

export class WalletProxyApp extends ElectronApp {
	private _wcBridge!: WCBridge;

	constructor() {
		super({
			MAIN_DEV_URL: VITE_DEV_SERVER_URL,
			MAIN_PROD_URL: 'file://' + resolve(__dirname, `../render/index.html`),
			MOD: mode,
			ROOT_DIR: resolve(__dirname, '../'),
			OPEN_DEV_TOOLS: openDevTools,
		});
	}

	protected async startServices(scm: SCM): Promise<void> {
		this._wcBridge = new WCBridge(scm);

		await scm.register(this._wcBridge);
	}

	protected installTray(): Tray | undefined {
		const image = nativeImage.createFromPath(resolve(__dirname, '../../assets/icon.png'));

		const tray = new Tray(image.resize({ width: 16, height: 16 }));

		const settings = app.getLoginItemSettings();

		let openAtLogin = settings.openAtLogin;

		const contextMenu = Menu.buildFromTemplate([
			{
				label: t('SHOW_STATUS'),
				type: 'normal',
				click: async () => {
					await this.showMainWindow();
				},
			},
			{
				label: t('OPEN_AT_LOGIN'),
				type: 'checkbox',
				checked: openAtLogin,
				click: () => {
					app.setLoginItemSettings({
						openAtLogin: !openAtLogin,
					});

					openAtLogin = !openAtLogin;
				},
			},
			{
				label: t('OPEN_AT_LOGIN'),
				type: 'separator',
				click: () => {},
			},
			{
				label: t('QUIT_APP'),
				type: 'normal',
				click: () => {
					this.scm.stop();
					app.exit();
				},
			},
		]);

		tray.setContextMenu(contextMenu);

		return tray;
	}

	protected async installExt(): Promise<void> {}

	protected createMainWindow(): BrowserWindow | undefined {
		let webPreferences = {
			preload: resolve(__dirname, '../preload.js'),
			webviewTag: true,
		};

		return new BrowserWindow({
			simpleFullscreen: false,
			fullscreenable: false,
			show: false,
			webPreferences: webPreferences,
			frame: false,
			titleBarStyle: 'hidden',
			height: mode == 'development' ? 900 : 600,
			width: 800,
			resizable: false,
		});
	}
}
