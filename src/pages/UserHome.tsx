import React from 'react'
import {
  Row,
  Col,
  Card,
  Statistic,
  Tabs,
  Button,
  Space,
  Table,
  Tag,
} from 'antd'
import {
  WalletOutlined,
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  HistoryOutlined,
} from '@ant-design/icons'

// 模拟资产数据
const assetData = {
  totalAsset: '12,689.00',
  change: '+5.68%',
  available: '8,420.35',
  frozen: '892.16',
}

// 持仓列表
const positionColumns = [
  { title: '币种', dataIndex: 'coin', key: 'coin' },
  { title: '持仓数量', dataIndex: 'balance', key: 'balance' },
  { title: '折合 USD', dataIndex: 'usd', key: 'usd' },
  { title: '24h涨跌', dataIndex: 'change', key: 'change' },
]

const positionData = [
  {
    key: 1,
    coin: 'BTC',
    balance: '0.0425',
    usd: '$2,856.32',
    change: '+3.24%',
  },
  {
    key: 2,
    coin: 'ETH',
    balance: '0.8562',
    usd: '$2,140.56',
    change: '+1.86%',
  },
  {
    key: 3,
    coin: 'USDT',
    balance: '5,680.42',
    usd: '$5,680.42',
    change: '0.00%',
  },
]

// 最近订单
const orderColumns = [
  { title: '时间', dataIndex: 'time', key: 'time' },
  { title: '交易对', dataIndex: 'pair', key: 'pair' },
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '价格', dataIndex: 'price', key: 'price' },
  { title: '数量', dataIndex: 'amount', key: 'amount' },
  { title: '状态', dataIndex: 'status', key: 'status' },
]

const orderData = [
  {
    key: 1,
    time: '10:24:36',
    pair: 'BTC/USDT',
    type: '买入',
    price: '67,240.50',
    amount: '0.001',
    status: <Tag color="green">已完成</Tag>,
  },
  {
    key: 2,
    time: '09:15:22',
    pair: 'ETH/USDT',
    type: '卖出',
    price: '2,500.86',
    amount: '0.15',
    status: <Tag color="orange">处理中</Tag>,
  },
]

const UserHome = () => {
  return (
    <div style={{ padding: '24px', backgroundColor: '#fff' }}>
      {/* 顶部资产概览 */}
      <Card
        title="我的资产"
        extra={<Button type="link">资产总览 →</Button>}
        style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="总资产折合(USD)"
              value={assetData.totalAsset}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix={<WalletOutlined />}
              suffix="USD"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="24h变动"
              value={assetData.change}
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="可用余额"
              value={assetData.available}
              precision={2}
              suffix="USD"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="冻结资产"
              value={assetData.frozen}
              precision={2}
              suffix="USD"
            />
          </Col>
        </Row>
      </Card>

      {/* 快捷操作 */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="large">
          <Button type="primary" icon={<PlusOutlined />}>
            充值
          </Button>
          <Button icon={<ArrowDownOutlined />}>提现</Button>
          <Button icon={<ArrowDownOutlined />}>立即交易</Button>
          <Button icon={<HistoryOutlined />}>全部订单</Button>
        </Space>
      </Card>

      {/* 持仓 & 最近订单 */}
      <Card>
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: '我的持仓',
              children: (
                <Table
                  columns={positionColumns}
                  dataSource={positionData}
                  pagination={false}
                />
              ),
            },
            {
              key: '2',
              label: '最近订单',
              children: (
                <Table
                  columns={orderColumns}
                  dataSource={orderData}
                  pagination={false}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}

export default UserHome
