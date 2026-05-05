import { useState } from 'react'
import { createBrowserRouter, Outlet } from 'react-router-dom'
import Login from '../pages/Login'
import Register from '../pages/Register'
import AdminHome from '../pages/AdminHome'
import UserHome from '../pages/UserHome'
import MainLayout from '../layout/MainLayout'
import { Navigate } from 'react-router-dom'
import { useUserStore } from '../store/useUserStore'

// 这就是你的“壳”
function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <MainLayout collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)}>
      <h2>我是外层壳</h2>
      {/* 页面内容会显示在这里 */}
      <Outlet />
    </MainLayout>
  )
}

// 先建一个中转组件
function DashboardRedirect() {
  const user = useUserStore((state) => state.user)

  // 没登录就去登录
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // 管理员 → 渲染管理员首页
  if (user.role === 'super') {
    return <AdminHome />
  }

  // 普通用户 → 渲染用户首页
  return <UserHome />
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    element: <Layout />, // 你的壳子
    children: [
      // 只有这一个首页！
      { path: '/dashboard', element: <DashboardRedirect /> },

      // 以后其他路由照常写
    ],
  },
  // 根目录直接跳 /dashboard
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
])

export default router
