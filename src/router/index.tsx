import { useState } from 'react'
import { createBrowserRouter, Outlet } from 'react-router-dom'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Home from '../pages/Home'
import MainLayout from '../layout/MainLayout'

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
    path: '/',
    element: <Layout />, // 壳
    children: [
      {
        path: '/',
        element: <Home />,
      },
    ],
  },
])

export default router
