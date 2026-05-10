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

// 获取资产流水列表
export const getCollectAddress = (data: { chain: string; coin: string }) => {
  return api.get('/api/collectAddress/getCollectAddr', { params: data })
}
