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

// 获取充值地址
export const getDepositAddress = (data: { coin: string; chain: string }) => {
  return api.post('/api/wallet/deposit-address', data)
}

// 获取用户资产接口
export const getUserAssets = () => {
  return api.get('/api/asset/info')
}
