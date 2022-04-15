<template>
	<div class="dashbord">
		<div class="title">
			<Icon class="icon" url="/icon.png"></Icon>
			<a class="title-text">WebXSpace wallet connect bridge - desktop</a>
		</div>
		<div class="status">
			<div class="status-icon" v-if="status">
				<loading size="4em"></loading>
			</div>
			<icon name="disconnect" class="disconnect" v-else></icon>
			<div class="status-content">
				<a class="status-message" v-if="status">{{ t('Listening ....') }}</a>
				<a class="status-message" v-else>{{ t('Stopped') }}</a>

				<div class="tips">
					<a class="tip">
						<icon name="statistical" class="tip-icon"></icon>
						{{ t('Clients', { clients }) }}
					</a>

					<a class="tip tip-click" @click="showingPortSet = true">
						<icon name="cloud" class="tip-icon"></icon>
						{{ t('Port', { port }) }}
					</a>
				</div>
			</div>
			<div class="buttons">
				<wx-button
					:text="t('Stop')"
					:loading="loading"
					color="var(--webx-background)"
					background="var(--webx-danger)"
					@click="stop"
					v-if="status"
				></wx-button>
				<wx-button
					:text="t('Start')"
					:loading="loading"
					color="var(--webx-background)"
					background="var(--webx-success)"
					@click="start"
					v-else
				></wx-button>
			</div>
		</div>
		<flow-chart class="chart"></flow-chart>
		<wx-dialog v-model:showing="showingPortSet">
			<PortSet @dismiss="showingPortSet = false"></PortSet>
		</wx-dialog>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useWCBridge } from '../syscall';
import { Icon, Loading, wxButton, wxDialog } from '@webxspace/webxui';
import PortSet from './PortSet.vue';
import FlowChart from './FlowChart.vue';

export default defineComponent({
	components: { Icon, Loading, wxButton, wxDialog, PortSet, FlowChart },
	setup() {
		const wcBridge = useWCBridge();
		const { t } = useI18n();

		const loading = ref(false);

		const stop = async () => {
			if (loading.value) {
				return;
			}

			try {
				loading.value = true;
				await wcBridge.stop();
			} catch {}

			loading.value = false;
		};

		const start = async () => {
			if (loading.value) {
				return;
			}

			try {
				loading.value = true;
				await wcBridge.start();
			} catch {}

			loading.value = false;
		};

		const showingPortSet = ref(false);

		return {
			showingPortSet,
			loading,
			start,
			stop,
			t,
			port: wcBridge.port,
			status: wcBridge.running,
			clients: wcBridge.clients,
			topics: wcBridge.topics,
		};
	},
});
</script>

<style css scoped>
.dashbord {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	user-select: none;
}

.title {
	display: flex;
	align-items: center;
	user-select: none;
	max-height: var(--webx-app-frame-sysbar-height);
	min-height: var(--webx-app-frame-sysbar-height);
	padding-inline: var(--webx-padding-size);
	-webkit-app-region: drag;
	border-bottom: solid var(--webx-border-width) var(--webx-border-color);
}

.title-text {
	font-size: 0.7em;
	color: var(--webx-primary);
	font-weight: 600;
}

.icon {
	width: 1em;
	height: 1em;
	margin-right: 0.5em;
}

.status {
	position: relative;
	margin-top: 2em;
	width: calc(100% - 8 * var(--webx-padding-size));
	display: flex;
	align-items: center;
	padding-inline: calc(4 * var(--webx-padding-size));
	align-items: center;
	height: 4em;
}

.status-message {
	font-size: 2em;
	color: var(--webx-primary);
	font-weight: 600;
	display: flex;
}

.status-icon {
	padding: 1px;
	border: dotted 3px var(--webx-secondary);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 2em;
}

.status-content {
	display: flex;
	flex-direction: column;
}

.tips {
	margin-top: 0.5em;
	display: flex;
	align-items: center;
	color: var(--webx-secondary);
}

.tip {
	margin-right: 2em;
	display: flex;
	align-items: center;
	font-size: 0.9em;
	padding-block-end: 0.2em;
}

.tip-click {
	cursor: pointer;
	border-bottom: solid var(--webx-border-width) var(--webx-secondary);
}

.tip-click:hover {
	border-bottom: solid var(--webx-border-width) var(--webx-accent);
}

.tip-icon {
	width: 1.5em;
	height: 1.5em;
	margin-right: 0.4em;
}

.buttons {
	flex: 1;
	display: flex;
	flex-direction: row-reverse;
}

.disconnect {
	width: 4em;
	height: 4em;
	margin-right: 2em;
}

.chart {
	flex: 1;
	margin-block-start: var(--webx-padding-size);
	background-color: var(--webx-secondary-background);
	padding-block: var(--webx-padding-size);
}
</style>
