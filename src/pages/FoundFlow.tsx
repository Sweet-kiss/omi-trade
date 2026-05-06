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
} from 'antd'
import { CopyOutlined } from 'antd/icons'
import type { ColumnsType } from 'antd/es/table'

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

const fetchFundFlowApi = (params: any) => {
  return new Promise<{ list: FundFlowItem[]; total: number }>((resolve) => {
    setTimeout(() => {
      const data = [
        {
          id: '1',
          txHash: '0x1111117890abcdef1234567890abcdef12345678',
          coin: 'ETH',
          chain: 'Sepolia',
          type: 'recharge',
          amount: '+0.5',
          fromAddress: '0xFromUser1111111111111',
          toAddress: '0xPlatformAddr22222222222',
          status: 'success',
          createTime: '2026-05-06 15:30:22',
        },
        {
          id: '2',
          txHash: '0x2222223210fedcba09876543210fedcba0987654',
          coin: 'USDT',
          chain: 'BSC',
          type: 'withdraw',
          amount: '-200',
          fromAddress: '0xPlatformAddr22222222222',
          toAddress: '0xUserToAddr33333333333',
          status: 'confirming',
          createTime: '2026-05-06 14:20:11',
        },
        {
          id: '3',
          txHash: '0x3333331234567890abcdef1234567890abcdef12',
          coin: 'ETH',
          chain: 'Sepolia',
          type: 'withdraw',
          amount: '-0.2',
          fromAddress: '0xPlatformAddr22222222222',
          toAddress: '0xUserToAddr44444444444',
          status: 'reject',
          createTime: '2026-05-06 10:10:05',
        },
        {
          id: '4',
          txHash: '0x4444447890abcdef1234567890abcdef12345678',
          coin: 'ETH',
          chain: 'Sepolia',
          type: 'recharge',
          amount: '+1.2',
          fromAddress: '0xFromUser5555555555555',
          toAddress: '0xPlatformAddr22222222222',
          status: 'success',
          createTime: '2026-05-06 09:30:10',
        },
        {
          id: '5',
          txHash: '0x5555553210fedcba09876543210fedcba0987654',
          coin: 'USDT',
          chain: 'BSC',
          type: 'recharge',
          amount: '+500',
          fromAddress: '0xFromUser6666666666666',
          toAddress: '0xPlatformAddr22222222222',
          status: 'success',
          createTime: '2026-05-06 08:15:33',
        },
        {
          id: '6',
          txHash: '0x6666661234567890abcdef1234567890abcdef12',
          coin: 'ETH',
          chain: 'Sepolia',
          type: 'withdraw',
          amount: '-0.8',
          fromAddress: '0xPlatformAddr22222222222',
          toAddress: '0xUserToAddr77777777777',
          status: 'confirming',
          createTime: '2026-05-05 22:40:55',
        },
        {
          id: '7',
          txHash: '0x7777777890abcdef1234567890abcdef12345678',
          coin: 'ETH',
          chain: 'Sepolia',
          type: 'recharge',
          amount: '+0.3',
          fromAddress: '0xFromUser8888888888888',
          toAddress: '0xPlatformAddr22222222222',
          status: 'success',
          createTime: '2026-05-05 20:10:22',
        },
      ]
      resolve({
        list: data,
        total: 90,
      })
    }, 300)
  })
}

export default function FundFlow() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<FundFlowItem[]>([])
  const [total, setTotal] = useState(0)

  const [params, setParams] = useState({
    txHash: '',
    coin: '',
    chain: '',
    type: '',
    pageNum: 1,
    pageSize: 9, // 改成 9 条
  })

  const loadList = async () => {
    setLoading(true)
    try {
      const res = await fetchFundFlowApi(params)
      setData(res.list)
      setTotal(res.total)
    } catch (err) {
      message.error('加载流水失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadList()
  }, [params.pageNum, params.pageSize])

  const handleSearch = () => {
    setParams({ ...params, pageNum: 1 })
    loadList()
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
      render: (t) =>
        t === 'recharge' ? (
          <Tag color="green">充值</Tag>
        ) : (
          <Tag color="orange">提现</Tag>
        ),
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
            {hash.slice(0, 6)}...{hash.slice(-4)}
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
    { title: '时间', dataIndex: 'createTime', key: 'createTime', width: 170 },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 110,
      fixed: 'right',
      render: (amt) => (
        <span
          style={{
            color: amt.startsWith('+') ? '#3f8600' : '#cf1322',
            fontWeight: 500,
          }}>
          {amt}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      fixed: 'right',
      render: (s) => {
        if (s === 'success') return <Tag color="success">已到账</Tag>
        if (s === 'confirming') return <Tag color="processing">确认中</Tag>
        if (s === 'reject') return <Tag color="error">驳回</Tag>
        return '-'
      },
    },
  ]

  return (
    <div style={{ padding: '16px' }}>
      {/* 哈希搜索框 */}
      <Input
        placeholder="哈希搜索"
        value={params.txHash}
        onChange={(e) => setParams({ ...params, txHash: e.target.value })}
        style={{ width: '100%', marginBottom: 12 }}
        allowClear
      />

      {/* 三个等分 */}
      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col flex={1}>
          <Select
            placeholder="币种"
            value={params.coin}
            onChange={(v) => setParams({ ...params, coin: v })}
            style={{ width: '100%' }}
            allowClear>
            <Select.Option value="ETH">ETH</Select.Option>
            <Select.Option value="USDT">USDT</Select.Option>
          </Select>
        </Col>
        <Col flex={1}>
          <Select
            placeholder="链"
            value={params.chain}
            onChange={(v) => setParams({ ...params, chain: v })}
            style={{ width: '100%' }}
            allowClear>
            <Select.Option value="Sepolia">Sepolia</Select.Option>
            <Select.Option value="BSC">BSC</Select.Option>
          </Select>
        </Col>
        <Col flex={1}>
          <Select
            placeholder="类型"
            value={params.type}
            onChange={(v) => setParams({ ...params, type: v })}
            style={{ width: '100%' }}
            allowClear>
            <Select.Option value="recharge">充值</Select.Option>
            <Select.Option value="withdraw">提现</Select.Option>
          </Select>
        </Col>
        <Col>
          <button
            onClick={handleSearch}
            style={{
              height: 32,
              padding: '0 16px',
              backgroundColor: '#165DFF',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}>
            搜索
          </button>
        </Col>
      </Row>

      {/* 表格：去掉多余高度，自然高度 */}
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={{ x: 'max-content' }}
        size="middle"
      />

      {/* 分页居中，紧贴表格 */}
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
