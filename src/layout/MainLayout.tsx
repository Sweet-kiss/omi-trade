import React, { useEffect, useState } from 'react'
import { Layout, Menu, Dropdown, Space, Avatar, message, Button } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { filterMenuItems, arrayToTree, mapToAntdMenu } from '../utils/menuUtils'
import axios from 'axios'
import { useUserStore } from '../store/useUserStore'

// 🔥 加上 wagmi 钱包钩子
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { WalletOutlined } from '@ant-design/icons'

const { Header, Sider, Content } = Layout

export default function MainLayout({ collapsed, onToggle }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuList, setMenuList] = useState([])

  // 🔥 钱包相关状态
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const metaMaskConnector = connectors[0]

  // 格式化地址 0x123...5678
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  function HeaderName() {
    const user = useUserStore((state) => state.user)
    if (!user) return <div>请登录</div>
    return <div>{user.username}</div>
  }

  useEffect(() => {
    const localMenus = localStorage.getItem('userMenus')
    if (localMenus) {
      try {
        const raw = JSON.parse(localMenus)
        const filtered = filterMenuItems(raw)
        const treeData = arrayToTree(filtered)
        const antdMenuData = mapToAntdMenu(treeData)
        setMenuList(antdMenuData)
      } catch (e) {
        console.error('解析菜单数据失败', e)
      }
    }
  }, [])

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const handleLogout = async () => {
    try {
      await axios.post('/api/user/logout')
      message.success('退出成功')
      localStorage.clear()
      navigate('/login')
    } catch (e) {
      message.error('退出失败')
    }
  }

  const currentPath =
    location.pathname === '/' ? '/dashboard' : location.pathname

  return (
    <Layout
      style={{
        height: '100vh',
        overflow: 'hidden',
        position: 'fixed',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
      }}>
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
          selectedKeys={[currentPath]}
          onClick={handleMenuClick}
          items={menuList}
        />
      </Sider>

      <Layout style={{ height: '100vh', overflow: 'hidden' }}>
        <Header
          style={{
            height: '8vh',
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}>
          <div onClick={onToggle} style={{ fontSize: 18, cursor: 'pointer' }}>
            ☰
          </div>

          {/* 🔥 右侧区域：钱包按钮 + 用户信息 */}
          <Space size="large" align="center">
            {/* 钱包连接区域 */}
            {isConnected ? (
              <Space>
                <span
                  style={{
                    padding: '4px 10px',
                    backgroundColor: '#f0f2f5',
                    borderRadius: 6,
                  }}>
                  {formatAddress(address!)}
                </span>
                <Button size="small" onClick={() => disconnect()}>
                  断开
                </Button>
              </Space>
            ) : (
              <Button
                type="primary"
                icon={<WalletOutlined />}
                onClick={() => connect({ connector: metaMaskConnector })}>
                连接钱包
              </Button>
            )}

            {/* 用户信息 */}
            <Dropdown
              menu={{
                items: [
                  { key: 'profile', label: '个人中心' },
                  { key: 'logout', label: '退出登录' },
                ],
                onClick: ({ key }) => key === 'logout' && handleLogout(),
              }}>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar src={'/default-avatar.png'} alt={'用户'} size={30} />
                {HeaderName()}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: '10px 10px',
            padding: 5,
            background: '#fff',
            borderRadius: 8,
            overflowY: 'auto',
          }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
