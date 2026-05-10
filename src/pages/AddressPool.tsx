import React, { useState, useEffect } from 'react'
import {
  Row,
  Col,
  Card,
  Select,
  Button,
  Statistic,
  Modal,
  InputNumber,
  message,
  Table,
  Spin,
} from 'antd'
import {
  WalletOutlined,
  BankOutlined,
  CloudSyncOutlined,
} from '@ant-design/icons'
import type { TableColumnsType } from 'antd'
import {
  getAddressPollLists,
  getChainCoinLists,
  getbatchGenerate,
} from '../api/addressPoolApi.ts'

const { Option } = Select
const WARNING_LIMIT = 500

interface ChainCoinItem {
  key: string
  chain: string
  coin: string
  chainName: string
  coinName: string
  total: number
  used: number
  idle: number
}

interface GlobalStat {
  total: number
  used: number
  idle: number
}

const AddressPool: React.FC = () => {
  const [chainId, setChainId] = useState<string>()
  const [coinId, setCoinId] = useState<string>()
  const [open, setOpen] = useState(false)
  const [genCount, setGenCount] = useState<number | null>(null)

  // 全局概览统计
  const [globalStat, setGlobalStat] = useState<GlobalStat>({
    total: 0,
    used: 0,
    idle: 0,
  })
  // 表格列表数据
  const [tableList, setTableList] = useState<ChainCoinItem[]>([])
  // 当前选中链币空闲数量
  const [loading, setLoading] = useState(false)
  const [genLoading, setGenLoading] = useState(false)

  // 页面初始化只请求：全局概览
  useEffect(() => {
    fetchGlobalStat()
    fetchIdleStat()
  }, [])

  // 获取全局概览（只请求一次）
  const fetchGlobalStat = async () => {
    try {
      const res = await getAddressPollLists()
      // 假设后端格式：{ code:200, data:{ totalAll, usedAll, idleAll, list:[] } }
      const resData = res.data
      if (resData.code === 200) {
        // 顶部统计赋值
        setGlobalStat(resData.data)
      }
    } catch (err) {
      message.error('获取地址池概览失败')
    }
  }

  // 获取选中链币单独空闲数量
  const fetchIdleStat = async () => {
    try {
      const res = await getChainCoinLists({
        chain: chainId!,
        coin: coinId!,
      })
      const resData = res.data
      console.log(resData, 'resData-------')
      if (resData.code == 200) {
        setTableList(resData.data)
      }
    } catch (err) {
      message.error('获取库存数量失败')
    }
  }

  const columns: TableColumnsType<ChainCoinItem> = [
    { title: '链名称', dataIndex: 'chain' },
    { title: '币种', dataIndex: 'coin' },
    { title: '地址总数', dataIndex: 'total' },
    { title: '已分配数量', dataIndex: 'used' },
    { title: '剩余空闲数量', dataIndex: 'idle' },
  ]

  const handleOpenModal = () => {
    if (!chainId) {
      message.warning('请先选择链类型')
      return
    }
    if (!coinId) {
      message.warning('请先选择币种')
      return
    }
    setOpen(true)
  }

  const handleGenerate = async () => {
    if (!genCount) {
      message.warning('请输入要生成的地址数量')
      return
    }

    if (genCount > 5000) {
      message.warning('生成数量不能超过5000')
      return
    }

    setGenLoading(true)
    try {
      const res = await getbatchGenerate({
        chain: chainId!,
        coin: coinId!,
        count: genCount,
      })
      if (res.data.code === 200) {
        message.success(`已开始生成 ${genCount} 条地址`)
        setOpen(false)
        setGenCount(null)
        // 生成完只刷新一次概览接口，自动刷新顶部+表格
        fetchGlobalStat()
        fetchIdleStat()
      }
    } catch (err) {
      message.error('批量生成地址失败')
    } finally {
      setGenLoading(false)
    }
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        margin: 0,
        padding: '16px',
        boxSizing: 'border-box',
      }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="地址池总数"
              value={globalStat.total}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="已分配数量"
              value={globalStat.used}
              prefix={<WalletOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="剩余可用地址"
              value={globalStat.idle}
              prefix={<CloudSyncOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 8 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Select
              placeholder="选择链类型"
              style={{ width: 180 }}
              value={chainId}
              onChange={setChainId}
              allowClear>
              <Option value="Sepolia">Sepolia测试网</Option>
              <Option value="BtcTest">BTC测试网</Option>
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="选择币种"
              style={{ width: 180 }}
              value={coinId}
              onChange={setCoinId}
              allowClear>
              <Option value="ETH">ETH</Option>
              <Option value="BTC">BTC</Option>
            </Select>
          </Col>
          <Col flex="auto" />
          <Col>
            <Button type="primary" onClick={handleOpenModal}>
              一键生成地址
            </Button>
          </Col>
        </Row>
      </Card>

      <Card style={{ width: '100%' }}>
        <Spin spinning={loading}>
          <Table
            rowKey="key"
            dataSource={tableList}
            columns={columns}
            pagination={false}
          />
        </Spin>
      </Card>

      <Modal
        title="批量生成空闲地址"
        open={open}
        onOk={handleGenerate}
        onCancel={() => setOpen(false)}
        confirmLoading={genLoading}>
        <div style={{ marginBottom: 16 }}>
          已选：
          {chainId === 'sepolia' ? 'Sepolia测试网' : 'BTC测试网'}
          &nbsp;&nbsp;
          {coinId === 'eth' ? 'ETH' : 'BTC'}
        </div>

        <InputNumber
          style={{ width: '100%' }}
          placeholder="请输入需要生成的地址数量"
          value={genCount}
          onChange={setGenCount}
          min={1}
          max={5000}
          step={1}
        />

        <div style={{ marginTop: 8, color: '#666' }}>
          支持范围：100 ~ 5000，建议单次生成 500~1000 条
        </div>
      </Modal>
    </div>
  )
}

export default AddressPool
