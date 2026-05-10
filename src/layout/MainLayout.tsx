import React, { useEffect, useState } from 'react'
import {
  Layout,
  Menu,
  Dropdown,
  Space,
  Avatar,
  message,
  Button,
  Tabs,
} from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { filterMenuItems, arrayToTree, mapToAntdMenu } from '../utils/menuUtils'
import axios from 'axios'
import { useUserStore } from '../store/useUserStore'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { WalletOutlined } from '@ant-design/icons'

const { Header, Sider, Content } = Layout

interface TabItem {
  key: string
  label: string
  closable: boolean
}

// 🔥 直接写死你所有路由和中文名称，永久匹配，不依赖菜单
const routeNameMap: Record<string, string> = {
  '/dashboard': '控制台',
  '/asset/record': '资金流水',
  '/wallet/addressPoll': '地址池管理',
  '/wallet/addressManagement': '地址绑定管理',
}

export default function MainLayout({ collapsed, onToggle }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuList, setMenuList] = useState<any[]>([])
  const [tabs, setTabs] = useState<TabItem[]>([])
  const [activeTabKey, setActiveTabKey] = useState('')

  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const metaMaskConnector = connectors[0]

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  function HeaderName() {
    const user = useUserStore((state) => state.user)
    if (!user) return <div style={{ color: '#fff' }}>请登录</div>
    return <div style={{ color: '#fff' }}>{user.username}</div>
  }

  // 优先从固定映射拿名字，再也不显示功能页面
  const getMenuLabel = (path: string) => {
    return routeNameMap[path] || '未知页面'
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

  useEffect(() => {
    const currentPath =
      location.pathname === '/' ? '/dashboard' : location.pathname
    setActiveTabKey(currentPath)

    const exist = tabs.some((tab) => tab.key === currentPath)
    if (!exist) {
      const label = getMenuLabel(currentPath)
      setTabs((prev) => [
        ...prev,
        {
          key: currentPath,
          label,
          closable: true,
        },
      ])
    }
  }, [location.pathname])

  const handleTabChange = (key: string) => {
    navigate(key)
  }

  const handleTabEdit = (targetKey: string, action: 'add' | 'remove') => {
    if (action === 'remove') {
      let newTabs = tabs.filter((tab) => tab.key !== targetKey)
      setTabs(newTabs)
      if (targetKey === activeTabKey && newTabs.length) {
        navigate(newTabs[newTabs.length - 1].key)
      }
    }
  }

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
        <Header
          style={{
            height: '8vh',
            padding: '0 24px',
            background: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            borderBottom: '1px solid rgba(0,210,255,0.15)',
            color: '#fff',
          }}>
          <div
            onClick={onToggle}
            style={{ fontSize: 18, cursor: 'pointer', color: '#fff' }}>
            ☰
          </div>

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
                <Button size="small" danger onClick={() => disconnect()}>
                  断开
                </Button>
              </Space>
            ) : (
              <Button
                type="primary"
                icon={<WalletOutlined />}
                onClick={() => connect({ connector: metaMaskConnector })}
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

        <div
          style={{
            padding: '0 8px',
            background: '#e1eaedf4',
            borderBottom: '1px solid rgba(19, 15, 85, 0.15)',
          }}>
          <Tabs
            hideAdd
            type="editable-card"
            size="small"
            activeKey={activeTabKey}
            items={tabs}
            onChange={handleTabChange}
            onEdit={handleTabEdit}
            tabBarStyle={{
              margin: 0,
              padding: '2px 0',
            }}
            // 只加类名，不写styles，绝不报错
            className="dark-fixed-tabs"
          />
        </div>

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
