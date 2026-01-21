<template>
  <div class="image-info-container">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">图片数据分析</h2>
    
    <div class="charts-grid">
      <!-- 第一个图表 -->
      <div class="chart-wrapper bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
        <div ref="sourceChart" class="chart-container w-full min-h-[400px]"></div>
      </div>
      
      <!-- 第二个图表 -->
      <div class="chart-wrapper bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
        <div ref="ageChart" class="chart-container w-full min-h-[400px]"></div>
      </div>
      
      <!-- 第三个图表（柱形图） -->
      <div class="chart-wrapper bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
        <div ref="typeChart" class="chart-container w-full min-h-[400px]"></div>
      </div>

      <!-- 第四个图表（折线图：近15天请假人数） -->
      <div class="chart-wrapper bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
        <div ref="leaveTrendChart" class="chart-container w-full min-h-[400px]"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageInfo',
  data() {
    return {
      sourceChart: null,
      ageChart: null,
      typeChart: null,
      leaveTrendChart: null,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.initSourceChart();
      this.initAgeChart();
      this.initTypeChart();
      this.initLeaveTrendChart();

      window.addEventListener('resize', this.resizeCharts);
      //窗口大小改变事件监听器
    });
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts);
    this.destroyCharts();
    //移除监听并销毁实例
  },
  methods: {
    // 初始化男生女生比例图表，从后端接口获取数据
    initSourceChart() {
      // let that = this;
      const baseURL = 'http://127.0.0.1:8000/';
      // 调用后端获取学生性别统计接口
      axios.get(baseURL + 'getSourceChartData/')
        .then(res => {
          if (res.data.code === 1) { // 假设后端成功状态码为1
            const genderData = res.data.data; // 格式：[{name: '男', value: 50}, {name: '女', value: 30}]

            // 初始化图表   refs获取DOM元素
            this.sourceChart = echarts.init(this.$refs.sourceChart);

            // 配置项
            this.sourceChart.setOption({
              title: { text: '班级男女生比例', left: '52%', top: 4 },
              tooltip: { trigger: 'item' },
              legend: { top: 32, left: 'center' },
              series: [{
                name: '性别',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '58%'],
                data: genderData, // 直接使用后端返回的数据
                label: {
                  formatter: '{b}: {c} 人 ({d}%)' // 显示数量和百分比 b、c、d为echarts内置特定变量
                }
              }]
            });
          } else {
            this.$message.error("获取性别数据失败：" + res.data.msg);
          }
        })
        .catch(err => {
          console.error("请求性别数据出错：", err);
          this.$message.error("网络异常，请重试");
        });
    },
    // 初始化生日月份分析图表，从后端接口获取数据
    initTypeChart() {
      let that = this;
      const baseURL = 'http://127.0.0.1:8000/';
      axios.get(baseURL + 'getTypeChartData/') // 确保URL与后端路由一致
        .then(res => {
          if (res.data.code === 1) {
            const chartData = res.data.data;
            this.typeChart = echarts.init(this.$refs.typeChart);      //初始化echarts实例
            this.typeChart.setOption({
              title: { text: '班级生日月份分析', left: '52%', top: 4 },
              tooltip: { trigger: 'axis' },
              grid: { top: 70, left: 50, right: 30, bottom: 40 },
              xAxis: {
                type: 'category',
                // 从后端数据中提取月份名称作为x轴
                data: chartData.map(item => item.name)
              },
              yAxis: { type: 'value' },    //自适应数据范围(Echarts自动处理)
              series: [{
                name: '人数',
                type: 'bar',
                // 从后端数据中提取人数作为y轴
                data: chartData.map(item => item.value),
                itemStyle: {
                  color: '#165DFF'
                }
              }]
            });
          } else {
            this.$message.error("获取生日月份数据失败：" + res.data.msg);
          }
        })
        .catch(err => {
          console.error("请求生日月份数据出错：", err);
          that.$message.error("网络异常，请重试");
        });
    },
    initAgeChart() {
      const baseURL = 'http://127.0.0.1:8000/';
      // 调用后端获取学生年龄分布接口
      axios.get(baseURL + 'getAgeChartData/')
        .then(res => {
          if (res.data.code === 1) { // 后端成功状态码为1
            const ageData = res.data.data; // 格式：[{name: '18岁', value: 20}, {name: '19岁', value: 35}, ...]

            // 初始化图表
            this.ageChart = echarts.init(this.$refs.ageChart);

            // 使用后端数据设置图表
            this.ageChart.setOption({
              title: { text: '学生年龄分布', left: '52%', top: 4 },
              tooltip: { trigger: 'item' },
              legend: { top: 32, left: 'center' },
              series: [{
                name: '年龄',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '58%'],
                data: ageData, // 直接使用后端返回的数据
                label: {
                  formatter: '{b}: {c} 人 ({d}%)' // 显示数量和百分比
                }
              }]
            });
          } else {
            this.$message.error("获取年龄数据失败：" + res.data.msg);
          }
        })
        .catch(err => {
          console.error("请求年龄数据出错：", err);
          this.$message.error("网络异常，请重试");
        });
    },
    // 近15天请假人数折线图
    initLeaveTrendChart() {
      const baseURL = 'http://127.0.0.1:8000/';
      axios.get(baseURL + 'getLeaveTrendData/')
        .then(res => {
          if (res.data.code === 1) {
            const trend = res.data.data || [];
            this.leaveTrendChart = echarts.init(this.$refs.leaveTrendChart);
            this.leaveTrendChart.setOption({
              title: { text: '近15天请假人数', left: '55%', top: 4 },
              tooltip: { trigger: 'axis' },
              grid: { top: 70, left: 50, right: 30, bottom: 40 },
              xAxis: {
                type: 'category',
                boundaryGap: false,
                data: trend.map(item => item.name),
                axisLabel: {
                  rotate: 35,
                  formatter: (value) => (typeof value === 'string' && value.length >= 10 ? value.slice(5) : value)
                }
              },
              yAxis: { type: 'value', minInterval: 1 },
              series: [{
                name: '请假人数',
                type: 'line',
                smooth: true,
                data: trend.map(item => item.value),
                itemStyle: { color: '#00B42A' },
                areaStyle: { color: 'rgba(0,180,42,0.12)' }
              }]
            });
          } else {
            this.$message.error("获取请假趋势失败：" + res.data.msg);
          }
        })
        .catch(err => {
          console.error("请求请假趋势数据出错：", err);
          this.$message.error("网络异常，请重试");
        });
    },
    resizeCharts() {
      //自适应容器大小
      if (this.sourceChart) this.sourceChart.resize();
      if (this.typeChart) this.typeChart.resize();
      if (this.ageChart) this.ageChart.resize();
      if (this.leaveTrendChart) this.leaveTrendChart.resize();
    },
    destroyCharts() {
      //销毁实例释放资源
      if (this.sourceChart) {
        this.sourceChart.dispose();
        this.sourceChart = null;
      }
      if (this.typeChart) {
        this.typeChart.dispose();
        this.typeChart = null;
      }
      if (this.ageChart) {
        this.ageChart.dispose();
        this.ageChart = null;
      }
      if (this.leaveTrendChart) {
        this.leaveTrendChart.dispose();
        this.leaveTrendChart = null;
      }
    }
  }
}
</script>

<style scoped>
.image-info-container {
  padding: 20px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2rem; /* 对齐 gap-8 */
}

.chart-wrapper--span-2 {
  grid-column: 1 / -1;
}

@media (max-width: 900px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  .chart-wrapper--span-2 {
    grid-column: auto;
  }
}

.chart-wrapper {
  margin-bottom: 20px;
}

.chart-container {
  width: 100%;
  min-height: 400px;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.font-bold {
  font-weight: 700;
}

.text-gray-800 {
  color: #1f2937;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.gap-8 {
  gap: 2rem;
}

.bg-white {
  background-color: #fff;
}

.rounded-xl {
  border-radius: 0.75rem;
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.p-6 {
  padding: 1.5rem;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.duration-300 {
  transition-duration: 300ms;
}

.hover\:shadow-xl:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.font-semibold {
  font-weight: 600;
}

.text-gray-700 {
  color: #374151;
}

.mb-4 {
  margin-bottom: 1rem;
}

.w-full {
  width: 100%;
}

.min-h-\[400px\] {
  min-height: 400px;
}
</style>
