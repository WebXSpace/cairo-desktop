import { getLogger, ServiceChannel } from '@electron-webxapp/utils';
import { WCBridge } from '@cairo/wcbridge';

import yargs from 'yargs/yargs';

const argv = yargs(process.argv.slice(2))
	.options({
		'storage-path': { type: 'string', demandOption: true },
		'wc-port': { type: 'number', demandOption: true },
	})
	.parseSync();

const logger = getLogger('wallet', 'wallet');

async function main() {
	logger.info('initialize wallet srevice ...');

	const serviceChannel = new ServiceChannel();

	// create wallet with infuraKey and wcBridge listen port
	const wallet = new WCBridge(argv.storagePath, argv.wcPort);

	serviceChannel.handle('start', async () => {
		await wallet.start();
	});

	serviceChannel.handle('profile', async (numberOfSampling: number) => {
		const topics = await wallet.topics();

		const clients = wallet.clients;

		const address = wallet.listenAddress;

		let sampling = wallet.sampling;

		if (sampling.length > numberOfSampling) {
			sampling = sampling.slice(sampling.length - numberOfSampling);
		}

		return {
			address,
			topics,
			clients,
			sampling,
		};
	});

	logger.info('initialize wallet srevice -- success');
}

main().catch(e => {
	logger.error(`run wallet service error: ${e}`);
});
