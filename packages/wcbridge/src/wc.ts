import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import websocket, { AddressInfo } from 'ws';
import { getLogger, Storage } from '@electron-webxapp/app';

@Entity()
class Channel {
	@PrimaryGeneratedColumn()
	id!: number;

	@Index()
	@Column({ nullable: false })
	topic!: string;

	@Column({ nullable: false })
	content!: string;

	@CreateDateColumn()
	createTime!: string;
}

interface SocketMessage {
	topic: string;
	type: string;
	payload: string;
}

interface Profile {
	pending: number;
	flow: number;
	timestamp: number;
}

export class WCBridge extends Storage {
	private _server: websocket.Server;

	private _clients = new Map<string, websocket>();
	private _topics = new Map<websocket, string>();

	private _logger = getLogger('wc-service');

	private _flow = 0;

	private _sampling = new Array<Profile>();

	/**
	 * create wallet connect bridge service
	 * @param port service listen port
	 */
	constructor(rootDir: string, port: number) {
		super(rootDir, 'wc', [Channel]);

		this._server = new websocket.Server({ port: port });

		this._server.on('connection', (ws: websocket) => {
			this.onConnect(ws);
		});
	}

	async _clearTimeout() {
		await this.repository(Channel)
			.createQueryBuilder('c')
			.where('time("now","-1 minute") > time(createTime)')
			.delete()
			.execute();
	}

	async start() {
		await super.connect();
		await this._clearTimeout();

		setInterval(async () => {
			const flow = this._flow;
			this._flow = 0;
			this._sampling.push({
				pending: await this.pending(),
				flow,
				timestamp: new Date().getTime(),
			});

			if (this._sampling.length > 1000) {
				this._sampling = this._sampling.slice(1);
			}
		}, 1000);

		setInterval(async () => {
			await this._clearTimeout();
		}, 60000);
	}

	private onConnect(ws: websocket) {
		let alive = true;
		ws.on('message', data => {
			this.onData(ws, data);
		});

		ws.on('pong', () => {
			alive = true;
		});

		const interval = setInterval(() => {
			if (!alive) {
				ws.terminate();

				return;
			}

			alive = false;

			ws.ping();
		}, 4000);

		ws.on('close', () => {
			clearInterval(interval);

			const topic = this._topics.get(ws);

			if (topic) {
				this._clients.delete(topic);
			}

			this._topics.delete(ws);

			this._logger.info(`close socket ${topic}`);
		});
	}

	private onData(ws: websocket, data: any) {
		this._logger.debug(`recv ${data} from ${this._topics.get(ws)}`);

		const message = JSON.parse(data) as SocketMessage;

		switch (message.type) {
			case 'pub':
				this.pubTopic(message)
					.then(() => {
						this._logger.info(`pub ${message.topic} -- success`);
					})
					.catch(e => {
						this._logger.error(`pub ${message.topic} error ${e.toString()}`);
					});
				break;
			case 'sub': {
				this.subTopic(ws, message.topic)
					.then(() => {
						this._logger.info(`sub ${message.topic} -- success`);
					})
					.catch(e => {
						this._logger.error(`sub ${message.topic} error ${e.toString()}`);
					});
				break;
			}
		}
	}

	private async pubTopic(message: SocketMessage) {
		this._logger.info(`pub ${message.topic}`);

		await this.repository(Channel).save({
			topic: message.topic,
			content: JSON.stringify(message),
		});

		const client = this._clients.get(message.topic);

		if (!client) {
			return;
		}

		await this.sendLoop(client, message.topic);
	}

	private async subTopic(ws: websocket, topic: string) {
		this._clients.set(topic, ws);

		this._topics.set(ws, topic);

		setTimeout(async () => {
			await this.sendLoop(ws, topic);
		}, 1000);
	}

	private async sendLoop(ws: websocket, topic: string) {
		while (true) {
			const channel = await this.fetchOne(topic);

			if (!channel) {
				this._logger.info(`sub ${topic} -- fetch loop stop`);
				break;
			}
			try {
				this._logger.info(
					`send ${topic} message: ${channel.id} ${JSON.stringify(channel)}`,
				);
				await this.sendToSub(ws, channel.content);
				this._logger.info(`send ${topic} message: ${channel.id} -- success`);
				await this.deleteOne(channel.id);
				this._flow++;
			} catch (error) {
				this._logger.error(`remove sub ${topic}, ${error}`);
				this._clients.delete(topic);
				break;
			}
		}
	}

	private async sendToSub(ws: websocket, message: string): Promise<void> {
		return new Promise((resolve, reject) => {
			ws.send(message, error => {
				if (error) {
					reject(error);
				}
			});

			resolve();
		});
	}

	private async fetchOne(topic: string): Promise<Channel | undefined> {
		return await this.repository(Channel).findOne(undefined, {
			where: {
				topic: topic,
			},
			order: {
				id: 'ASC',
			},
		});
	}

	private async deleteOne(id: number) {
		return await this.repository(Channel).delete({ id: id });
	}

	private async pending() {
		return await this.repository(Channel).count();
	}

	public async topics() {
		return await this.repository(Channel)
			.createQueryBuilder('c')
			.distinctOn(['c.topic'])
			.getCount();
	}

	public get sampling(): Profile[] {
		return this._sampling;
	}

	public get clients(): number {
		return this._clients.size;
	}

	public get listenAddress(): string {
		const info = this._server.address() as AddressInfo;

		return `ws://${getIPAddress()}:${info.port}`;
	}
}

function getIPAddress() {
	var interfaces = require('os').networkInterfaces();
	for (var devName in interfaces) {
		var iface = interfaces[devName];
		for (var i = 0; i < iface.length; i++) {
			var alias = iface[i];
			if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
				return alias.address;
			}
		}
	}
}
