import { Params, ServiceConfig, SysCall, SamplingData } from '@cairo/syscall';
import { Ref, ref } from 'vue';
import { IAppProvider } from '@webxspace/webxui';

const sysCall = new SysCall();

export class AppProvider implements IAppProvider {
	maximized = ref(false);
	resizable = ref(false);

	isMacOS = ref(true);

	walletProxy = sysCall;

	constructor() {
		this.isMacOS.value = this.walletProxy.platform() == 'darwin';

		this.walletProxy.maximized().then(it => (this.maximized.value = it));

		this.walletProxy.resizeable().then(it => (this.resizable.value = it));
	}

	async minimize(): Promise<void> {
		await this.walletProxy.minimize();
	}

	async maximizeOrNormalmize(): Promise<void> {
		await this.walletProxy.maximizeOrNormalmize();
	}

	async close() {
		await this.walletProxy.close();
	}
}

export class WCBridge {
	private walletProxy = sysCall;

	readonly port = ref(0);

	readonly running = ref(false);

	readonly clients = ref(0);

	readonly topics = ref(0);

	readonly sampling = ref<SamplingData[]>([]);

	readonly url = ref('');

	private params?: Params;

	constructor() {
		this._fetchStatus().then();

		let timer = this._updateLoop();

		sysCall.on('el_window_hide', () => {
			clearInterval(timer);
		});

		sysCall.on('el_window_show', () => {
			timer = this._updateLoop();
		});
	}

	private _updateLoop(): number {
		return setInterval(async () => {
			const profile = await this.walletProxy.profile(60);

			this.clients.value = profile.clients;
			this.topics.value = profile.topics;
			this.sampling.value = profile.sampling;

			this.url.value = (profile as any).address;
		}, 1000);
	}

	async _fetchStatus() {
		const services = await this.walletProxy.services();

		const service = services.find(s => s.name == 'wp-wcbridge');

		if (service) {
			if (service.status == 'running') {
				this.running.value = true;
			} else {
				this.running.value = false;
			}

			this.params = this._params(service)!;

			this.port.value = this.params['wc-port'] as number;
		}
	}

	_params(config: ServiceConfig): Params | undefined {
		let params = config.params;

		if (!params) {
			params = config.defaultParams;
		}

		return params;
	}

	async start() {
		await this._fetchStatus();

		if (this.running.value) {
			return;
		}

		await this.walletProxy.disableService('wp-wcbridge', false);

		await this._fetchStatus();
	}

	async stop() {
		await this._fetchStatus();

		if (!this.running.value) {
			return;
		}

		await this.walletProxy.disableService('wp-wcbridge', true);

		await this._fetchStatus();
	}

	async resetPort(port: number) {
		await this._fetchStatus();

		if (port == this.port.value) {
			return;
		}

		this.params!['wc-port'] = port;

		await this.walletProxy.setServiceParams('wp-wcbridge', this.params!);

		await this._fetchStatus();
	}
}

const _wcBridge = new WCBridge();

export function useWCBridge(): WCBridge {
	return _wcBridge;
}
