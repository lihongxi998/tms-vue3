<template>
  <div class="order-page">
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" label-width="90px">
        <el-row :gutter="40">
          <el-col :span="8">
            <el-form-item label="订单编号:">
              <el-input v-model="queryParams.id" placeholder="请输入订单编号" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="订单状态:">
              <el-select v-model="queryParams.status" placeholder="请选择" clearable>
                <el-option
                  v-for="item in orderStatusOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="付费状态:">
              <el-select v-model="queryParams.paymentStatus" placeholder="请选择" clearable>
                <el-option
                  v-for="item in paymentStatusOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="发件人姓名:">
              <el-input v-model="queryParams.senderName" placeholder="请输入发件人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="发件人电话:">
              <el-input v-model="queryParams.senderPhone" placeholder="请输入发件人电话" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="收件人姓名:">
              <el-input v-model="queryParams.receiverName" placeholder="请输入收件人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="收件人电话:">
              <el-input v-model="queryParams.receiverPhone" placeholder="请输入收件人电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" class="search-btns">
            <el-button type="primary" @click="handleQuery">搜索</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

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
      <el-table-column align="left" label="订单编号" min-width="160">
        <template #default="{ row }">
          <el-link type="primary" :underline="false" @click="handleDetail(row)">
            {{ row.id }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column align="left" label="运单编号" min-width="160">
        <template #default="{ row }">
          <span>{{ row.waybillNo || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="下单时间" min-width="160">
        <template #default="{ row }">
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="订单状态" min-width="100">
        <template #default="{ row }">
          <span>{{ formatStatus(orderStatusOptions, row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="发件人姓名" min-width="110">
        <template #default="{ row }">
          <span>{{ row.senderName }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="发件人电话" min-width="130">
        <template #default="{ row }">
          <span>{{ row.senderPhone }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="发件人地址" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.senderAddress || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="收件人姓名" min-width="110">
        <template #default="{ row }">
          <span>{{ row.receiverName }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="收件人电话" min-width="130">
        <template #default="{ row }">
          <span>{{ row.receiverPhone }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="收件人地址" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.receiverAddress || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="取件类型" min-width="100">
        <template #default="{ row }">
          <span>{{ row.pickupType === 1 ? '网点自寄' : '上门取件' }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="付费类型" min-width="100">
        <template #default="{ row }">
          <span>{{ formatStatus(payTypeOptions, row.payType) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="付费状态" min-width="100">
        <template #default="{ row }">
          <span>{{ formatStatus(paymentStatusOptions, row.paymentStatus) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" fixed="right" width="100">
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
import { orderList } from '@/api/tms'

const loading = ref(false)
const dataList = ref<any[]>([])
const total = ref(0)

const orderStatusOptions = [
  { id: 0, name: '待取件' },
  { id: 1, name: '已取件' },
  { id: 2, name: '网点中' },
  { id: 3, name: '运输中' },
  { id: 4, name: '待派送' },
  { id: 5, name: '派送中' },
  { id: 6, name: '已签收' },
  { id: 7, name: '已取消' }
]

const paymentStatusOptions = [
  { id: 0, name: '未付费' },
  { id: 1, name: '已付费' }
]

const payTypeOptions = [
  { id: 1, name: '预付' },
  { id: 2, name: '到付' },
  { id: 3, name: '月结' }
]

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  id: '',
  status: '' as string | number,
  paymentStatus: '' as string | number,
  senderName: '',
  senderPhone: '',
  receiverName: '',
  receiverPhone: ''
})

const formatStatus = (options: any[], value: any) => {
  const found = options.find((o) => String(o.id) === String(value))
  return found ? found.name : value ?? '-'
}

const getList = async () => {
  loading.value = true
  try {
    const data: any = {
      page: queryParams.page,
      pageSize: queryParams.pageSize
    }
    if (queryParams.id) data.id = queryParams.id
    if (queryParams.status !== '') data.status = queryParams.status
    if (queryParams.paymentStatus !== '') data.paymentStatus = queryParams.paymentStatus
    if (queryParams.senderName) data.senderName = queryParams.senderName
    if (queryParams.senderPhone) data.senderPhone = queryParams.senderPhone
    if (queryParams.receiverName) data.receiverName = queryParams.receiverName
    if (queryParams.receiverPhone) data.receiverPhone = queryParams.receiverPhone
    const res: any = await orderList(data)
    dataList.value = res?.items || []
    total.value = res?.counts || 0
  } catch (e: any) {
    console.error('获取订单列表失败:', e)
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
  Object.assign(queryParams, {
    page: 1,
    id: '',
    status: '',
    paymentStatus: '',
    senderName: '',
    senderPhone: '',
    receiverName: '',
    receiverPhone: ''
  })
  getList()
}

const handleDetail = (row: any) => {
  ElMessage.info(`订单详情：${row.id}`)
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.order-page {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.search-card {
  margin-bottom: 16px;
}

.search-card :deep(.el-form-item) {
  margin-bottom: 14px;
}

.search-btns {
  text-align: center;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
