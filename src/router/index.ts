import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '工作台' }
  },
  {
    path: '/vehicle',
    name: 'Vehicle',
    component: () => import('@/views/vehicle/index.vue'),
    meta: { title: '车辆管理' }
  },
  {
    path: '/driver',
    name: 'Driver',
    component: () => import('@/views/driver/index.vue'),
    meta: { title: '司机管理' }
  },
  {
    path: '/line',
    name: 'Line',
    component: () => import('@/views/line/index.vue'),
    meta: { title: '线路管理' }
  },
  {
    path: '/transport-order',
    name: 'TransportOrder',
    component: () => import('@/views/transport-order/index.vue'),
    meta: { title: '运输订单' }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('@/views/statistics/index.vue'),
    meta: { title: '统计分析' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
