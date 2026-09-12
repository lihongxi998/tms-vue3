<template>
  <div class="driver-page">
    <el-row :gutter="20" class="toolbar-row">
      <el-col :span="8">
        <el-button type="primary" @click="handleAddDriver">新增</el-button>
      </el-col>
      <el-col :span="16" class="toolbar-right">
        <el-input
          v-model="queryParams.name"
          class="toolbar-input"
          placeholder="请输入司机姓名"
          clearable
        />
        <el-input
          v-model="queryParams.phone"
          class="toolbar-input"
          placeholder="请输入司机手机号"
          clearable
        />
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-col>
    </el-row>

    <el-table
      :data="dataList"
      v-loading="loading"
      style="width: 100%"
      stripe
      :header-cell-style="{ background: 'rgba(250,252,255,1)' }"
    >
      <el-table-column align="left" label="序号" min-width="80">
        <template #default="{ $index }">
          <span>{{ $index + (queryParams.page - 1) * queryParams.pageSize + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="司机姓名" min-width="150">
        <template #default="{ row }">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="司机年龄" min-width="100">
        <template #default="{ row }">
          <span>{{ row.age }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="司机驾龄" min-width="100">
        <template #default="{ row }">
          <span>{{ row.drivingAge }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="司机电话" min-width="140">
        <template #default="{ row }">
          <span>{{ row.mobile }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="关联车辆" min-width="140">
        <template #default="{ row }">
          <span>{{ row.truck ? row.truck.licensePlate : '' }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="所属机构" min-width="150">
        <template #default="{ row }">
          <span>{{ row.agency === null ? '' : row.agency.name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="工作状态" min-width="100">
        <template #default="{ row }">
          <div
            v-if="row.workStatus !== null"
            class="tableColumn-status"
            :class="{ 'stop-use': String(row.workStatus) === '0' }"
          >
            {{ String(row.workStatus) === '1' ? '上班' : '休息' }}
          </div>
          <span v-else>-</span>
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

    <!-- 新增司机弹窗 -->
    <el-dialog v-model="dialogVisible" title="新增司机" width="560px" destroy-on-close>
      <el-form :model="form" label-width="110px">
        <el-form-item label="司机姓名" required>
          <el-input v-model="form.name" placeholder="请输入司机姓名" />
        </el-form-item>
        <el-form-item label="司机手机号" required>
          <el-input v-model="form.mobile" placeholder="请输入司机手机号" />
        </el-form-item>
        <el-form-item label="司机年龄">
          <el-input-number v-model="form.age" :min="18" :max="65" style="width: 100%" />
        </el-form-item>
        <el-form-item label="司机驾龄">
          <el-input-number v-model="form.drivingAge" :min="0" :max="45" style="width: 100%" />
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
import { ElMessage } from 'element-plus'
import { driverList, driverAdd } from '@/api/tms'

const loading = ref(false)
const dataList = ref<any[]>([])
const total = ref(0)
const dialogVisible = ref(false)

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  name: '',
  phone: ''
})

const form = reactive({
  name: '',
  mobile: '',
  age: 30,
  drivingAge: 5
})

const getList = async () => {
  loading.value = true
  try {
    const params: any = { ...queryParams }
    if (!params.name) delete params.name
    if (!params.phone) delete params.phone
    const res: any = await driverList(params)
    dataList.value = res?.items || []
    total.value = res?.counts || 0
  } catch (e: any) {
    console.error('获取司机列表失败:', e)
    ElMessage.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.page = 1
  getList()
}

const resetQuery = () => {
  queryParams.name = ''
  queryParams.phone = ''
  queryParams.page = 1
  getList()
}

const handleAddDriver = () => {
  Object.assign(form, { name: '', mobile: '', age: 30, drivingAge: 5 })
  dialogVisible.value = true
}

const handleDetail = (row: any) => {
  ElMessage.info(`司机详情：${row.name}`)
}

const submitForm = async () => {
  try {
    await driverAdd({ ...form })
    ElMessage.success('新增成功')
    dialogVisible.value = false
    getList()
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  }
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.driver-page {
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

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
