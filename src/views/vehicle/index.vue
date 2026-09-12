<template>
  <div class="vehicle-page">
    <el-row :gutter="20" class="toolbar-row">
      <el-col :span="8">
        <el-button type="primary" @click="handleAddVehicle">新增</el-button>
      </el-col>
      <el-col :span="16" class="toolbar-right">
        <el-select
          v-model="queryParams.truckTypeId"
          placeholder="请选择车辆类型"
          clearable
          class="toolbar-input"
        >
          <el-option
            v-for="item in truckTypeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
        <el-input
          v-model="queryParams.licensePlate"
          class="toolbar-input"
          placeholder="请输入车牌号码"
          clearable
        />
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-col>
    </el-row>

    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane
        v-for="tab in settingList"
        :key="tab.key"
        :label="`${tab.label} (${tab.num})`"
        :name="String(tab.value)"
      />
    </el-tabs>

    <el-table
      :data="dataList"
      v-loading="loading"
      style="width: 100%"
      stripe
      :header-cell-style="{ background: 'rgba(250,252,255,1)' }"
    >
      <el-table-column align="left" type="index" label="序号" width="60">
        <template #default="{ $index }">
          <span>{{ $index + (queryParams.page - 1) * queryParams.pageSize + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="车牌号码">
        <template #default="{ row }">
          <span>{{ row.licensePlate }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="车辆类型">
        <template #default="{ row }">
          <span>{{ row.truckTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="司机数量" prop="driverNum" />
      <el-table-column align="left" label="车辆状态">
        <template #default="{ row }">
          <div class="tableColumn-status" :class="{ 'stop-use': String(row.workStatus) === '0' }">
            {{ String(row.workStatus) === '1' ? '可用' : '停用' }}
          </div>
        </template>
      </el-table-column>
      <el-table-column align="left" label="GPS设备ID" min-width="120">
        <template #default="{ row }">
          <span>{{ row.deviceGpsId }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="实载重量（T）" min-width="120">
        <template #default="{ row }">
          <span>{{ row.allowableLoad }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="实载体积（方）" min-width="120">
        <template #default="{ row }">
          <span>{{ row.allowableVolume }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" fixed="right" width="200">
        <template #default="{ row }">
          <el-link type="primary" :underline="false" class="table-btn" @click="handleDetail(row)">
            查看详情
          </el-link>
          <el-link
            :type="String(row.workStatus) === '0' ? 'primary' : 'danger'"
            :underline="false"
            class="table-btn"
            @click="handleStatus(row)"
          >
            {{ String(row.workStatus) === '1' ? '停用' : '启用' }}
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

    <!-- 新增/编辑车辆弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="560px"
      destroy-on-close
    >
      <el-form :model="form" label-width="110px">
        <el-form-item label="车牌号码" required>
          <el-input v-model="form.licensePlate" placeholder="请输入车牌号码" />
        </el-form-item>
        <el-form-item label="车辆类型" required>
          <el-select v-model="form.truckTypeId" placeholder="请选择车辆类型" style="width: 100%">
            <el-option
              v-for="item in truckTypeOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="GPS设备ID">
          <el-input v-model="form.deviceGpsId" placeholder="请输入GPS设备ID" />
        </el-form-item>
        <el-form-item label="实载重量（T）">
          <el-input-number v-model="form.allowableLoad" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="实载体积（方）">
          <el-input-number v-model="form.allowableVolume" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  truckList, truckCount, truckTypeList, truckAdd, truckUpdate,
  truckEnable, truckDisable
} from '@/api/tms'

const loading = ref(false)
const dataList = ref<any[]>([])
const total = ref(0)
const activeTab = ref('2')
const truckTypeOptions = ref<any[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增车辆')
const editingId = ref<number | null>(null)

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  truckTypeId: '' as string | number,
  licensePlate: '',
  workStatus: 2 as string | number
})

const settingList = ref([
  { key: 'all', value: 2, label: '全部', num: 0 },
  { key: 'able', value: 1, label: '可用', num: 0 },
  { key: 'unable', value: 0, label: '停用', num: 0 }
])

const form = reactive({
  licensePlate: '',
  truckTypeId: '' as string | number,
  deviceGpsId: '',
  allowableLoad: 0,
  allowableVolume: 0
})

const getCarTypeStatics = async () => {
  try {
    const res: any = await truckCount()
    const counts = Array.isArray(res) ? res : []
    settingList.value[2].num = counts[0] || 0
    settingList.value[1].num = counts[1] || 0
    settingList.value[0].num = Number(settingList.value[1].num) + Number(settingList.value[2].num)
  } catch (e) {
    console.error('获取车辆统计失败:', e)
  }
}

const getTruckTypeList = async () => {
  try {
    truckTypeOptions.value = (await truckTypeList()) as any[] || []
  } catch (e) {
    console.error('获取车辆类型失败:', e)
  }
}

const getList = async () => {
  loading.value = true
  try {
    const params: any = { ...queryParams }
    if (params.workStatus === 2) {
      delete params.workStatus
    }
    if (!params.truckTypeId) delete params.truckTypeId
    if (!params.licensePlate) delete params.licensePlate
    const res: any = await truckList(params)
    dataList.value = res?.items || []
    total.value = res?.counts || 0
  } catch (e: any) {
    console.error('获取车辆列表失败:', e)
    ElMessage.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const handleTabChange = (tab: string) => {
  queryParams.workStatus = tab
  queryParams.page = 1
  getList()
}

const handleQuery = () => {
  queryParams.page = 1
  getList()
}

const resetQuery = () => {
  queryParams.truckTypeId = ''
  queryParams.licensePlate = ''
  queryParams.page = 1
  getList()
}

const handleAddVehicle = () => {
  dialogTitle.value = '新增车辆'
  editingId.value = null
  Object.assign(form, {
    licensePlate: '', truckTypeId: '', deviceGpsId: '',
    allowableLoad: 0, allowableVolume: 0
  })
  dialogVisible.value = true
}

const handleDetail = (row: any) => {
  ElMessage.info(`车辆详情：${row.licensePlate}`)
}

const handleStatus = async (row: any) => {
  const enable = String(row.workStatus) === '0'
  try {
    await ElMessageBox.confirm(
      `确定要${enable ? '启用' : '停用'}车辆 ${row.licensePlate} 吗？`,
      '提示',
      { type: 'warning' }
    )
    if (enable) {
      await truckEnable(row.id)
    } else {
      await truckDisable(row.id)
    }
    ElMessage.success(`${enable ? '启用' : '停用'}成功`)
    getList()
    getCarTypeStatics()
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(e.message || '操作失败')
    }
  }
}

const submitForm = async () => {
  try {
    if (editingId.value) {
      await truckUpdate(editingId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await truckAdd({ ...form })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    getList()
    getCarTypeStatics()
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  }
}

onMounted(() => {
  getCarTypeStatics()
  getTruckTypeList()
  getList()
})
</script>

<style scoped>
.vehicle-page {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.toolbar-row {
  margin-bottom: 16px;
}

.toolbar-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}

.toolbar-input {
  width: 180px;
}

.tableColumn-status {
  color: #409eff;
}

.tableColumn-status.stop-use {
  color: #f56c6c;
}

.table-btn {
  margin-right: 16px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
