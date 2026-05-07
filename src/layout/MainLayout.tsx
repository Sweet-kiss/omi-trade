import React, { useEffect, useState } from 'react'
import { Layout, Menu, Dropdown, Space, Avatar, message, Button } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { filterMenuItems, arrayToTree, mapToAntdMenu } from '../utils/menuUtils'
import axios from 'axios'
import { useUserStore } from '../store/useUserStore'

// 🔥 wagmi 钱包钩子
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
    if (!user) return <div style={{ color: '#fff' }}>请登录</div>
    return <div style={{ color: '#fff' }}>{user.username}</div>
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
        width: '100vw',
        overflow: 'hidden',
        position: 'fixed',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        padding: 0,
        background: '#0b1220',
      }}>
      {/* 侧边栏 强制暗黑 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        style={{
          background: '#0f172a',
          borderRight: '1px solid rgba(0,210,255,0.15)',
        }}>
        <div
          style={{
            height: 32,
            margin: 16,
            background: 'rgba(255,255,255,0.15)',
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
          style={{ background: '#0f172a' }}
        />
      </Sider>

      <Layout
        style={{
          height: '100vh',
          overflow: 'hidden',
          background: '#0b1220',
        }}>
        {/* 🔥 重点：Header 彻底改成暗黑科技黑，去掉白色 */}
        <Header
          style={{
            height: '8vh',
            padding: '0 24px',
            // 直接用深色 和整体统一
            background: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            borderBottom: '1px solid rgba(0,210,255,0.15)',
            // 强制文字白色
            color: '#fff',
          }}>
          <div
            onClick={onToggle}
            style={{ fontSize: 18, cursor: 'pointer', color: '#fff' }}>
            ☰
          </div>

          {/* 右侧区域：钱包按钮 + 用户信息 */}
          <Space size="large" align="center">
            {isConnected ? (
              <Space>
                <span
                  style={{
                    padding: '4px 10px',
                    backgroundColor: 'rgba(0,210,255,0.15)',
                    borderRadius: 6,
                    color: '#00d2ff',
                  }}>
                  {formatAddress(address!)}
                </span>
                <Button size="small" danger>
                  断开
                </Button>
              </Space>
            ) : (
              <Button
                type="primary"
                icon={<WalletOutlined />}
                style={{
                  background: 'linear-gradient(90deg,#00b4ff,#007bff)',
                  border: 'none',
                }}>
                连接钱包
              </Button>
            )}

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

        {/* 内容区域 深色底 顶格无留白 */}
        <Content
          style={{
            background: '#0b1220',
            overflowY: 'auto',
            margin: 0,
            padding: 0,
          }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
