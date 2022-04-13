import { ChildProcess, spawn } from 'child_process';
import { getLogger } from './logger';

const logger = getLogger('electron');

export class Electron {
	private _execPath = require('electron');

	private _childProcess?: ChildProcess;

	public reload(mainJSPath: string) {
		if (this._childProcess && !this._childProcess.killed) {
			this._childProcess.kill();
		}

		logger.info(`reload ...`);

		this._childProcess = spawn(this._execPath as any, [mainJSPath]);
		this._childProcess.stdout?.setEncoding('utf-8');
		this._childProcess.stderr?.setEncoding('utf-8');
		this._childProcess.stdout?.on('data', data => {
			const lines = (data as string).split('\n');
			lines.forEach(line => {
				logger.debug(line);
			});
		});

		this._childProcess.stderr?.on('data', data => {
			const lines = (data as string).split('\n');
			lines.forEach(line => {
				logger.error(line);
			});
		});
	}
}
