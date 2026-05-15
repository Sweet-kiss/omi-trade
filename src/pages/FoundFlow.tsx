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
import { getDrawAduit } from '../api/withDrawAduitApi.ts'
import dayjs from 'dayjs'
// 引入你的用户全局pin，按你真实路径调整
import { useUserStore } from '../store/useUserStore.ts'

type FlowStatus =
  | 'success'
  | 'confirming'
  | 'reject'
  | 'pending_audit'
  | 'pending'

interface FundFlowItem {
  _id: string
  txHash: string
  coin: string
  chain: string
  type: 'recharge' | 'withdraw'
  amount: string
  fromAddress?: string
  toAddress?: string
  status: FlowStatus
  createdAt: string
}

export default function FundFlow() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [auditLoading, setAuditLoading] = useState(false)
  const [data, setData] = useState<FundFlowItem[]>([])
  const [total, setTotal] = useState(0)

  // ========== 关键修改：从pin取权限，不再写死 ==========
  const userPin = useUserStore()
  // 这里字段名和你pin里保持一致，比如role / isAudit
  const isAuditor = userPin.user?.role === 'auditor'

  const [params, setParams] = useState({
    txHash: '',
    coin: '',
    chain: '',
    type: '',
    pageNum: 1,
    pageSize: 7,
  })

  const loadList = async () => {
    setLoading(true)
    try {
      const res = await getRecordLists(params as any)
      setData(res.data.data.list || [])
      setTotal(res.data.data.total || 0)
    } catch (err) {
      message.error('加载流水失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadList()
  }, [params.pageNum])

  const handleSearch = (values: any) => {
    setParams((prev) => ({
      ...prev,
      ...values,
      pageNum: 1,
    }))
    setTimeout(loadList, 0)
  }

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

  const handleApprove = async (recordId: string) => {
    setAuditLoading(true)
    try {
      await getDrawAduit({
        recordId,
        action: 'approve',
      })
      message.success('审核通过成功')
      loadList()
    } catch (err) {
      message.error('审核通过失败，请重试')
    } finally {
      setAuditLoading(false)
    }
  }

  const handleReject = async (recordId: string) => {
    setAuditLoading(true)
    try {
      // 统一用已引入的 getDrawAduit，修复找不到auditWithdraw的报错
      await getDrawAduit({
        recordId,
        action: 'reject',
      })
      message.success('已驳回')
      loadList()
    } catch (err) {
      message.error('驳回失败，请重试')
    } finally {
      setAuditLoading(false)
    }
  }

  const baseColumns: ColumnsType<FundFlowItem> = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 90,
      fixed: 'left',
      render: (val) => {
        return val === 'recharge' ? (
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
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (time) => (time ? dayjs(time).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 110,
      fixed: 'right',
      render: (amt: string, row) => {
        const num = Number(amt) || 0
        if (row.type === 'recharge') {
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
      render: (status) => {
        if (status === 'pending') return <Tag color="processing">待处理</Tag>
        if (status === 'pending_audit')
          return <Tag color="processing">待审核</Tag>
        if (status === 'audited_pass') return <Tag color="error">已审核</Tag>
        if (status === 'reject') return <Tag color="error">已驳回、已退钱</Tag>
        if (status === 'success' || status === 'confirming')
          return <Tag color="success">已到账</Tag>
        return <Tag>未知</Tag>
      },
    },
  ]

  const actionColumn: ColumnsType<FundFlowItem> = isAuditor
    ? [
        {
          title: '操作',
          key: 'action',
          width: 180,
          fixed: 'right',
          render: (_: any, record: FundFlowItem) => {
            if (record.status === 'pending_audit') {
              return (
                <>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleApprove(record._id)}
                    loading={auditLoading}
                    style={{ marginRight: 8 }}>
                    通过
                  </Button>
                  <Button
                    danger
                    size="small"
                    onClick={() => handleReject(record._id)}
                    loading={auditLoading}>
                    驳回
                  </Button>
                </>
              )
            }
            return null
          },
        },
      ]
    : []

  const columns: ColumnsType<FundFlowItem> = [...baseColumns, ...actionColumn]

  return (
    <div style={{ padding: '16px' }}>
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
