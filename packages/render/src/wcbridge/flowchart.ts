import { computed } from '@vue/reactivity';
import { Ref } from 'vue';
import { useWCBridge } from '../syscall';
import { graphic } from 'echarts';

const title = {
	left: 'center',
	text: 'Wallet connect bridge flow graph',
};

const xAxis = [
	{
		type: 'time',
		splitLine: {
			show: false,
		},
	},
	{
		type: 'time',
		splitLine: {
			show: false,
		},
	},
];

const yAxis = [
	{
		type: 'value',
		// boundaryGap: [0, 1],
		splitLine: {
			show: false,
		},
	},
	{
		type: 'value',
		// boundaryGap: [0, 1],
		splitLine: {
			show: false,
		},
	},
];

// const tooltip = {
// 	trigger: 'axis',
// 	formatter: function (params: any) {
// 		let param = params[0];

// 		return `
// 		<a style="font-size:0.8em">
// 		${new Date(param.value[0]).toISOString()}
// 		</a>
// 		<br />
// 		<a style="font-weight:600;color:#818181">
// 		FLOW: ${param.value[1]}
// 		</a>
// 		<br />
// 		<a style="font-weight:600;color:#818181">
// 		PENDING: ${params[1].value[1]}
// 		</a>
// 		`;
// 	},
// 	axisPointer: {
// 		animation: false,
// 	},
// };

const tooltip = {
	trigger: 'axis',
	axisPointer: {
		type: 'cross',
		label: {
			backgroundColor: '#6a7985',
		},
	},
};

export function useFlowData(): Ref<any> {
	const bridge = useWCBridge();

	return computed(() => {
		const flowSampling = bridge.sampling.value.map(it => {
			return {
				value: [it.timestamp, it.flow],
			};
		});

		const pendingSampling = bridge.sampling.value.map(it => {
			return {
				value: [it.timestamp, it.pending],
			};
		});

		return {
			legend: {
				data: ['Transfer data', 'Pending data'],
			},
			color: ['#00cccc', '#001852'],
			// title,
			tooltip,
			xAxis,
			yAxis,
			series: [
				{
					name: 'Transfer data',
					type: 'line',
					showSymbol: false,
					data: flowSampling,
					lineStyle: {
						width: 1,
					},
				},
				{
					name: 'Pending data',
					type: 'line',
					showSymbol: false,
					data: pendingSampling,
					lineStyle: {
						width: 1,
					},
					areaStyle: {
						opacity: 0.8,
						color: new graphic.LinearGradient(0, 0, 0, 1, [
							{
								offset: 0,
								color: '#001852',
							},
							{
								offset: 1,
								color: '#00185271',
							},
						]),
					},
				},
			],
		};
	});
}
