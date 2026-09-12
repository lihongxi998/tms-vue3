<template>
  <div class="driver-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>司机管理</span>
          <el-button type="primary" size="small" @click="handleCreate">添加司机</el-button>
        </div>
      </template>
      
      <el-table :data="drivers" v-loading="loading" style="width: 100%" stripe>
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="licenseNo" label="驾驶证号" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">{{ row.status === 'active' ? '在线' : '离线' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listDriver } from '@/api/tms'

const loading = ref(false)
const drivers = ref<any[]>([])

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await listDriver({ page: 1, pageSize: 50 })
    drivers.value = res?.list || []
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => loadData())
</script>

<style scoped>
.driver-page { padding: 0; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
</style>
