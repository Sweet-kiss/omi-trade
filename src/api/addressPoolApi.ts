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

// 获取地址池概览列表
export const getAddressPollLists = () => {
  return api.get('/api/addressPool/getGlobalStat')
}

// 获取分链分币统计列表
export const getChainCoinLists = (data: { chain: string; coin: string }) => {
  return api.get('/api/addressPool/getChainCoinStat', { params: data })
}

// 获取分链分币统计列表
export const getbatchGenerate = (data: {
  chain: string
  coin: string
  count: number
}) => {
  return api.post('/api/addressPool/batchGenerate', data)
}
