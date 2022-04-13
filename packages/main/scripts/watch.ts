import { resolve, join } from 'path';
import { watchMain } from './tsc';
import { Electron } from './electron';
import { exec } from 'child_process';

async function main() {
	exec('yarn dev', { cwd: resolve(__dirname, '../../render') });

	const electron = new Electron();

	const mainjs = resolve(__dirname, '../dist/index.js');

	watchMain(resolve(__dirname, '../tsconfig.json'), () => {
		electron.reload(mainjs);
	});
}

main()
	.then(() => {})
	.catch(e => console.log(e));
