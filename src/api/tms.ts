import request from '@/utils/request'

export interface Vehicle {
  id: number
  plateNo: string
  model: string
  capacity: number
  status: string
}

export interface Driver {
  id: number
  name: string
  phone: string
  licenseNo: string
  status: string
}

export interface TransportLine {
  id: number
  name: string
  origin: string
  destination: string
  distance: number
  duration: number
}

export interface TransportOrder {
  id: number
  no: string
  lineId: number
  lineName: string
  vehicleId: number
  vehiclePlate: string
  driverId: number
  driverName: string
  status: string
  createTime: string
}

// 车辆管理
export const listVehicle = (params?: any) => {
  return request.get({ url: '/tms/transit/vehicle/list', params })
}

export const addVehicle = (data: any) => {
  return request.post({ url: '/tms/transit/vehicle/create', data })
}

export const updateVehicle = (id: number, data: any) => {
  return request.put({ url: `/tms/transit/vehicle/update/${id}`, data })
}

export const delVehicle = (id: number) => {
  return request.delete({ url: `/tms/transit/vehicle/delete/${id}` })
}

// 司机管理
export const listDriver = (params?: any) => {
  return request.get({ url: '/tms/transit/driver/list', params })
}

export const addDriver = (data: any) => {
  return request.post({ url: '/tms/transit/driver/create', data })
}

export const updateDriver = (id: number, data: any) => {
  return request.put({ url: `/tms/transit/driver/update/${id}`, data })
}

export const delDriver = (id: number) => {
  return request.delete({ url: `/tms/transit/driver/delete/${id}` })
}

// 线路管理
export const listLine = (params?: any) => {
  return request.get({ url: '/tms/transport/line/list', params })
}

export const addLine = (data: any) => {
  return request.post({ url: '/tms/transport/line/create', data })
}

export const updateLine = (id: number, data: any) => {
  return request.put({ url: `/tms/transport/line/update/${id}`, data })
}

export const delLine = (id: number) => {
  return request.delete({ url: `/tms/transport/line/delete/${id}` })
}

// 运输订单
export const listTransportOrder = (params?: any) => {
  return request.get({ url: '/tms/transport/order/list', params })
}

export const addTransportOrder = (data: any) => {
  return request.post({ url: '/tms/transport/order/create', data })
}

export const updateTransportOrder = (id: number, data: any) => {
  return request.put({ url: `/tms/transport/order/update/${id}`, data })
}

// 统计
export const getTransportStats = (params?: any) => {
  return request.get({ url: '/tms/stats/transport', params })
}
