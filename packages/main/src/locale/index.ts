import { app } from 'electron';

const strings = {
	'zh-CN': {
		SHOW_STATUS: '状态',
		QUIT_APP: '退出',
		OPEN_AT_LOGIN: '开机启动',
	},
	en: {
		SHOW_STATUS: 'Dashbord',
		QUIT_APP: 'Quit',
		OPEN_AT_LOGIN: 'Open at login',
	},
};

export function t(id: string): string {
	const locale = app.getLocale();

	console.log('locale', locale);

	let localeStrings = (strings as any)[locale];

	if (!localeStrings) {
		localeStrings = (strings as any)['en'];
	}

	return localeStrings[id] ?? id;
}
