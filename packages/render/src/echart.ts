import ECharts from 'vue-echarts';
import { use, registerTheme } from 'echarts/core';

// import ECharts modules manually to reduce bundle size
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart } from 'echarts/charts';
import {
	GridComponent,
	TooltipComponent,
	TitleComponent,
	LegendComponent,
} from 'echarts/components';

import theme from './echart.json';

registerTheme('wp', theme);

use([
	CanvasRenderer,
	BarChart,
	LineChart,
	GridComponent,
	TooltipComponent,
	TitleComponent,
	LegendComponent,
]);

export default ECharts;
