import React, { useState, useEffect } from 'react'
import {
  Card,
  Button,
  Space,
  Typography,
  Table,
  Row,
  Col,
  Tag,
  Tooltip,
} from 'antd'
import {
  MoneyCollectOutlined,
  WalletOutlined,
  SwapOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons'

interface AssetCoin {
  coin: string
  balance: number
  usdValue: number
  change24h: number
}

interface AssetData {
  totalUsdt: number
  coins: AssetCoin[]
}

// 引入充值弹窗组件
import RechargeModal from './components/RechargeModal'
// 引入提现弹框组件
import WithdrawModal from './components/WithdrawModel'
import { insertCoin } from '../api/inserCoin'
import { getUserAssets } from '../api/walletApi'
import { getRecordLists } from '../api/allRecordListApi'

const { Title, Text } = Typography

const UserHome = () => {
  // 获取个人资产
  const toGetUserAssets = async () => {
    try {
      const result = await getUserAssets()
      console.log('接口返回资产：', result)

      const newData = { ...result.data }
      setAssetData(newData)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    toGetUserAssets()
  }, [])

  // 获取资产流水记录
  const getCoinLst = async () => {
    try {
      const result = await getRecordLists()
      console.log('接口返回：', result)
    } catch (err) {
      console.error(err)
    }
  }

  // 获取插入充值记录
  const toInsetCoin = async () => {
    try {
      const result = await insertCoin({
        txHash: '69869699',
        amount: '0.01',
      })
      console.log('接口返回：', result)
    } catch (err) {
      console.error(err)
    }
  }

  // 控制充值弹窗显示隐藏
  const [rechargeVisible, setRechargeVisible] = useState(false)

  // 控制提现弹框显示隐藏
  const [withdrawVisible, setWithdrawVisible] = useState(false)

  // 以后这里换成接口取：用户资产
  const [assetData, setAssetData] = useState({
    totalUsd: 2525.88,
    change24h: 2.34,
    coins: {
      BTC: {
        balance: 0.0002,
        change24h: 1.2,
        usdValue: 1200,
      },
      ETH: {
        balance: 0.05,
        change24h: -0.8,
        usdValue: 125,
      },
      USDT: {
        balance: 1200,
        change24h: 0,
        usdValue: 1200,
      },
    },
  })

  // 以后这里换成接口取：最近充值/提现记录（链上真实记录）
  const recentRecords = [
    {
      id: 1,
      type: '充值',
      coin: 'USDT',
      chain: 'TRC20',
      amount: 500,
      txid: '0x1234567890abcdef',
      confirmations: 6,
      requiredConfirm: 6,
      time: '2026-05-04 10:25',
      status: 'success',
    },
    {
      id: 2,
      type: '充值',
      coin: 'BTC',
      chain: 'BTC',
      amount: 0.0001,
      txid: '0xabcdef1234567890',
      confirmations: 3,
      requiredConfirm: 6,
      time: '2026-05-03 19:10',
      status: 'confirming',
    },
  ]

  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (t) => <Text strong>{t}</Text>,
    },
    {
      title: '币种/链',
      key: 'coinChain',
      render: (_, r) => (
        <div>
          {r.coin} / {r.chain}
        </div>
      ),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
    },
    {
      title: 'TxHash',
      dataIndex: 'txid',
      key: 'txid',
      render: (hash) => (
        <Tooltip title={hash}>
          <span style={{ fontFamily: 'monospace' }}>
            {hash.slice(0, 10)}...
          </span>
        </Tooltip>
      ),
    },
    {
      title: '确认数',
      key: 'confirm',
      align: 'center',
      render: (_, r) => (
        <span>
          {r.confirmations}/{r.requiredConfirm}
        </span>
      ),
    },
    {
      title: '状态',
      key: 'status',
      align: 'center',
      render: (_, r) => {
        if (r.status === 'success') {
          return <Tag color="green">已到账</Tag>
        }
        if (r.status === 'confirming') {
          return <Tag color="orange">确认中</Tag>
        }
        return <Tag color="red">失败</Tag>
      },
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      align: 'right',
    },
  ]

  return (
    <div style={{ minWidth: 1000, padding: '20px' }}>
      {/* 总资产卡片（四等分，真实版布局） */}
      <Card style={{ borderRadius: 12, marginBottom: 20 }}>
        {/* 右上角：全部资产入口 */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            cursor: 'pointer',
            color: '#1890ff',
            fontSize: 14,
          }}>
          全部资产 →
        </div>

        <Row gutter={16} align="middle">
          {/* 1：总资产 */}
          <Col span={6} style={{ textAlign: 'center' }}>
            <Text type="secondary">总资产折合 USD</Text>
            <Title level={2} style={{ margin: '4px 0' }}>
              ${assetData.totalUsd.toFixed(2)}
            </Title>
            <Text type={assetData.change24h >= 0 ? 'success' : 'danger'}>
              {assetData.change24h >= 0 ? '+' : ''}
              {assetData.change24h}% 24h
            </Text>
          </Col>

          {/* 2：BTC */}
          <Col span={6} style={{ textAlign: 'center' }}>
            <div>
              <Text strong>BTC</Text>
            </div>
            <div style={{ fontSize: 16, margin: '4px 0' }}>
              {assetData.coins.BTC.balance}
            </div>
            <Text
              type={assetData.coins.BTC.change24h >= 0 ? 'success' : 'danger'}>
              {assetData.coins.BTC.change24h >= 0 ? '+' : ''}
              {assetData.coins.BTC.change24h}%
            </Text>
          </Col>

          {/* 3：ETH */}
          <Col span={6} style={{ textAlign: 'center' }}>
            <div>
              <Text strong>ETH</Text>
            </div>
            <div style={{ fontSize: 16, margin: '4px 0' }}>
              {assetData.coins.ETH.balance}
            </div>
            <Text
              type={assetData.coins.ETH.change24h >= 0 ? 'success' : 'danger'}>
              {assetData.coins.ETH.change24h >= 0 ? '+' : ''}
              {assetData.coins.ETH.change24h}%
            </Text>
          </Col>

          {/* 4：USDT */}
          <Col span={6} style={{ textAlign: 'center' }}>
            <div>
              <Text strong>USDT</Text>
            </div>
            <div style={{ fontSize: 16, margin: '4px 0' }}>
              {assetData.coins.USDT.balance}
            </div>
            <Text
              type={assetData.coins.USDT.change24h >= 0 ? 'success' : 'danger'}>
              {assetData.coins.USDT.change24h >= 0 ? '+' : ''}
              {assetData.coins.USDT.change24h}%
            </Text>
          </Col>
        </Row>
      </Card>

      {/* 功能按钮 */}
      <Card style={{ borderRadius: 12, marginBottom: 20 }}>
        <Space
          size="large"
          style={{ display: 'flex', justifyContent: 'space-around' }}>
          <Button
            type="primary"
            size="large"
            icon={<MoneyCollectOutlined />}
            style={{ flex: 1, height: 50 }}
            onClick={() => setRechargeVisible(true)}>
            充值
          </Button>

          <Button
            type="primary"
            size="large"
            icon={<MoneyCollectOutlined />}
            style={{ flex: 1, height: 50 }}
            onClick={() => toInsetCoin(true)}>
            获取充值记录
          </Button>

          <Button
            size="large"
            icon={<WalletOutlined />}
            style={{ flex: 1, height: 50 }}
            onClick={() => setWithdrawVisible(true)}>
            提现
          </Button>
          <Button
            size="large"
            icon={<SwapOutlined />}
            style={{ flex: 1, height: 50 }}>
            立即交易
          </Button>
          <Button
            onClick={getCoinLst}
            size="large"
            icon={<SwapOutlined />}
            style={{ flex: 1, height: 50 }}>
            获取资产流水
          </Button>
        </Space>
      </Card>

      {/* 最近资金记录（真实链上格式） */}
      <Card
        style={{ borderRadius: 12 }}
        title={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <span>最近资金记录</span>
            <Button type="text">全部记录</Button>
          </div>
        }>
        <Table
          columns={columns}
          dataSource={recentRecords}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>

      {/* 充值弹窗 */}
      <RechargeModal
        visible={rechargeVisible}
        onClose={() => setRechargeVisible(false)}
      />

      {/* 提现弹窗 */}
      <WithdrawModal
        visible={withdrawVisible}
        onClose={() => setWithdrawVisible(false)}
      />
    </div>
  )
}

export default UserHome
