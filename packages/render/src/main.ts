import { createApp } from 'vue';
import App from './App.vue';

import i18n from './lang';

import { VueClipboard } from '@soerenmartius/vue3-clipboard';
import router from './router';
import 'virtual:svg-icons-register';

import 'animate.css';

import { webxui } from '@webxspace/webxui';
import '@webxspace/webxui/dist/style.css';
import Echart from './echart';

createApp(App)
	.component('v-chart', Echart)
	.use(webxui)
	.use(i18n)
	.use(router)
	.use(VueClipboard)
	.mount('#app');
