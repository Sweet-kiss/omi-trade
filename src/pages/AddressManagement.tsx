import React, { useState, useEffect, useMemo } from 'react'
import {
  Row,
  Col,
  Card,
  Select,
  Input,
  Button,
  Table,
  Tag,
  message,
  Tabs,
  Modal,
  Descriptions,
  Space,
  Form,
} from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import type { TableColumnsType } from 'antd'
// 引入你二次封装的请求
import { getAddressManageLists } from '../api/addressManageApi.ts'
// 引入分配绑定接口
import { toBindAddress } from '../api/bindAddressApi.ts'

const { Option } = Select
const { Search } = Input
const { Item } = Form

// 表格条目类型 和后端返回字段对齐
interface BindAddressItem {
  _id: string
  userName: string
  chainName: string
  coinName: string
  address: string
  balance: string
  userStatus: string
  bindTime: string
  status: 0 | 1
  createTime: string
  createdAt: string
  chain: string
  coin: string
}

// 详情弹窗默认数据
const defaultDetail = {
  _id: '',
  userName: '',
  chainName: '',
  coinName: '',
  address: '',
  balance: '',
  userStatus: '',
  bindTime: '',
  createTime: '',
  status: 0,
  createdAt: '',
  chain: '',
  coin: '',
}

// 链编码 -> 中文显示名
const chainMap: Record<string, string> = {
  Sepolia: 'Sepolia 测试网',
  Polygon: 'Polygon 测试网',
  BitcoinTestnet: 'BTC 测试网',
}

// 币种编码 -> 中文显示名
const coinMap: Record<string, string> = {
  ETH: 'ETH 以太币',
  BTC: 'BTC 比特币',
}

const AddressManagement: React.FC = () => {
  // 筛选条件
  const [chainId, setChainId] = useState<string>()
  const [coinId, setCoinId] = useState<string>()
  const [address, setAddress] = useState('')

  // 默认初始选中已绑定地址
  const [activeTab, setActiveTab] = useState('bound')

  // 分页
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  // 表格数据
  const [tableData, setTableData] = useState<BindAddressItem[]>([])

  // 详情弹窗
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailInfo, setDetailInfo] = useState<BindAddressItem>(defaultDetail)

  // ========== 新增：分配弹窗相关 ==========
  const [assignVisible, setAssignVisible] = useState(false)
  const [currentRow, setCurrentRow] = useState<BindAddressItem | null>(null)
  // 分配弹窗加载状态
  const [assignLoading, setAssignLoading] = useState(false)
  const [form] = Form.useForm()

  // 打开分配弹窗
  const handleOpenAssignModal = (record: BindAddressItem) => {
    setAssignVisible(true)
    setCurrentRow(record)
    setTimeout(() => {
      form.setFieldsValue({
        chain: chainMap[record.chain] || record.chain,
        coin: coinMap[record.coin] || record.coin,
        userWalletAddr: '',
      })
    })
  }

  // 分配确定提交
  const handleAssignOk = async () => {
    try {
      const values = await form.validateFields()
      if (!currentRow?._id) return

      setAssignLoading(true)
      // 调用绑定接口：传 poolId 和 用户输入的钱包地址
      const res = await toBindAddress({
        poolId: currentRow._id,
        userWalletAddr: values.userWalletAddr,
      })

      console.log(res, 'res--------')

      const resultData = res.data as any

      if (resultData.code === 200) {
        message.success('地址分配绑定成功')
        // 关闭弹窗
        setAssignVisible(false)
        // 重置表单
        form.resetFields()
        // 刷新列表
        fetchAddressList()
      } else if (resultData.code === 400) {
        console.log('nnnnn--')
        message.error(resultData.msg)
        // 关闭弹窗
        setAssignVisible(false)
        // 重置表单
        form.resetFields()
      }
    } catch (err) {
      console.log('校验或接口请求失败', err)
      message.error('操作失败，请稍后重试')
    } finally {
      setAssignLoading(false)
    }
  }
  // ======================================

  // Tab 转后端status：bound=1 已绑定，unbound=0 未绑定
  const getStatusValue = () => {
    if (activeTab === 'bound') return 1
    if (activeTab === 'unbound') return 0
    return 1
  }

  // 请求列表接口 -- 手动收集所有筛选框参数组装params
  const fetchAddressList = async () => {
    const statusVal = getStatusValue()
    // 把页面所有筛选框参数 全部手动装进去
    const params = {
      page,
      pageSize,
      chain: chainId ?? '',
      coin: coinId ?? '',
      address: address.trim(),
      status: statusVal,
    }

    console.log('查询参数全部带出 ==>', params)

    try {
      const res = await getAddressManageLists(params as any)
      console.log(res, 'res--4444-------')
      if (res.data.code === 200) {
        setTableData(res.data.data.list)
        setTotal(res.data.data.total)
      }
    } catch (err) {
      message.error('列表数据请求失败')
    }
  }

  // 切换Tab 重置到第一页
  useEffect(() => {
    setPage(1)
  }, [activeTab])

  // 页码、每页条数、Tab切换 自动请求
  useEffect(() => {
    fetchAddressList()
  }, [page, pageSize, activeTab])

  // 查询按钮：重置页码 + 主动调接口带所有参数
  const handleSearch = () => {
    setPage(1)
    // 关键：执行查询，把上面所有筛选框参数一起带进接口
    fetchAddressList()
  }

  // 表格分页切换
  const handleTableChange = (pagination: any) => {
    setPage(pagination.current)
    setPageSize(pagination.pageSize)
  }

  // 复制地址
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      message.success('地址复制成功')
    } catch (error) {
      message.error('复制失败，请手动复制')
    }
  }

  // 查看详情
  const handleViewDetail = (record: BindAddressItem) => {
    setDetailInfo(record)
    setDetailVisible(true)
  }

  // 分配地址
  const handleAssign = (record: BindAddressItem) => {
    handleOpenAssignModal(record)
  }

  // 解绑地址
  const handleUnBind = (record: BindAddressItem) => {
    console.log('解绑操作：', record)
    message.info('解绑操作中')
  }

  // 动态列 - 已绑定多3列，未绑定自动隐藏
  const columns = useMemo<TableColumnsType<BindAddressItem>>(() => {
    // 基础列 始终显示
    const baseCols: TableColumnsType<BindAddressItem> = [
      {
        title: '序号',
        dataIndex: '_id',
        width: 70,
        render: (_txt, _row, index) => index + 1,
      },
      { title: '所属链', dataIndex: 'chain', width: 140 },
      { title: '币种', dataIndex: 'coin', width: 90 },
      {
        title: '钱包收款地址',
        dataIndex: 'address',
        ellipsis: true,
        render: (text) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
              {text}
            </span>
            <CopyOutlined
              onClick={() => handleCopy(text)}
              style={{ cursor: 'pointer', color: '#1890ff' }}
            />
          </div>
        ),
      },
    ]

    // 仅已绑定才显示的3个额外列
    const extraCols: TableColumnsType<BindAddressItem> = [
      { title: '绑定用户', dataIndex: 'userName', width: 120 },
      { title: '用户状态', dataIndex: 'userStatus', width: 100 },
      { title: '地址余额', dataIndex: 'balance', width: 120 },
    ]

    // 时间列 + 操作列
    const restCols: TableColumnsType<BindAddressItem> = [
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        width: 170,
        render: (time) => time || '-',
      },
      {
        title: '操作',
        width: 150,
        fixed: 'right',
        render: (_, record) => (
          <Space size="small">
            {record.status === 1 ? (
              <div>
                <Button type="link" onClick={() => handleViewDetail(record)}>
                  查看详情
                </Button>
                <Button type="link" danger onClick={() => handleUnBind(record)}>
                  解绑
                </Button>
              </div>
            ) : (
              <Button type="link" onClick={() => handleAssign(record)}>
                分配
              </Button>
            )}
          </Space>
        ),
      },
    ]

    // 已绑定拼接全部，未绑定只拼基础+时间+操作
    return activeTab === 'bound'
      ? [...baseCols, ...extraCols, ...restCols]
      : [...baseCols, ...restCols]
  }, [activeTab])

  const tabItems = [
    { key: 'bound', label: '已绑定地址' },
    { key: 'unbound', label: '未绑定地址' },
  ]

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        margin: 0,
        padding: '16px',
        boxSizing: 'border-box',
      }}>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle" wrap>
          <Col>
            <Select
              placeholder="选择链类型"
              style={{ width: 160 }}
              value={chainId}
              onChange={setChainId}
              allowClear>
              <Option value="Sepolia">Sepolia测试网</Option>
              <Option value="BitcoinTestnet">BTC测试网</Option>
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="选择币种"
              style={{ width: 160 }}
              value={coinId}
              onChange={setCoinId}
              allowClear>
              <Option value="ETH">ETH</Option>
              <Option value="BTC">BTC</Option>
            </Select>
          </Col>
          <Col>
            <Search
              placeholder="已绑定搜用户/地址，未绑定仅搜地址"
              style={{ width: 300 }}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onSearch={handleSearch}
              allowClear
            />
          </Col>
          <Col>
            <Button type="primary" onClick={handleSearch}>
              查询
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Tabs
          items={tabItems}
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ marginBottom: 16 }}
        />

        <Table
          rowKey="_id"
          dataSource={tableData}
          columns={columns}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* 原有详情弹窗保留不动 */}
      <Modal
        title="地址详细信息"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="绑定用户">
            {detailInfo.userName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="所属链">
            {detailInfo.chainName}
          </Descriptions.Item>
          <Descriptions.Item label="币种">
            {detailInfo.coinName}
          </Descriptions.Item>
          <Descriptions.Item label="钱包地址" span={2}>
            {detailInfo.address}
          </Descriptions.Item>
          <Descriptions.Item label="地址余额">
            {detailInfo.balance || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="用户状态">
            {detailInfo.userStatus || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="绑定状态">
            {detailInfo.status === 1 ? '已绑定' : '未绑定'}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {detailInfo.createTime || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="绑定时间">
            {detailInfo.bindTime || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Modal>

      {/* 新增：分配弹窗 */}
      <Modal
        title="地址分配绑定"
        open={assignVisible}
        onOk={handleAssignOk}
        onCancel={() => setAssignVisible(false)}
        confirmLoading={assignLoading}
        width={480}>
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item label="所属链" name="chain">
            <Input disabled placeholder="自动带入所属链" />
          </Form.Item>
          <Form.Item label="所属币种" name="coin">
            <Input disabled placeholder="自动带入所属币种" />
          </Form.Item>
          <Form.Item
            label="用户钱包地址"
            name="userWalletAddr"
            rules={[{ required: true, message: '请输入用户钱包地址' }]}>
            <Input placeholder="请输入要绑定的用户钱包地址" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AddressManagement
