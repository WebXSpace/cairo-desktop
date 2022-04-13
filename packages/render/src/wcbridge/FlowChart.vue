<template>
	<v-chart :option="option" :theme="'wp'" :autoresize="true" />
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useFlowData } from './flowchart';
export default defineComponent({
	setup() {
		const option = useFlowData();

		return {
			option,
		};
	},
});
</script>

<style css scoped></style>
