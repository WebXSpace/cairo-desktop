import { BrowserWindow } from 'electron';
import { resolve } from 'path';
import { mode, VITE_DEV_SERVER_URL } from './env';

export function sendToWindows(event: string, ...args: any[]) {
	BrowserWindow.getAllWindows().forEach(w => {
		w.webContents.send(event, ...args);
	});
}

export function createWindow(width: number = 1400, height: number = 800) {
	let webPreferences = {
		webviewTag: true,
	};

	return new BrowserWindow({
		simpleFullscreen: false,
		fullscreenWindowTitle: false,
		fullscreenable: true,
		show: false,
		webPreferences: webPreferences,
		frame: false,
		titleBarStyle: 'hidden',
		width,
		height,
		minHeight: 600,
		minWidth: 900,
	});
}

export function renderURL(): string {
	if (mode === 'development') {
		return VITE_DEV_SERVER_URL;
	}

	return 'file://' + resolve(__dirname, `../../../render/index.html`);
}
