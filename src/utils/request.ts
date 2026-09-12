import axios from 'axios'

const service = axios.create({
  baseURL: '/admin-api',
  timeout: 30000
})

service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response) => {
    const { code, data, message } = response.data
    if (code === 200) {
      return data
    }
    return Promise.reject(new Error(message || 'Unknown error'))
  },
  (error) => {
    console.error('[API Error]', error)
    return Promise.reject(error)
  }
)

export default service
