<template>
  <div class="home-page">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="车辆总数" :value="stats.totalVehicles" :loading="statsLoading">
            <template #prefix>
              <el-icon color="#409eff"><Truck /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="在线车辆" :value="stats.onlineVehicles" :loading="statsLoading" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="今日运输单">
            <template #suffix>单</template>
            <template #defaultValue>{{ stats.todayOrders }}</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="运输完成率">
            <template #suffix>%</template>
            <template #defaultValue>{{ stats.completionRate.toFixed(2) }}</template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>待办事项</span>
          </template>
          <el-empty v-if="!todosLoading && todoList.length === 0" description="暂无待办事项" />
          <el-empty v-else-if="todosLoading" description="加载中..." />
          <el-list v-else :data="todoList" style="max-height: 300px; overflow-y: auto">
            <el-list-item v-for="item in todoList" :key="item.id">
              <el-tag :type="item.type === 'urgent' ? 'danger' : 'warning'" size="small">{{ item.type === 'urgent' ? '紧急' : '普通' }}</el-tag>
              <span style="margin-left: 10px">{{ item.content }}</span>
            </el-list-item>
          </el-list>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>最新公告</span>
          </template>
          <el-timeline>
            <el-timeline-item v-for="item in announcements" :key="item.id" :timestamp="item.date" placement="top">
              {{ item.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px">
      <template #header>
        <span>快捷操作</span>
      </template>
      <el-space wrap>
        <el-button type="primary" @click="$router.push('/transport-order')">
          <el-icon><Document /></el-icon>
          运输订单
        </el-button>
        <el-button type="success" @click="$router.push('/vehicle')">
          <el-icon><Truck /></el-icon>
          车辆管理
        </el-button>
        <el-button type="warning" @click="$router.push('/driver')">
          <el-icon><User /></el-icon>
          司机管理
        </el-button>
        <el-button type="info" @click="$router.push('/line')">
          <el-icon><Location /></el-icon>
          线路管理
        </el-button>
        <el-button type="warning" @click="$router.push('/transport-task')">
          <el-icon><Van /></el-icon>
          运输任务
        </el-button>
        <el-button @click="$router.push('/statistics')">
          <el-icon><DataAnalysis /></el-icon>
          统计分析
        </el-button>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { Truck, Document, User, Location, DataAnalysis, Van } from '@element-plus/icons-vue'
import { dashboardData, truckCount, transportTaskCount } from '@/api/tms'

const statsLoading = ref(false)
const todosLoading = ref(false)
const stats = reactive({
  totalVehicles: 0,
  onlineVehicles: 0,
  todayOrders: 0,
  completionRate: 0
})
const todoList = ref<any[]>([])
const announcements = ref<any[]>([
  { id: 1, date: '2026-09-12', content: '系统维护通知：预计今晚 22:00 - 23:00 停机维护' },
  { id: 2, date: '2026-09-11', content: '新增车辆管理模块，支持批量导入' },
  { id: 3, date: '2026-09-10', content: '运输任务状态流更新' }
])

let timer: ReturnType<typeof setInterval> | null = null

const loadDashboard = async () => {
  statsLoading.value = true
  todosLoading.value = true
  try {
    const res: any = await dashboardData()
    if (res) {
      stats.totalVehicles = res.totalVehicles ?? stats.totalVehicles
      stats.onlineVehicles = res.onlineVehicles ?? stats.onlineVehicles
      stats.todayOrders = res.todayOrders ?? stats.todayOrders
      stats.completionRate = res.completionRate ?? stats.completionRate
      todoList.value = res.todoList ?? []
    }
  } catch (e) {
    console.error('加载工作台数据失败:', e)
    todoList.value = []
  }
  try {
    const [truckRes] = await Promise.allSettled([truckCount()])
    if (truckRes.status === 'fulfilled' && truckRes.value) {
      stats.totalVehicles = truckRes.value.total ?? stats.totalVehicles
      stats.onlineVehicles = truckRes.value.online ?? stats.onlineVehicles
    }
  } catch (e) {
    console.error('加载车辆统计失败:', e)
  }
  statsLoading.value = false
  todosLoading.value = false
}

onMounted(() => {
  loadDashboard()
  timer = setInterval(loadDashboard, 30000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.home-page {
  background: #f0f2f5;
  padding: 0;
}

.stat-card {
  text-align: center;
}
</style>
