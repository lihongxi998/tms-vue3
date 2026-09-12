<template>
  <div class="line-page">
    <el-row :gutter="20" class="toolbar-row">
      <el-col :span="8">
        <el-button type="primary" @click="handleAddLine">新增</el-button>
      </el-col>
      <el-col :span="16" class="toolbar-right">
        <el-input
          v-model="queryParams.number"
          class="toolbar-input"
          placeholder="请输入线路编号"
          clearable
        />
        <el-input
          v-model="queryParams.name"
          class="toolbar-input"
          placeholder="请输入线路名称"
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
      <el-table-column type="expand">
        <template #default="{ row }">
          <el-table :data="row.trips || []" border style="width: 95%; margin: 10px auto">
            <el-table-column prop="name" label="车次名称" />
            <el-table-column prop="departureTime" label="发车频次" />
            <el-table-column prop="arrivalTime" label="到达时间" />
            <el-table-column label="车辆安排">
              <template #default="{ row: trip }">
                <span>{{ trip.truck?.licensePlate || '未安排' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="司机安排">
              <template #default="{ row: trip }">
                <span>{{ trip.driver?.name || '未安排' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default>
                <el-link type="primary" :underline="false">安排车辆司机</el-link>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column align="left" label="序号" width="60">
        <template #default="{ $index }">
          <span>{{ $index + (queryParams.page - 1) * queryParams.pageSize + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" prop="number" label="线路编号" min-width="140" />
      <el-table-column align="left" prop="name" label="线路名称" min-width="160" />
      <el-table-column align="left" label="线路类型" width="170">
        <template #default="{ row }">
          <span>{{ row.transportLineType?.name || row.transportLineTypeName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="起始地机构" min-width="140">
        <template #default="{ row }">
          <span>{{ row.startAgency?.name || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="目的地机构" min-width="140">
        <template #default="{ row }">
          <span>{{ row.endAgency?.name || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="距离（千米）" min-width="120">
        <template #default="{ row }">
          <span>{{ row.distance }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="成本（元）" min-width="110">
        <template #default="{ row }">
          <span>{{ row.cost }}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="预计时间（分钟）" min-width="140">
        <template #default="{ row }">
          <span>{{ row.estimatedTime }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-link type="primary" :underline="false" class="table-btn" @click="handleEdit(row)">
            编辑
          </el-link>
          <el-link type="danger" :underline="false" @click="handleDelete(row)">
            删除
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

    <!-- 新增/编辑线路弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="560px"
      destroy-on-close
    >
      <el-form :model="form" label-width="110px">
        <el-form-item label="线路名称" required>
          <el-input v-model="form.name" placeholder="请输入线路名称" />
        </el-form-item>
        <el-form-item label="线路类型">
          <el-select v-model="form.transportLineTypeId" placeholder="请选择线路类型" style="width: 100%">
            <el-option
              v-for="item in lineTypeOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="起始地机构">
          <el-input v-model="form.startOrganName" placeholder="请输入起始地机构" />
        </el-form-item>
        <el-form-item label="目的地机构">
          <el-input v-model="form.endOrganName" placeholder="请输入目的地机构" />
        </el-form-item>
        <el-form-item label="距离（千米）">
          <el-input-number v-model="form.distance" :min="0" :precision="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="成本（元）">
          <el-input-number v-model="form.cost" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="预计时间（分钟）">
          <el-input-number v-model="form.estimatedTime" :min="0" style="width: 100%" />
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
import { lineList, lineAdd, lineUpdate, lineDel, lineTypeList } from '@/api/tms'

const loading = ref(false)
const dataList = ref<any[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('新增线路')
const editingId = ref<number | null>(null)
const lineTypeOptions = ref<any[]>([])

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  number: '',
  name: ''
})

const form = reactive({
  name: '',
  transportLineTypeId: '' as string | number,
  startOrganName: '',
  endOrganName: '',
  distance: 0,
  cost: 0,
  estimatedTime: 0
})

const getList = async () => {
  loading.value = true
  try {
    const data: any = {
      page: queryParams.page,
      pageSize: queryParams.pageSize
    }
    if (queryParams.number) data.number = queryParams.number
    if (queryParams.name) data.name = queryParams.name
    const res: any = await lineList(data)
    dataList.value = res?.items || []
    total.value = res?.counts || 0
  } catch (e: any) {
    console.error('获取线路列表失败:', e)
    ElMessage.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const getLineTypes = async () => {
  try {
    lineTypeOptions.value = (await lineTypeList()) as any[] || []
  } catch (e) {
    console.error('获取线路类型失败:', e)
  }
}

const handleQuery = () => {
  queryParams.page = 1
  getList()
}

const resetQuery = () => {
  queryParams.number = ''
  queryParams.name = ''
  queryParams.page = 1
  getList()
}

const handleAddLine = () => {
  dialogTitle.value = '新增线路'
  editingId.value = null
  Object.assign(form, {
    name: '', transportLineTypeId: '', startOrganName: '',
    endOrganName: '', distance: 0, cost: 0, estimatedTime: 0
  })
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑线路'
  editingId.value = row.id
  Object.assign(form, {
    name: row.name || '',
    transportLineTypeId: row.transportLineTypeId || '',
    startOrganName: row.startAgency?.name || '',
    endOrganName: row.endAgency?.name || '',
    distance: row.distance || 0,
    cost: row.cost || 0,
    estimatedTime: row.estimatedTime || 0
  })
  dialogVisible.value = true
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除线路 ${row.name} 吗？`, '提示', { type: 'warning' })
    await lineDel(row.id)
    ElMessage.success('删除成功')
    getList()
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(e.message || '删除失败')
    }
  }
}

const submitForm = async () => {
  try {
    if (editingId.value) {
      await lineUpdate(editingId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await lineAdd({ ...form })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    getList()
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  }
}

onMounted(() => {
  getLineTypes()
  getList()
})
</script>

<style scoped>
.line-page {
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

.table-btn {
  margin-right: 16px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
