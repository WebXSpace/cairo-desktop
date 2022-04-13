import { createI18n } from 'vue-i18n';
import en from './en';
import zh from './zh';

const i18n = createI18n({
	legacy: false,
	locale: navigator.languages[0],
	fallbackLocale: 'en',
	messages: {
		en,
		'zh-CN': zh,
	},
});

export default i18n;
