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

// 获取地地址余额
export const getChainBlance = (data: { chain: string; address: string }) => {
  return api.get('/api/address/chainBalance', { params: data })
}
