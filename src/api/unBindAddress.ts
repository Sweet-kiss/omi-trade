// walletApi.ts
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
})

// 加上这段！！！
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = 'Bearer ' + token
  }
  return config
})

// 获取分链分币统计列表
export const toUnBindAddress = (data: { address: string }) => {
  return api.post('/api/address/unbind', data)
}
