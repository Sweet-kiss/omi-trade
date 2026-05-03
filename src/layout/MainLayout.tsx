import React, { ReactNode } from 'react'
import { Layout, Menu, Dropdown, Space, Avatar } from 'antd'
import { Outlet } from 'react-router-dom' // 👈 加这个

const { Header, Sider, Content } = Layout

interface MainLayoutProps {
  children: ReactNode
  collapsed: boolean
  onToggle: () => void
}

const MainLayout: React.FC<MainLayoutProps> = ({ collapsed, onToggle }) => {
  const menuItems = [
    {
      label: '控制台',
      key: 'dashboard',
      path: '/dashboard',
    },
    {
      label: '用户管理',
      key: 'user',
      children: [
        { label: '用户列表', key: 'user-list', path: '/user/list' },
        { label: 'KYC 认证', key: 'user-kyc', path: '/user/kyc' },
      ],
    },
    {
      label: '角色权限',
      key: 'role-permission',
      children: [
        { label: '角色管理', key: 'role', path: '/role' },
        { label: '权限管理', key: 'permission', path: '/permission' },
      ],
    },
    {
      label: '币币交易',
      key: 'spot-trading',
      children: [
        { label: '交易对管理', key: 'trade-pair', path: '/trade-pair' },
        { label: '全链路由聚合', key: 'swap-router', path: '/swap-router' },
        { label: '止盈止损', key: 'stop-loss', path: '/stop-loss' },
      ],
    },
    {
      label: '订单管理',
      key: 'order',
      children: [
        { label: '当前订单', key: 'order-pending', path: '/order/pending' },
        { label: '历史订单', key: 'order-history', path: '/order/history' },
      ],
    },
    {
      label: '资产管理',
      key: 'asset',
      children: [
        { label: '资产总览', key: 'asset-overview', path: '/asset/overview' },
        { label: '充值管理', key: 'deposit', path: '/deposit' },
        { label: '提现管理', key: 'withdraw', path: '/withdraw' },
      ],
    },
    {
      label: '代币钱包',
      key: 'token-wallet',
      children: [
        { label: '代币管理', key: 'token', path: '/token' },
        { label: '钱包管理', key: 'wallet', path: '/wallet' },
      ],
    },
    {
      label: '系统设置',
      key: 'system',
      children: [
        { label: '基础配置', key: 'setting', path: '/setting' },
        { label: '日志审计', key: 'log-audit', path: '/log-audit' },
      ],
    },
  ]
  const userMenuItems = [
    { key: 'profile', label: '个人中心' },
    { key: 'logout', label: '退出登录' },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div
          style={{
            height: 32,
            margin: 16,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
          }}>
          {collapsed ? 'DEX' : '聚合交易平台'}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}>
          <div onClick={onToggle} style={{ cursor: 'pointer', fontSize: 18 }}>
            {collapsed ? '☰' : '☰'}
          </div>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar size="small" />
              <span>用户</span>
            </Space>
          </Dropdown>
        </Header>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: 8,
          }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
