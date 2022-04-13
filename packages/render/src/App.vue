<template>
	<app-frame>
		<router-view></router-view>
	</app-frame>
	<notification></notification>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AppFrame, setupAppProvider, Notification } from '@webxspace/webxui';

import { AppProvider } from './syscall';

export default defineComponent({
	components: {
		AppFrame,
		Notification,
	},
	setup() {
		setupAppProvider(new AppProvider());
	},
});
</script>

<style>
#app {
	position: relative;
	background-color: var(--webx-background);
}
</style>

<style css scoped></style>
