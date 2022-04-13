import { SysCallChannel, SysCall as SysCallBase } from '@electron-webxapp/syscall';

export * from '@electron-webxapp/syscall';

export interface SamplingData {
	pending: number;
	flow: number;
	timestamp: number;
}

export interface Profile {
	topics: number;
	clients: number;
	sampling: SamplingData[];
}

export class SysCall extends SysCallBase {
	async profile(numberOfSampling: number): Promise<Profile> {
		return await window.electron.request<SysCallChannel>('wp_profile', numberOfSampling);
	}
}
