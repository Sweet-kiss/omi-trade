import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Button, Typography, Row, Col, Checkbox, Space, Select } from 'antd'
import {
  MoneyCollectOutlined,
  WalletOutlined,
  SwapOutlined,
  NotificationOutlined,
  OrderedListOutlined,
  AccountBookOutlined,
} from '@ant-design/icons'
import { Line, Pie } from '@ant-design/plots'
import RechargeModal from './components/RechargeModal'
import WithdrawModal from './components/WithdrawModel'
import { insertCoin } from '../api/inserCoin'
import { getUserAssets } from '../api/walletApi'
import { getRecordLists } from '../api/allRecordListApi'

const { Title, Text } = Typography
const { Option } = Select

interface CoinAsset {
  balance: number
  frozen: number
  usdValue: number
}
interface ChainAssets {
  coins: Record<string, CoinAsset>
}
interface AssetResponse {
  code: number
  msg: string
  data: {
    assets: Record<string, ChainAssets>
  }
}

interface RechargeMsg {
  type: string
  userAddr: string
  rechargeAddr: string
  txHash: string
  // 后面要用到的都写上
  address?: string
  chain?: string
  coin?: string
  amount?: string
}

const calcCoinAllBalance = (assets: Record<string, ChainAssets>) => {
  const coinBalanceMap: Record<string, number> = {}
  const coinValueMap: Record<string, number> = {}
  Object.values(assets).forEach((chainAsset) => {
    Object.entries(chainAsset.coins).forEach(([coin, asset]) => {
      const totalBalance = asset.balance + asset.frozen
      coinBalanceMap[coin] = (coinBalanceMap[coin] || 0) + totalBalance
      coinValueMap[coin] = (coinValueMap[coin] || 0) + asset.usdValue
    })
  })
  return { coinBalanceMap, coinValueMap }
}

const calcTotalUSD = (assets: Record<string, ChainAssets>): number => {
  if (!assets) return 0
  const { coinValueMap } = calcCoinAllBalance(assets)
  return Object.values(coinValueMap).reduce((sum, value) => sum + value, 0)
}

const activityList = [
  { title: '首次充值享手续费减免', desc: '新用户专属福利限时开启' },
  { title: '链上充值活动', desc: '指定链充值额外奖励' },
  { title: '系统升级通知', desc: '维护期间暂停提币' },
]

const walletList = [
  { name: 'ETH 钱包', balance: '1.258' },
  { name: 'BSC 钱包', balance: '580.00' },
  { name: 'Polygon 钱包', balance: '120.50' },
]

const generate7DayData = () => {
  const days = ['05-01', '05-02', '05-03', '05-04', '05-05', '05-06', '05-07']
  const base = {
    BTC: [28500, 29200, 28800, 30100, 29600, 30500, 30200],
    ETH: [1750, 1820, 1790, 1890, 1840, 1920, 1880],
    USDT: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
    BNB: [235, 242, 238, 251, 246, 255, 252],
  }
  return days.flatMap((date, i) =>
    Object.entries(base).map(([coin, values]) => ({
      date,
      coin,
      price: values[i],
    })),
  )
}

const generate30DayData = () => {
  const data = []
  const basePrice = { BTC: 27000, ETH: 1600, USDT: 1.0, BNB: 220 }
  for (let i = 0; i < 30; i++) {
    const date = `04-${(i + 1).toString().padStart(2, '0')}`
    Object.entries(basePrice).forEach(([coin, base]) => {
      const random = base * (0.95 + Math.random() * 0.1)
      data.push({ date, coin, price: parseFloat(random.toFixed(2)) })
    })
  }
  return data
}

const allData = {
  '7d': generate7DayData(),
  '30d': generate30DayData(),
}

const coinColors = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  USDT: '#26A17B',
  BNB: '#F3BA2F',
}

const UserHome = () => {
  const [historytxHash, setHistorytxHash] = useState('')
  const [assetData, setAssetData] = useState({
    totalUsd: 0.0,
    change24h: 0,
    coins: {
      BTC: { balance: 0.0, change24h: 0, usdValue: 0.0 },
      ETH: { balance: 0.0, change24h: 0, usdValue: 0.0 },
      USDT: { balance: 0.0, change24h: 0, usdValue: 0.0 },
    },
  })
  const [rechargeVisible, setRechargeVisible] = useState(false)
  const [withdrawVisible, setWithdrawVisible] = useState(false)
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d')
  const [selectedCoins, setSelectedCoins] = useState<string[]>([
    'BTC',
    'ETH',
    'USDT',
  ])

  // ========== 新增：WebSocket 连接 ==========
  const socketRef = useRef<WebSocket | null>(null)

  const toGetUserAssets = async () => {
    try {
      const result = await getUserAssets()
      const newData = result.data.data.assets
      const totalUsd = calcTotalUSD(newData)
      const allBalance = calcCoinAllBalance(newData)
      setAssetData({
        ...assetData,
        totalUsd,
        coins: {
          BTC: {
            ...assetData.coins.BTC,
            balance: allBalance.coinBalanceMap?.btc || 0,
            usdValue: allBalance.coinValueMap?.btc || 0,
          },
          ETH: {
            ...assetData.coins.ETH,
            balance: allBalance.coinBalanceMap?.eth || 0,
            usdValue: allBalance.coinValueMap?.eth || 0,
          },
          USDT: {
            ...assetData.coins.USDT,
            balance: allBalance.coinBalanceMap?.usdt || 0,
            usdValue: allBalance.coinValueMap?.usdt || 0,
          },
        },
      })
    } catch (e) {
      console.error('获取资产失败', e)
    }
  }

  // ========== 新增：后端抓到充值后，自动刷新资产 ==========
  const handleRechargeMessage = async (data: RechargeMsg) => {
    const currentTxHash = localStorage.getItem('txHash') || ''

    if (currentTxHash === data.txHash) {
      return
    } else {
      localStorage.setItem('txHash', JSON.stringify(currentTxHash))
    }

    await insertCoin({
      txHash: data.txHash,
      amount: data.amount || '',
      chain: data.chain || '',
      coin: data.coin || '',
    })

    try {
      await toGetUserAssets()
      console.log('充值已到账，资产已更新')
    } catch (err) {
      console.error('刷新资产失败', err)
    }
  }

  // ========== 新增：WebSocket 监听后端消息 ==========
  useEffect(() => {
    const socket = new WebSocket('ws://127.0.0.1:3000')
    socketRef.current = socket

    socket.onopen = () => {
      console.log('✅ WebSocket 已连接，等待充值通知...')
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as RechargeMsg
        if (data.type === 'user_recharge') {
          console.log('💸 收到充值：', data)
          handleRechargeMessage(data)
        }
      } catch (e) {
        console.error('消息解析失败', e)
      }
    }

    socket.onclose = () => {
      console.log('🔌 WebSocket 断开')
    }

    socket.onerror = (err) => {
      console.error('WebSocket 错误', err)
    }

    return () => {
      socket.close()
    }
  }, [])

  useEffect(() => {
    toGetUserAssets()
  }, [])

  const chartData = useMemo(() => {
    return allData[timeRange].filter((d) => selectedCoins.includes(d.coin))
  }, [timeRange, selectedCoins])

  const pieData = [
    { type: 'BTC', value: 4800 },
    { type: 'ETH', value: 3600 },
    { type: 'USDT', value: 6500 },
    { type: '其他', value: 1200 },
  ]

  const cardHeight = 260
  const pageWrap = {
    width: '100%',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0b1220 0%, #101a2f 100%)',
    margin: 0,
    padding: '0 0 30px 0',
  }
  const cardStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(0, 210, 255, 0.15)',
    borderRadius: 8,
    padding: 20,
    boxShadow: '0 0 18px rgba(0,180,255,0.08)',
    backdropFilter: 'blur(6px)',
  }
  const textPrimary = { color: '#ffffff' }
  const textSecondary = { color: '#a0b4d8' }
  const colorUp = { color: '#00c853' }
  const colorDown = { color: '#f44336' }

  const lineConfig = {
    data: chartData,
    xField: 'date',
    yField: 'price',
    seriesField: 'coin',
    smooth: true,
    color: (d) => coinColors[d.coin],
    xAxis: {
      label: { style: { fill: '#a0b4d8' }, autoRotate: true },
      line: { style: { stroke: 'rgba(0,210,255,0.15)' } },
      grid: { line: { style: { stroke: 'rgba(255,255,255,0.08)' } } },
    },
    yAxis: {
      label: { style: { fill: '#a0b4d8' } },
      line: { style: { stroke: 'rgba(0,210,255,0.15)' } },
      grid: { line: { style: { stroke: 'rgba(255,255,255,0.08)' } } },
    },
    point: {
      size: 4,
      shape: 'circle',
      style: { fill: '#fff', stroke: '#00d2ff', lineWidth: 2 },
    },
    label: {
      style: { fill: '#fff', fontSize: 10 },
      formatter: (datum) => `${datum.price}`,
      position: 'top',
    },
    tooltip: {
      shared: true,
      showCrosshairs: true,
      crosshairs: { type: 'xy' },
      formatter: (datum) => ({
        name: datum.coin,
        value: `$${datum.price}`,
      }),
    },
    legend: {
      position: 'top',
      label: { style: { fill: '#a0b4d8' } },
    },
  }

  const pieConfig = {
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.75,
    innerRadius: 0.55,
    color: ['#F7931A', '#627EEA', '#26A17B', '#ffb700'],
    label: { style: { fill: '#fff' } },
    legend: { label: { style: { fill: '#a0b4d8' } } },
  }

  return (
    <div style={pageWrap}>
      <div style={{ padding: '20px 16px' }}>
        <div style={cardStyle}>
          <Row gutter={20} align="middle">
            <Col span={10}>
              <Title level={4} style={{ margin: 0, ...textPrimary }}>
                总资产 (USD)
              </Title>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 'bold',
                  marginTop: 10,
                  color: '#00d2ff',
                }}>
                ${assetData.totalUsd.toFixed(2)}
              </div>
              <Text style={assetData.change24h >= 0 ? colorUp : colorDown}>
                {assetData.change24h >= 0 ? '+' : ''}
                {assetData.change24h}% (24h)
              </Text>
            </Col>
            <Col span={14}>
              <Row gutter={16}>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <Text strong style={textSecondary}>
                    BTC
                  </Text>
                  <div
                    style={{ fontSize: 16, margin: '6px 0', ...textPrimary }}>
                    {assetData.coins?.BTC?.balance?.toFixed(4) || 0.0}
                  </div>
                  <Text
                    style={
                      assetData.coins?.BTC?.change24h >= 0 ? colorUp : colorDown
                    }>
                    {assetData.coins?.BTC?.change24h >= 0 ? '+' : ''}
                    {assetData.coins?.BTC?.change24h || 0.0}%
                  </Text>
                </Col>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <Text strong style={textSecondary}>
                    ETH
                  </Text>
                  <div
                    style={{ fontSize: 16, margin: '6px 0', ...textPrimary }}>
                    {assetData.coins?.ETH?.balance?.toFixed(4) || 0.0}
                  </div>
                  <Text
                    style={
                      assetData.coins?.ETH?.change24h >= 0 ? colorUp : colorDown
                    }>
                    {assetData.coins?.ETH?.change24h >= 0 ? '+' : ''}
                    {assetData.coins?.ETH?.change24h || 0.0}%
                  </Text>
                </Col>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <Text strong style={textSecondary}>
                    USDT
                  </Text>
                  <div
                    style={{ fontSize: 16, margin: '6px 0', ...textPrimary }}>
                    {assetData.coins?.USDT?.balance?.toFixed(2) || 0.0}
                  </div>
                  <Text
                    style={
                      assetData.coins?.USDT?.change24h >= 0
                        ? colorUp
                        : colorDown
                    }>
                    {assetData.coins?.USDT?.change24h >= 0 ? '+' : ''}
                    {assetData.coins?.USDT?.change24h || 0.0}%
                  </Text>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </div>

      <div style={{ padding: '0 16px 22px' }}>
        <Row gutter={12}>
          <Col flex={1}>
            <Button
              type="primary"
              size="large"
              icon={<MoneyCollectOutlined />}
              style={{
                width: '100%',
                height: 50,
                background: 'linear-gradient(90deg,#00b4ff,#007bff)',
                border: 'none',
                borderRadius: 6,
              }}
              onClick={() => setRechargeVisible(true)}>
              充值
            </Button>
          </Col>
          <Col flex={1}>
            <Button
              size="large"
              icon={<WalletOutlined />}
              style={{
                width: '100%',
                height: 50,
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: '1px solid rgba(0,210,255,0.2)',
                borderRadius: 6,
              }}
              onClick={() => setWithdrawVisible(true)}>
              提现
            </Button>
          </Col>
          <Col flex={1}>
            <Button
              size="large"
              icon={<SwapOutlined />}
              style={{
                width: '100%',
                height: 50,
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: '1px solid rgba(0,210,255,0.2)',
                borderRadius: 6,
              }}>
              立即交易
            </Button>
          </Col>
        </Row>
      </div>

      <Row gutter={24} style={{ padding: '0 16px', marginBottom: 30 }}>
        <Col span={8}>
          <div style={{ ...cardStyle, height: cardHeight }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 500,
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                ...textPrimary,
              }}>
              <AccountBookOutlined
                style={{ marginRight: 8, color: '#00d2ff' }}
              />
              代币钱包
            </div>
            {walletList.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(0,210,255,0.1)',
                  ...textSecondary,
                }}>
                <span>{item.name}</span>
                <span style={{ fontWeight: 500, color: '#00d2ff' }}>
                  {item.balance}
                </span>
              </div>
            ))}
          </div>
        </Col>

        <Col span={8}>
          <div style={{ ...cardStyle, height: cardHeight }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 500,
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                ...textPrimary,
              }}>
              <OrderedListOutlined
                style={{ marginRight: 8, color: '#00d2ff' }}
              />
              我的订单
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              <Button
                block
                style={{
                  background: 'rgba(0,210,255,0.1)',
                  color: '#fff',
                  border: '1px solid rgba(0,210,255,0.2)',
                }}>
                充币订单
              </Button>
              <Button
                block
                style={{
                  background: 'rgba(0,210,255,0.1)',
                  color: '#fff',
                  border: '1px solid rgba(0,210,255,0.2)',
                }}>
                提币订单
              </Button>
              <Button
                block
                style={{
                  background: 'rgba(0,210,255,0.1)',
                  color: '#fff',
                  border: '1px solid rgba(0,210,255,0.2)',
                }}>
                交易记录
              </Button>
            </div>
          </div>
        </Col>

        <Col span={8}>
          <div style={{ ...cardStyle, height: cardHeight }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 500,
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                ...textPrimary,
              }}>
              <NotificationOutlined
                style={{ marginRight: 8, color: '#00d2ff' }}
              />
              平台公告
            </div>
            {activityList.map((item, idx) => (
              <div key={idx} style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 500, ...textPrimary }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 13, marginTop: 4, ...textSecondary }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </Col>
      </Row>

      <Row gutter={24} style={{ padding: '0 16px' }}>
        <Col span={12}>
          <div style={cardStyle}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}>
              <div style={{ fontSize: 16, fontWeight: 500, ...textPrimary }}>
                多币种价格走势
              </div>
              <Space size="middle">
                <Select
                  value={timeRange}
                  onChange={(v) => setTimeRange(v)}
                  style={{
                    width: 100,
                    background: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                  }}>
                  <Option value="7d">近7天</Option>
                  <Option value="30d">近30天</Option>
                </Select>
                <Checkbox.Group
                  value={selectedCoins}
                  onChange={(v) => setSelectedCoins(v as string[])}
                  style={{ display: 'flex', gap: 10 }}>
                  <Checkbox value="BTC" style={{ color: coinColors.BTC }}>
                    BTC
                  </Checkbox>
                  <Checkbox value="ETH" style={{ color: coinColors.ETH }}>
                    ETH
                  </Checkbox>
                  <Checkbox value="USDT" style={{ color: coinColors.USDT }}>
                    USDT
                  </Checkbox>
                  <Checkbox value="BNB" style={{ color: coinColors.BNB }}>
                    BNB
                  </Checkbox>
                </Checkbox.Group>
              </Space>
            </div>
            <Line {...lineConfig} height={280} />
          </div>
        </Col>

        <Col span={12}>
          <div style={cardStyle}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 500,
                marginBottom: 16,
                ...textPrimary,
              }}>
              各币种资产占比
            </div>
            <Pie {...pieConfig} height={280} />
          </div>
        </Col>
      </Row>

      <RechargeModal
        visible={rechargeVisible}
        onClose={() => setRechargeVisible(false)}
      />
      <WithdrawModal
        visible={withdrawVisible}
        onClose={() => setWithdrawVisible(false)}
      />
    </div>
  )
}

export default UserHome
