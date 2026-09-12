<template>
  <div class="vehicle-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>车辆管理</span>
          <el-button type="primary" size="small" @click="handleCreate">添加车辆</el-button>
        </div>
      </template>
      
      <el-form :inline="true" :model="queryParams" class="filter-form">
        <el-form-item label="车牌号">
          <el-input v-model="queryParams.plateNo" placeholder="请输入车牌号" clearable />
        </el-form-item>
        <el-form-item label="车辆状态">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="在线" value="online" />
            <el-option label="离线" value="offline" />
            <el-option label="维修中" value="maintenance" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="vehicles" v-loading="loading" style="width: 100%" stripe>
        <el-table-column prop="plateNo" label="车牌号" width="150" />
        <el-table-column prop="model" label="车型" width="150" />
        <el-table-column prop="capacity" label="载重(吨)" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadData"
        @current-change="loadData"
        class="pagination"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listVehicle, delVehicle } from '@/api/tms'

const loading = ref(false)

const queryParams = reactive({
  plateNo: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const vehicles = ref<any[]>([])

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    'online': 'success',
    'offline': 'info',
    'maintenance': 'warning'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    'online': '在线',
    'offline': '离线',
    'maintenance': '维修中'
  }
  return texts[status] || status
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      ...queryParams,
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    const res: any = await listVehicle(params)
    vehicles.value = res?.list || []
    pagination.total = res?.total || 0
  } catch (error: any) {
    console.error('加载车辆列表失败:', error)
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const resetQuery = () => {
  Object.assign(queryParams, { plateNo: '', status: '' })
  pagination.page = 1
  loadData()
}

const handleCreate = () => {
  ElMessage.info('添加车辆功能开发中...')
}

const handleEdit = (row: any) => {
  ElMessage.info(`编辑车辆: ${row.plateNo}`)
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该车辆吗？', '提示', { type: 'warning' })
    await delVehicle(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.vehicle-page { padding: 0; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
.filter-form { margin-bottom: 20px; }
.pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>
