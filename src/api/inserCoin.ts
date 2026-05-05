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

// 插入充值记录
export const insertCoin = (data: { txHash: string; amount: string }) => {
  return api.post('/api/rechaege/manual', data)
}
