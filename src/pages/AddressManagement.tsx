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
import { getAddressManageLists } from '../api/addressManageApi.ts'
import { toBindAddress } from '../api/bindAddressApi.ts'
import { toUnBindAddress } from '../api/unBindAddress.ts'
import { getChainBlance } from '../api/chainBlance.ts'

const { Option } = Select
const { Search } = Input
const { Item } = Form

interface BindAddressItem {
  _id: string
  userName: string
  chainName: string
  coinName: string
  address: string
  balance: string
  userStatus: string | number
  bindTime: string
  status: 0 | 1
  createTime: string
  createdAt: string
  chain: string
  coin: string
}

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

const chainMap: Record<string, string> = {
  Sepolia: 'Sepolia 测试网',
  Polygon: 'Polygon 测试网',
  BitcoinTestnet: 'BTC 测试网',
}

const coinMap: Record<string, string> = {
  ETH: 'ETH 以太币',
  BTC: 'BTC 比特币',
}

const getUserStatusTag = (val: string | number) => {
  switch (Number(val)) {
    case 1:
      return <Tag color="green">正常</Tag>
    case 2:
      return <Tag color="red">冻结</Tag>
    case 3:
      return <Tag color="default">作废</Tag>
    default:
      return <Tag>未知</Tag>
  }
}

const AddressManagement: React.FC = () => {
  const [chainId, setChainId] = useState<string>()
  const [coinId, setCoinId] = useState<string>()
  const [address, setAddress] = useState('')
  const [activeTab, setActiveTab] = useState('bound')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [tableData, setTableData] = useState<BindAddressItem[]>([])
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailInfo, setDetailInfo] = useState<BindAddressItem>(defaultDetail)
  const [assignVisible, setAssignVisible] = useState(false)
  const [currentRow, setCurrentRow] = useState<BindAddressItem | null>(null)
  const [assignLoading, setAssignLoading] = useState(false)
  const [form] = Form.useForm()
  const [unBindModalVisible, setUnBindModalVisible] = useState(false)
  const [unBindRow, setUnBindRow] = useState<BindAddressItem | null>(null)
  const [realChainBalance, setRealChainBalance] = useState('')
  const [checkBalanceLoading, setCheckBalanceLoading] = useState(false)
  const [unBindLoading, setUnBindLoading] = useState(false)
  const [balanceModalVisible, setBalanceModalVisible] = useState(false)
  const [balanceInfo, setBalanceInfo] = useState<{
    chainName: string
    coin: string
    address: string
    balance: string
  } | null>(null)
  const [balanceModalLoading, setBalanceModalLoading] = useState(false)

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

  const handleAssignOk = async () => {
    try {
      const values = await form.validateFields()
      if (!currentRow?._id) return
      setAssignLoading(true)
      const res = await toBindAddress({
        poolId: currentRow._id,
        userWalletAddr: values.userWalletAddr,
      })
      const resultData = res.data as any
      if (resultData.code === 200) {
        message.success('地址分配绑定成功')
        setAssignVisible(false)
        form.resetFields()
        fetchAddressList()
      } else if (resultData.code === 400) {
        message.error(resultData.msg)
        setAssignVisible(false)
        form.resetFields()
      }
    } catch (err) {
      message.error('操作失败，请稍后重试')
    } finally {
      setAssignLoading(false)
    }
  }

  const getStatusValue = () => {
    if (activeTab === 'bound') return 1
    if (activeTab === 'unbound') return 0
    return 1
  }

  const fetchAddressList = async () => {
    const statusVal = getStatusValue()
    const params = {
      page,
      pageSize,
      chain: chainId ?? '',
      coin: coinId ?? '',
      address: address.trim(),
      status: statusVal,
    }
    try {
      const res = await getAddressManageLists(params as any)
      if (res.data.code === 200) {
        setTableData(res.data.data.list)
        setTotal(res.data.data.total)
      }
    } catch (err) {
      message.error('列表数据请求失败')
    }
  }

  const handleViewRealBalance = async (record: BindAddressItem) => {
    setBalanceModalVisible(true)
    setBalanceModalLoading(true)
    setBalanceInfo(null)
    try {
      const res = await getChainBlance({
        chain: record.chain.toLowerCase(),
        address: record.address,
      })
      if (res.data.code === 200) {
        let bal = res.data.data.balance || '0'
        bal = bal.replace(/^0+(?=\d)/, '')
        if (bal === '') bal = '0'
        setBalanceInfo({
          chainName: chainMap[record.chain] || record.chain,
          coin: record.coin,
          address: record.address,
          balance: bal,
        })
      } else {
        message.error(res.data.msg || '查询余额失败')
      }
    } catch (error) {
      message.error('调用接口查询链上余额异常')
    } finally {
      setBalanceModalLoading(false)
    }
  }

  const handleOpenUnBindModal = async (record: BindAddressItem) => {
    setUnBindRow(record)
    setUnBindModalVisible(true)
    setRealChainBalance('')
    setCheckBalanceLoading(true)
    try {
      const res = await getChainBlance({
        chain: record.chain.toLowerCase(),
        address: record.address,
      })
      if (res.data.code === 200) {
        let bal = res.data.data.balance || '0'
        bal = bal.replace(/^0+(?=\d)/, '')
        setRealChainBalance(bal || '0')
      } else {
        message.error(res.data.msg || '查询余额失败')
      }
    } catch (err) {
      message.error('余额校验失败，请重试')
    } finally {
      setCheckBalanceLoading(false)
    }
  }

  const handleUnBindOk = async () => {
    if (!unBindRow?._id) return
    if (Number(realChainBalance) > 0) {
      message.error('地址存在链上余额，请先归集后再解绑！')
      return
    }
    setUnBindLoading(true)
    try {
      const res = await toUnBindAddress({
        address: unBindRow.address,
      })
      if (res.data.code === 200) {
        message.success('解绑成功，地址已回收至地址池')
        setUnBindModalVisible(false)
        fetchAddressList()
      } else {
        message.error(res.data.msg || '解绑失败')
      }
    } catch (err) {
      message.error('网络异常，解绑失败')
    } finally {
      setUnBindLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [activeTab])

  useEffect(() => {
    fetchAddressList()
  }, [page, pageSize, activeTab])

  const handleSearch = () => {
    setPage(1)
    fetchAddressList()
  }

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current)
    setPageSize(pagination.pageSize)
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      message.success('地址复制成功')
    } catch (error) {
      message.error('复制失败，请手动复制')
    }
  }

  const columns = useMemo<TableColumnsType<BindAddressItem>>(() => {
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
    const extraCols: TableColumnsType<BindAddressItem> = [
      { title: '绑定用户', dataIndex: 'userName', width: 120 },
      {
        title: '用户状态',
        dataIndex: 'userStatus',
        width: 100,
        render: (val) => getUserStatusTag(val),
      },
      {
        title: '地址余额',
        dataIndex: 'balance',
        width: 180,
        render: (val, record) => (
          <Space size="small">
            <Button
              size="small"
              type="link"
              onClick={() => handleViewRealBalance(record)}>
              查看链上余额
            </Button>
          </Space>
        ),
      },
    ]
    const restCols: TableColumnsType<BindAddressItem> = [
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        width: 170,
        render: (time) => time || '-',
      },
      {
        title: '操作',
        width: 100,
        fixed: 'right',
        render: (_, record) => (
          <Space size="small">
            {record.status === 1 ? (
              <Button
                type="link"
                danger
                onClick={() => handleOpenUnBindModal(record)}>
                解绑
              </Button>
            ) : (
              <Button type="link" onClick={() => handleOpenAssignModal(record)}>
                分配
              </Button>
            )}
          </Space>
        ),
      },
    ]
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
            {getUserStatusTag(detailInfo.userStatus)}
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

      <Modal
        title="确认解绑地址"
        open={unBindModalVisible}
        onCancel={() => setUnBindModalVisible(false)}
        footer={
          Number(realChainBalance) <= 0
            ? [
                <Button
                  key="cancel"
                  onClick={() => setUnBindModalVisible(false)}>
                  取消
                </Button>,
                <Button
                  key="ok"
                  type="primary"
                  danger
                  loading={unBindLoading}
                  onClick={handleUnBindOk}>
                  确认解绑
                </Button>,
              ]
            : [
                <Button onClick={() => setUnBindModalVisible(false)}>
                  关闭
                </Button>,
              ]
        }>
        {checkBalanceLoading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            正在校验链上真实余额，请稍候...
          </div>
        ) : (
          <>
            <p>钱包地址：{unBindRow?.address}</p>
            <p>
              链上真实余额：<strong>{realChainBalance}</strong>
            </p>
            {Number(realChainBalance) > 0 ? (
              <p style={{ color: '#ff4d4f', fontWeight: 500, marginTop: 10 }}>
                ❌ 检测到地址仍有链上资产，暂无法解绑，请先归集！
              </p>
            ) : (
              <p style={{ color: '#52c41a', fontWeight: 500, marginTop: 10 }}>
                ✅ 当前余额为0，可正常解绑，解绑后地址将回收至地址池
              </p>
            )}
          </>
        )}
      </Modal>

      <Modal
        title="链上余额详情"
        open={balanceModalVisible}
        onCancel={() => setBalanceModalVisible(false)}
        footer={null}
        width={520}
        destroyOnClose>
        {balanceModalLoading ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            正在查询链上余额...
          </div>
        ) : balanceInfo ? (
          <div style={{ lineHeight: '2.5', fontSize: 15 }}>
            <div>
              <strong>所在网络：</strong>
              {balanceInfo.chainName}
            </div>
            <div>
              <strong>币种类型：</strong>
              {balanceInfo.coin}
            </div>
            <div>
              <strong>钱包地址：</strong>
              {balanceInfo.address}
            </div>
            <div>
              <strong>链上余额：</strong>
              {balanceInfo.balance}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>暂无数据</div>
        )}
      </Modal>
    </div>
  )
}

export default AddressManagement
