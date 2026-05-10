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
export const getAddressManageLists = (data: {
  chain: string
  coin: string
  address: string
  userName: string
  status: number
  page: number
  pageSize: number
}) => {
  return api.get('/api/addressmanage/addressList', { params: data })
}
