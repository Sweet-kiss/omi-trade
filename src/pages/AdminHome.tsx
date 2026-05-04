import React from 'react'
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tabs,
  Button,
  Space,
  Tag,
  Dropdown,
  Menu,
  DatePicker,
  Input,
} from 'antd'
import {
  BarChartOutlined,
  UserOutlined,
  WalletOutlined,
  OrderedListOutlined,
  ExclamationCircleOutlined,
  NotificationOutlined,
  SearchOutlined,
} from '@ant-design/icons'

const { RangePicker } = DatePicker

// 平台统计数据
const platformData = {
  totalUser: '128,654',
  totalVolume: '1.86 亿',
  totalAsset: '8.64 亿',
  todayOrder: '12,689',
}

// 用户列表
const userColumns = [
  { title: '用户ID', dataIndex: 'userId', key: 'userId' },
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '角色', dataIndex: 'role', key: 'role' },
  { title: '注册时间', dataIndex: 'registerTime', key: 'registerTime' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'action' },
]

const userData = [
  {
    key: 1,
    userId: '10001',
    username: 'trader_001',
    role: '普通用户',
    registerTime: '2026-04-20',
    status: <Tag color="green">正常</Tag>,
  },
  {
    key: 2,
    userId: '10002',
    username: 'admin_root',
    role: '管理员',
    registerTime: '2026-04-18',
    status: <Tag color="green">正常</Tag>,
  },
  {
    key: 3,
    userId: '10003',
    username: 'eth_holder',
    role: '普通用户',
    registerTime: '2026-04-22',
    status: <Tag color="orange">风控中</Tag>,
  },
]

// 订单统计
const orderColumns = [
  { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
  { title: '交易对', dataIndex: 'pair', key: 'pair' },
  { title: '成交量', dataIndex: 'volume', key: 'volume' },
  { title: '时间', dataIndex: 'time', key: 'time' },
  { title: '状态', dataIndex: 'status', key: 'status' },
]

const orderData = [
  {
    key: 1,
    orderNo: 'ORDER20260504001',
    pair: 'BTC/USDT',
    volume: '0.52 BTC',
    time: '10:30',
    status: <Tag color="green">已完成</Tag>,
  },
  {
    key: 2,
    orderNo: 'ORDER20260504002',
    pair: 'ETH/USDT',
    volume: '12.8 ETH',
    time: '09:20',
    status: <Tag color="blue">撮合中</Tag>,
  },
]

const AdminHome = () => {
  return (
    <div style={{ padding: '24px', backgroundColor: '#fff' }}>
      {/* 平台总览 */}
      <Card title="平台数据总览" style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="平台总用户数"
              value={platformData.totalUser}
              prefix={<UserOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="24h总成交量"
              value={platformData.totalVolume}
              prefix={<BarChartOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="平台总资产"
              value={platformData.totalAsset}
              prefix={<WalletOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="今日订单数"
              value={platformData.todayOrder}
              prefix={<OrderedListOutlined />}
            />
          </Col>
        </Row>
      </Card>

      {/* 快捷操作 */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="middle" wrap>
          <Input
            placeholder="搜索用户/订单"
            style={{ width: 260 }}
            prefix={<SearchOutlined />}
          />
          <RangePicker />
          <Button type="primary">导出数据</Button>
          <Button icon={<NotificationOutlined />}>发送公告</Button>
          <Button icon={<ExclamationCircleOutlined />} danger>
            风控中心
          </Button>
        </Space>
      </Card>

      {/* 核心管理模块 */}
      <Card>
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: '用户管理',
              children: (
                <Table
                  columns={userColumns}
                  dataSource={userData}
                  rowKey="key"
                />
              ),
            },
            {
              key: '2',
              label: '订单管理',
              children: (
                <Table
                  columns={orderColumns}
                  dataSource={orderData}
                  rowKey="key"
                />
              ),
            },
            {
              key: '3',
              label: '资金流水',
              children: (
                <div style={{ padding: '16px' }}>
                  平台充值、提现、转账流水统计
                </div>
              ),
            },
            {
              key: '4',
              label: '系统设置',
              children: (
                <div style={{ padding: '16px' }}>费率、开关、风控参数配置</div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}

export default AdminHome
