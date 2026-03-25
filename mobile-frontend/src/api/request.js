import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'

// 生产环境 API 地址（Railway 部署）
const API_URL = import.meta.env.VITE_API_URL || 'https://distribution-system-production.up.railway.app'

const request = axios.create({
  baseURL: API_URL + '/api',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    
    // 特殊处理 FormData 请求（文件上传）
    if (config.data instanceof FormData) {
      // 不要设置 Content-Type，让浏览器自动设置（包含 boundary）
      delete config.headers['Content-Type']
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      showToast(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  error => {
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      window.location.href = '/login'
    }
    showToast(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request
