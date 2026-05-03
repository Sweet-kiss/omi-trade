import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
})

// 注册
export const register = (data: {
  username: string
  password: string
  email?: string
  role: string
}) => {
  return api.post('/api/user/register', data)
}

// 登录
export const login = (data: {
  username: string
  password: string
  role: string
}) => {
  return api.post('/api/user/login', data)
}

// 用户列表
export const getUserList = () => {
  return api.get('/api/user/list')
}
