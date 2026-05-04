import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 定义用户类型
interface UserInfo {
  id: number | string
  username: string
  token?: string
  role?: string // 权限角色 admin / user 等
  [key: string]: any // 其他字段
}

// 2. State 类型
interface UserState {
  user: UserInfo | null
  setUser: (info: UserInfo) => void
  logout: () => void
}

// 创建 store
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (userInfo) => set({ user: userInfo }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'user-storage', // 这个名字随便起，就是 localStorage 的 key
    },
  ),
)
