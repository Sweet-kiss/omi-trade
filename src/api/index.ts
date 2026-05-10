import axios from 'axios'

// 创建 axios 实例
const service = axios.create({
  baseURL: 'http://localhost:3000', // 你的后端地址
  timeout: 10000,
})

// 请求拦截器 —— 自动带上 token
service.interceptors.request.use(
  (config) => {
    // 从 localStorage 取出 token
    const token = localStorage.getItem('token')

    // 如果有 token，就加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 直接返回后端的 data
    return response.data
  },
  (error) => {
    console.error('请求错误：', error)
    // 把后端返回的错误数据挂载到 error 上，抛给页面接口
    if (error.response && error.response.data) {
      error.data = error.response.data
    }
    return Promise.reject(error)
  },
)

export default service
