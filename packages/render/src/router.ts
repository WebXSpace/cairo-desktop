import { createRouter, createWebHashHistory } from 'vue-router';

import { Dashbord } from './wcbridge';

const routes = [
	{
		path: '/',
		name: 'dashbord',
		component: Dashbord,
		children: [],
	},
];

export default createRouter({
	routes,
	history: createWebHashHistory(),
});
