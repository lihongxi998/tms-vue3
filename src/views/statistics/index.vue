<template>
  <div class="statistics-page">
    <el-row :gutter="20">
      <el-col :span="6" v-for="card in statCards" :key="card.label">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ card.value }}</div>
          <div class="stat-label">{{ card.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>车辆状态分布</span>
          </template>
          <div ref="vehicleChartRef" class="chart-container" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>任务状态分布</span>
          </template>
          <div ref="taskChartRef" class="chart-container" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { truckCount, transportTaskCount, truckList, transportTaskList } from '@/api/tms'

const vehicleChartRef = ref<HTMLElement>()
const taskChartRef = ref<HTMLElement>()
let vehicleChart: echarts.ECharts | null = null
let taskChart: echarts.ECharts | null = null

const statCards = ref([
  { label: '车辆总数', value: 0 },
  { label: '可用车辆', value: 0 },
  { label: '运输任务总数', value: 0 },
  { label: '进行中任务', value: 0 }
])

const loadStats = async () => {
  try {
    const truckRes: any = await truckCount()
    const counts = Array.isArray(truckRes) ? truckRes : []
    statCards.value[0].value = Number(counts[1] || 0) + Number(counts[0] || 0)
    statCards.value[1].value = counts[1] || 0

    const vehicles: any = await truckList({ page: 1, pageSize: 100 })
    const items = vehicles?.items || []
    const available = items.filter((v: any) => String(v.workStatus) === '1').length
    const disabled = items.length - available

    if (vehicleChart && vehicleChartRef.value) {
      vehicleChart.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: 0 },
        series: [
          {
            type: 'pie',
            radius: ['40%', '65%'],
            data: [
              { name: '可用', value: available },
              { name: '停用', value: disabled }
            ]
          }
        ]
      })
    }
  } catch (e) {
    console.error('加载车辆统计失败:', e)
  }

  try {
    const taskRes: any = await transportTaskCount()
    const taskCounts = Array.isArray(taskRes) ? taskRes : []
    statCards.value[2].value = taskCounts.reduce((s: number, v: any) => s + Number(v || 0), 0)
    statCards.value[3].value = taskCounts[1] || 0

    const tasks: any = await transportTaskList({ page: 1, pageSize: 100 })
    const taskItems = tasks?.items || []
    const statusName: Record<string, string> = {
      '1': '待调度', '2': '进行中', '3': '待回单', '4': '已完成', '5': '已取消'
    }
    const statusGroup: Record<string, number> = {}
    taskItems.forEach((t: any) => {
      const key = String(t.status ?? '0')
      statusGroup[key] = (statusGroup[key] || 0) + 1
    })

    if (taskChart && taskChartRef.value) {
      taskChart.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: 0 },
        series: [
          {
            type: 'pie',
            radius: ['40%', '65%'],
            data: Object.entries(statusGroup).map(([k, v]) => ({
              name: statusName[k] || k,
              value: v
            }))
          }
        ]
      })
    }
  } catch (e) {
    console.error('加载任务统计失败:', e)
  }
}

const handleResize = () => {
  vehicleChart?.resize()
  taskChart?.resize()
}

onMounted(() => {
  if (vehicleChartRef.value) {
    vehicleChart = echarts.init(vehicleChartRef.value)
  }
  if (taskChartRef.value) {
    taskChart = echarts.init(taskChartRef.value)
  }
  loadStats()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  vehicleChart?.dispose()
  taskChart?.dispose()
})
</script>

<style scoped>
.statistics-page {
  padding: 0;
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  margin-top: 8px;
  color: #909399;
  font-size: 14px;
}

.chart-container {
  height: 320px;
}
</style>
