import request from '@/utils/request'

export interface Vehicle {
  id: number
  licensePlate: string
  truckTypeName: string
  truckTypeId: number
  driverNum: number
  workStatus: string | number
  deviceGpsId: string
  allowableLoad: string
  allowableVolume: string
}

export interface Driver {
  id: number
  name: string
  age: number
  drivingAge: number
  mobile: string
  truck?: { licensePlate: string } | null
  agency?: { name: string } | null
  workStatus: string | number | null
}

export interface TransportLine {
  id: number
  number: string
  name: string
  transportLineTypeName?: string
  startAgency?: { name: string } | null
  endAgency?: { name: string } | null
  distance: number
  cost: number
  estimatedTime: number
  trips?: any[]
}

export interface TransportOrder {
  id: string
  waybillNo?: string
  createTime: string
  status: number | string
  senderName: string
  senderPhone: string
  senderAddress?: string
  receiverName: string
  receiverPhone: string
  receiverAddress?: string
  pickupType: number | string
  payType: number | string
  paymentStatus: number | string
}

// 工作台数据
export const dashboardData = () => request.get({ url: '/workspace' })

// 车辆管理
export const truckList = (params: any) => request.get({ url: '/base/truck/page', params })
export const truckCount = () => request.get({ url: '/base/truck/count' })
export const truckTypeList = () => request.get({ url: '/base/truck/type/findAll' })
export const truckAdd = (data: any) => request.post({ url: '/base/truck', data })
export const truckUpdate = (id: number, data: any) => request.put({ url: `/base/truck/${id}`, data })
export const truckDel = (id: number) => request.delete({ url: `/base/del/${id}` })
export const truckEnable = (id: number) => request.put({ url: `/base/truck/enable/${id}` })
export const truckDisable = (id: number) => request.put({ url: `/base/truck/disable/${id}` })

// 司机管理
export const driverList = (params: any) => request.get({ url: '/sys/driver/page', params })
export const driverAdd = (data: any) => request.post({ url: '/sys/driver/insertDriver', data })
export const driverUpdate = (id: number, data: any) => request.put({ url: `/sys/driver/driver/${id}`, data })
export const driverDetail = (id: number) => request.get({ url: `/sys/driver/driver/${id}` })

// 线路管理
export const lineList = (data: any) => request.post({ url: '/base/transportLine/page', data })
export const lineAdd = (data: any) => request.post({ url: '/base/transportLine', data })
export const lineUpdate = (id: number, data: any) => request.put({ url: `/base/transportLine/${id}`, data })
export const lineDel = (id: number) => request.delete({ url: `/base/transportLine/${id}` })
export const lineDetail = (id: number) => request.get({ url: `/base/transportLine/${id}` })
export const lineTypeList = () => request.get({ url: '/web-manager/common/transportLineType/simple' })

// 订单管理
export const orderList = (data: any) => request.post({ url: '/order-manager/order/page', data })
export const orderDetail = (id: string) => request.get({ url: `/order-manager/order/${id}` })

// 运单管理
export const waybillList = (data: any) => request.post({ url: '/transport-order-manager/page', data })
export const waybillCount = () => request.get({ url: '/transport-order-manager/count' })
export const waybillDetail = (id: string) => request.get({ url: `/transport-order-manager/${id}` })

// 运输任务管理
export const transportTaskList = (data: any) => request.post({ url: '/base/transport-task-manager/page', data })
export const transportTaskCount = () => request.get({ url: '/base/transport-task-manager/count' })
export const transportTaskDetail = (id: string) => request.get({ url: `/base/transport-task-manager/${id}` })

// 统计
export const getTransportStats = (params?: any) => request.get({ url: '/workspace', params })
