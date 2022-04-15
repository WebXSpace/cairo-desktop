import { WalletProxyApp } from './electron/app';
import { app } from 'electron';

import { getLogger } from '@electron-webxapp/utils';

async function main() {
	const app = new WalletProxyApp();
	await app.start();
}

main().catch(e => {
	getLogger('cairo-hub').error(`run cairo hub app error: ${e}`);
	app.quit();
});
