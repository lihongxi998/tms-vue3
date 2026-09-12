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
import { Truck, Document, User, Location, DataAnalysis } from '@element-plus/icons-vue'
import { listVehicle, listTransportOrder } from '@/api/tms'

const statsLoading = ref(false)
const todosLoading = ref(false)

const stats = reactive({
  totalVehicles: 0,
  onlineVehicles: 0,
  todayOrders: 0,
  completionRate: 95.5
})

const todoList = ref<any[]>([])
const announcements = ref([
  { id: 1, date: '2024-09-12', content: 'TMS系统上线运行' },
  { id: 2, date: '2024-09-10', content: '新增实时GPS追踪功能' },
  { id: 3, date: '2024-09-08', content: '运输统计报表优化完成' }
])

let statsTimer: ReturnType<typeof setTimeout> | null = null
let todoTimer: ReturnType<typeof setTimeout> | null = null

const loadStats = async () => {
  statsLoading.value = true
  try {
    const [vehicleRes, orderRes] = await Promise.all([
      listVehicle({ page: 1, pageSize: 1 }),
      listTransportOrder({ page: 1, pageSize: 100 })
    ])
    
    stats.totalVehicles = vehicleRes?.total || 0
    stats.onlineVehicles = vehicleRes?.list?.filter((v: any) => v.status === 'online').length || 0
    const today = new Date().toISOString().split('T')[0]
    stats.todayOrders = orderRes?.list?.filter((o: any) => o.createTime?.startsWith(today)).length || 0
    stats.completionRate = orderRes?.total ? (orderRes.list.filter((o: any) => o.status === 'completed').length / orderRes.total * 100) : 95.5
  } catch (error) {
    console.error('加载统计数据失败:', error)
  } finally {
    statsLoading.value = false
  }
}

const loadTodos = async () => {
  todosLoading.value = true
  try {
    const res: any = await listTransportOrder({ status: 'pending' })
    todoList.value = (res?.list || []).slice(0, 5).map((o: any) => ({
      id: o.id,
      type: 'urgent',
      content: `运输订单 ${o.no} 待分配`
    }))
  } catch (error) {
    console.error('加载待办事项失败:', error)
  } finally {
    todosLoading.value = false
  }
}

const startPolling = () => {
  loadStats()
  loadTodos()
  
  statsTimer = setInterval(() => {
    loadStats()
  }, 30000)
  
  todoTimer = setInterval(() => {
    loadTodos()
  }, 60000)
}

onMounted(() => {
  startPolling()
})

onUnmounted(() => {
  if (statsTimer) clearInterval(statsTimer)
  if (todoTimer) clearInterval(todoTimer)
})
</script>

<style scoped>
.home-page { padding: 0; }
.stat-card { text-align: center; }
.stat-card :deep(.el-statistic__head) { font-size: 14px; color: #909399; }
.stat-card :deep(.el-statistic__content) { font-size: 28px; font-weight: bold; color: #303133; }
</style>
