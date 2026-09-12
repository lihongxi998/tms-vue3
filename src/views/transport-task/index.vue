<template>
  <div class="task-page">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="全部任务" name="all" />
      <el-tab-pane label="待调度" name="pending" />
      <el-tab-pane label="进行中" name="ongoing" />
      <el-tab-pane label="已完成" name="done" />
      <el-tab-pane label="已取消" name="cancelled" />
    </el-tabs>

    <el-table
      :data="dataList"
      v-loading="loading"
      style="width: 100%"
      stripe
      :header-cell-style="{ background: 'rgba(250,252,255,1)' }"
    >
      <el-table-column align="left" label="序号" width="60">
        <template #default="{ $index }">
          <span>{{ $index + (queryParams.page - 1) * queryParams.pageSize + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" prop="id" label="任务编号" min-width="160" />
      <el-table-column align="left" prop="status" label="任务状态" min-width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="left" prop="startAgencyName" label="起始地" min-width="140">
        <template #default="{ row }">
          <span>{{ row.startAgencyName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" prop="endAgencyName" label="目的地" min-width="140">
        <template #default="{ row }">
          <span>{{ row.endAgencyName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" prop="licensePlate" label="车辆" min-width="120">
        <template #default="{ row }">
          <span>{{ row.truck?.licensePlate || row.licensePlate || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" prop="driverName" label="司机" min-width="110">
        <template #default="{ row }">
          <span>{{ row.driver?.name || row.driverName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" prop="createTime" label="创建时间" min-width="160">
        <template #default="{ row }">
          <span>{{ row.createTime || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" prop="finishTime" label="完成时间" min-width="160">
        <template #default="{ row }">
          <span>{{ row.finishTime || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" fixed="right" width="130">
        <template #default="{ row }">
          <el-link type="primary" :underline="false" @click="handleDetail(row)">
            查看详情
          </el-link>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="getList"
        @current-change="getList"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { transportTaskList } from '@/api/tms'

const loading = ref(false)
const dataList = ref<any[]>([])
const total = ref(0)
const activeTab = ref('all')

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  status: '' as string | number
})

const statusMap: Record<string, { text: string; type: string }> = {
  '1': { text: '待调度', type: 'warning' },
  '2': { text: '进行中', type: 'primary' },
  '3': { text: '待回单', type: 'info' },
  '4': { text: '已完成', type: 'success' },
  '5': { text: '已取消', type: 'danger' }
}

const statusText = (status: any) => statusMap[String(status)]?.text || String(status ?? '-')
const statusType = (status: any) => (statusMap[String(status)]?.type || 'info') as any

const getList = async () => {
  loading.value = true
  try {
    const data: any = {
      page: queryParams.page,
      pageSize: queryParams.pageSize
    }
    if (queryParams.status !== '') data.status = queryParams.status
    const res: any = await transportTaskList(data)
    dataList.value = res?.items || []
    total.value = res?.counts || 0
  } catch (e: any) {
    console.error('获取运输任务失败:', e)
    ElMessage.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const handleTabChange = (tab: string) => {
  const statusByTab: Record<string, string | number> = {
    all: '',
    pending: 1,
    ongoing: 2,
    done: 4,
    cancelled: 5
  }
  queryParams.status = statusByTab[tab] ?? ''
  queryParams.page = 1
  getList()
}

const handleDetail = (row: any) => {
  ElMessage.info(`运输任务详情：${row.id}`)
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.task-page {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
