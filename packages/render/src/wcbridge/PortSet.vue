<template>
	<div class="port-set">
		<form-field :name="t('LISTEN ADDRESS')">
			<copy-text class="address" :text="url"></copy-text>
		</form-field>
		<form-field :name="t('PORT')">
			<form-input v-model:text="text" type="number"></form-input>
		</form-field>
		<div class="range" :class="classes">1000 ~ 65535</div>
		<wx-button
			class="confirm"
			:text="t('Confirm')"
			color="var(--webx-background)"
			background="var(--webx-success)"
			:disabled="disabled"
			:loading="loading"
			@click="confirm"
		></wx-button>
	</div>
</template>

<script lang="ts">
import { computed } from '@vue/reactivity';
import { defineComponent, ref } from 'vue';
import { useWCBridge } from '../syscall';
import { FormField, FormInput, wxButton, CopyText } from '@webxspace/webxui';
import { useI18n } from 'vue-i18n';

export default defineComponent({
	components: {
		CopyText,
		FormField,
		FormInput,
		wxButton,
	},
	emits: ['dismiss'],
	setup(props, { emit }) {
		const wcBridge = useWCBridge();

		let _port = ref(wcBridge.port.value);

		const text = computed({
			get: () => {
				return `${wcBridge.port.value}`;
			},
			set: value => {
				_port.value = parseInt(value);
			},
		});

		const classes = computed(() => {
			if (_port.value < 1000 || _port.value > 65535) {
				return 'range-warning';
			}
		});

		const disabled = computed(() => {
			if (_port.value < 1000 || _port.value > 65535 || _port.value == wcBridge.port.value) {
				return true;
			}

			return false;
		});

		const loading = ref(false);

		const confirm = async () => {
			if (disabled.value || loading.value) {
				return;
			}

			loading.value = true;

			try {
				await wcBridge.resetPort(_port.value);
				emit('dismiss');
			} catch {}

			loading.value = false;
		};

		const { t } = useI18n();

		return {
			t,
			url: wcBridge.url,
			loading,
			confirm,
			disabled,
			classes,
			text,
		};
	},
});
</script>

<style css scoped>
.port-set {
	width: 400px;
	height: 160px;
	padding: var(--webx-padding-size);
	display: flex;
	flex-direction: column;
}

.confirm {
	margin-top: auto;
	max-width: 100px;
	align-self: flex-end;
	font-size: 0.85em;
}

.range {
	width: 100%;
	text-align: right;
	margin-bottom: var(--webx-padding-size);
	font-weight: 100;
	font-size: 0.8em;
	color: var(--webx-secondary);
}

.range-warning {
	color: var(--webx-danger);
	font-weight: 600;
}

.address {
	font-size: 0.8em;
}
</style>
