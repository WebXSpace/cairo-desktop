import { ServiceBuilder, SCM, ServiceConfig, Service } from '@electron-webxapp/app';
import { app, ipcMain } from 'electron';

export class WCBridge implements ServiceBuilder {
	private _scm: SCM;

	constructor(scm: SCM) {
		this._scm = scm;
	}

	config(): ServiceConfig {
		const name = 'wp-wcbridge';
		return {
			name,
			scriptPath: '${root_dir}/services/wcbridge.js',
			configable: true,
			systemService: true,
			version: 11,
			paramsDescription: {
				'storage-path': 'Path',
				'wc-port': 'Port',
			},
			defaultParams: {
				'storage-path': app.getPath('userData'),
				'wc-port': 1900,
			},
		};
	}

	async onStop(): Promise<void> {
		ipcMain.removeHandler('wp_profile');
	}

	async onCreate(service: Service): Promise<void> {
		await service.request('start');

		ipcMain.handle('wp_profile', async (_, numberOfSampling: number) => {
			return await service.request('profile', numberOfSampling);
		});
	}
}
