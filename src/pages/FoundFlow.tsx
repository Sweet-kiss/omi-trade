import { useState, useEffect } from 'react'
import {
  Table,
  Tag,
  Input,
  Select,
  Pagination,
  Tooltip,
  message,
  Row,
  Col,
  Form,
  Button,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { getRecordLists } from '../api/allRecordListApi'
import dayjs from 'dayjs'

interface FundFlowItem {
  id: string
  txHash: string
  coin: string
  chain: string
  type: 'recharge' | 'withdraw'
  amount: string
  fromAddress?: string
  toAddress?: string
  status: 'success' | 'confirming' | 'reject'
  createTime: string
}

export default function FundFlow() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<FundFlowItem[]>([])
  const [total, setTotal] = useState(0)

  const [params, setParams] = useState({
    txHash: '',
    coin: '',
    chain: '',
    type: '',
    pageNum: 1,
    pageSize: 7,
  })

  // 加载列表
  const loadList = async () => {
    setLoading(true)
    try {
      const res = await getRecordLists(params as any)
      console.log(res, 'res======')
      setData(res.data.data.list || [])
      setTotal(res.data.data.total || 0)
    } catch (err) {
      message.error('加载流水失败')
    } finally {
      setLoading(false)
    }
  }

  // 分页变化请求
  useEffect(() => {
    loadList()
  }, [params.pageNum])

  // Form 搜索提交
  const handleSearch = (values: any) => {
    // 把表单所有值合并进params，跳第一页刷新
    setParams((prev) => ({
      ...prev,
      ...values,
      pageNum: 1,
    }))
    // 等state更新后再请求
    setTimeout(loadList, 0)
  }

  // 重置
  const handleReset = () => {
    form.resetFields()
    setParams({
      txHash: '',
      coin: '',
      chain: '',
      type: '',
      pageNum: 1,
      pageSize: 7,
    })
    setTimeout(loadList, 0)
  }

  const copyAddr = (addr?: string) => {
    if (!addr) return
    navigator.clipboard.writeText(addr).then(() => {
      message.success('已复制')
    })
  }

  const columns: ColumnsType<FundFlowItem> = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 90,
      fixed: 'left',
      render: (_val, col) => {
        const row = col as any
        return row.type === 'deposit' ? (
          <Tag color="green">充值</Tag>
        ) : (
          <Tag color="orange">提现</Tag>
        )
      },
    },
    {
      title: '哈希',
      dataIndex: 'txHash',
      key: 'txHash',
      width: 200,
      fixed: 'left',
      render: (hash) => (
        <Tooltip title={hash}>
          <span style={{ fontFamily: 'monospace' }}>
            {hash ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : '-'}
          </span>
        </Tooltip>
      ),
    },
    { title: '币种', dataIndex: 'coin', key: 'coin', width: 100 },
    { title: '链', dataIndex: 'chain', key: 'chain', width: 120 },
    {
      title: '来自地址',
      dataIndex: 'fromAddress',
      key: 'fromAddress',
      width: 180,
      render: (addr) =>
        addr ? (
          <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
            {addr.slice(0, 6)}...{addr.slice(-4)}
          </span>
        ) : (
          '-'
        ),
    },
    {
      title: '目标地址',
      dataIndex: 'toAddress',
      key: 'toAddress',
      width: 180,
      render: (addr) =>
        addr ? (
          <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
            {addr.slice(0, 6)}...{addr.slice(-4)}
          </span>
        ) : (
          '-'
        ),
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      // 只展示 年月日 去掉后面长串
      render: (time) => (time ? dayjs(time).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 110,
      fixed: 'right',
      render: (amt: number, col) => {
        const row = col as any
        const num = amt ?? 0
        if (row.type === 'deposit') {
          return <span style={{ color: 'green', fontWeight: 500 }}>+{num}</span>
        }
        if (row.type === 'withdraw') {
          return <span style={{ color: 'red', fontWeight: 500 }}>-{num}</span>
        }
        return <span style={{ color: '#666' }}>{num}</span>
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      fixed: 'right',
      render: (s, col) => {
        const row = col as any
        if (row.status === 'confirmed') return <Tag color="success">已到账</Tag>
        if (row.status === 'pending')
          return <Tag color="processing">确认中</Tag>
        return <Tag>未知</Tag>
      },
    },
  ]

  return (
    <div style={{ padding: '16px' }}>
      {/* 全部改成一个Form表单 */}
      <Form
        form={form}
        layout="inline"
        onFinish={handleSearch}
        style={{ marginBottom: 12 }}>
        <Form.Item name="txHash" style={{ width: '100%', marginBottom: 12 }}>
          <Input placeholder="请输入哈希搜索" allowClear />
        </Form.Item>

        <Row gutter={12} style={{ width: '100%' }}>
          <Col flex={1}>
            <Form.Item name="coin" style={{ marginBottom: 0 }}>
              <Select
                placeholder="请选择币种"
                style={{ width: '100%' }}
                allowClear>
                <Select.Option value="ETH">ETH</Select.Option>
                <Select.Option value="USDT">USDT</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col flex={1}>
            <Form.Item name="chain" style={{ marginBottom: 0 }}>
              <Select
                placeholder="请选择链"
                style={{ width: '100%' }}
                allowClear>
                <Select.Option value="Sepolia">Sepolia</Select.Option>
                <Select.Option value="BSC">BSC</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col flex={1}>
            <Form.Item name="type" style={{ marginBottom: 0 }}>
              <Select
                placeholder="请选择类型"
                style={{ width: '100%' }}
                allowClear>
                <Select.Option value="recharge">充值</Select.Option>
                <Select.Option value="withdraw">提现</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit">
                搜索
              </Button>
              <Button onClick={handleReset} style={{ marginLeft: 8 }}>
                重置
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Table
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={{ x: 'max-content' }}
        size="middle"
      />

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Pagination
          current={params.pageNum}
          pageSize={params.pageSize}
          total={total}
          showQuickJumper
          showTotal={(t) => `共 ${t} 条`}
          onChange={(page) => setParams({ ...params, pageNum: page })}
        />
      </div>
    </div>
  )
}
