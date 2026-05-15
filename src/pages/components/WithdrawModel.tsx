import { useState } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Divider,
  message,
  Row,
  Col,
} from 'antd'
import { WalletOutlined } from '@ant-design/icons'

import { withDraw } from '../../api/withDrawApi'

// 后面换成你真实接口数据
const mockAvailableBalance = 1.234567
const ethPriceUSD = 1800

interface WithdrawModalProps {
  visible: boolean
  onClose: () => void
}

export default function WithdrawModal({
  visible,
  onClose,
}: WithdrawModalProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState<number>(0)

  const feeRate = 0.001 // 0.1%
  const fee = amount * feeRate
  const totalDeduct = amount + fee
  const receiveAmount = amount

  // 美元折合
  const receiveUsd = receiveAmount * ethPriceUSD
  const feeUsd = fee * ethPriceUSD
  const totalDeductUsd = totalDeduct * ethPriceUSD

  // 链的种类
  const chainOptions = [
    { value: 'mainnet', label: 'Ethereum 主网' },
    { value: 'sepolia', label: 'Ethereum Sepolia 测试网' },
    { value: 'bsc', label: 'BSC 币安智能链' },
    { value: 'polygon', label: 'Polygon (MATIC)' },
    { value: 'arbitrum', label: 'Arbitrum One' },
    { value: 'solana', label: 'Solana' },
  ]
  // 币的种类
  const coinOptions = [
    { value: 'ETH', label: 'ETH' },
    { value: 'USDT', label: 'USDT' },
    { value: 'USDC', label: 'USDC' },
    { value: 'BNB', label: 'BNB' },
    { value: 'MATIC', label: 'MATIC' },
    { value: 'SOL', label: 'SOL' },
    { value: 'TRX', label: 'TRX' },
  ]

  const handleMax = () => {
    setAmount(mockAvailableBalance)
    form.setFieldValue('amount', mockAvailableBalance)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const values = await form.validateFields()
      // 直接调用你二次封装的 Withdraw + JWT 自动带上
      const res = await withDraw({
        chain: values.chain,
        coin: values.coin,
        amount: values.amount,
        address: values.address, // 你后端字段是 address
      })

      console.log(values, 'values--------')

      const data = res as any
      console.log(data, 'data--------')
    } catch (error) {
      message.error('提现请求失败，请检查')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={
        <>
          <WalletOutlined /> 提现
        </>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      style={{ top: 10 }}
      styles={{
        body: {
          backgroundColor: '#ffffff',
          padding: '10px 20px',
        },
      }}>
      <Form
        form={form}
        layout="vertical"
        initialValues={{ chain: 'sepolia', token: 'ETH' }}>
        {/* 可用余额 */}
        <div style={{ fontSize: 13, color: '#333', marginBottom: 12 }}>
          可用余额：
          <strong>{mockAvailableBalance.toFixed(6)} ETH</strong>
          <span style={{ color: '#666', marginLeft: 6 }}>
            ≈ {(mockAvailableBalance * ethPriceUSD).toFixed(2)} USD
          </span>
        </div>

        {/* 一行两列：链 + 币种 */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="币种"
              name="coin"
              initialValue="ETH"
              rules={[{ required: true, message: '请选择币种' }]}>
              <Select options={coinOptions} placeholder="请选择币种" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="选择链"
              name="chain"
              initialValue="sepolia"
              rules={[{ required: true, message: '请选择链' }]}>
              <Select options={chainOptions} placeholder="请选择链" />
            </Form.Item>
          </Col>
        </Row>

        {/* 一行两列：地址 + 数量 */}
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              label="提现地址"
              name="address"
              rules={[
                { required: true, message: '请输入提现地址' },
                { pattern: /^0x[a-fA-F0-9]{40}$/, message: '地址格式不正确' },
              ]}>
              <Input placeholder="0x..." style={{ backgroundColor: '#fff' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="提现数量"
              name="amount"
              rules={[
                { required: true, message: '请输入数量' },
                { min: 0.001, message: '最小提现 0.001 ETH' },
              ]}>
              <Input
                type="number"
                placeholder="输入提现数量"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                style={{ backgroundColor: '#fff' }}
                suffix={
                  <Button type="text" size="small" onClick={handleMax}>
                    全部
                  </Button>
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{ marginTop: '3px' }} />

        {/* 计算明细（全带 USD） */}
        <div style={{ fontSize: 13, color: '#333' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 2,
            }}>
            <span>手续费（0.1%）</span>
            <span>
              {fee.toFixed(6)} ETH ≈ {feeUsd.toFixed(2)} USD
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 2,
            }}>
            <span>实际到账</span>
            <span style={{ fontWeight: 500 }}>
              {receiveAmount.toFixed(6)} ETH ≈ {receiveUsd.toFixed(2)} USD
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 500,
            }}>
            <span>总扣除</span>
            <span style={{ color: '#ff4d4f' }}>
              {totalDeduct.toFixed(6)} ETH ≈ {totalDeductUsd.toFixed(2)} USD
            </span>
          </div>
        </div>

        <Divider />

        {/* 到账时间 + 审核说明 */}
        <div
          style={{
            padding: '10px 12px',
            border: '1px solid #e8e8e8',
            borderRadius: 6,
            fontSize: 12,
            backgroundColor: '#ffffff',
          }}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>预计到账时间</div>
          <div>• 审核通过后：5～15 分钟</div>
          <div>• 以链上区块确认速度为准</div>

          <div style={{ marginTop: 8, fontWeight: 500 }}>审核说明</div>
          <div>• 提现申请需审核员审核通过后才会出币</div>
          <div>• 异常大额、新账号可能延迟处理</div>
          <div>• 审核期间请耐心等待，请勿重复提交</div>
        </div>

        <Divider />

        {/* 按钮一行：取消左 / 提交右 */}
        <Form.Item style={{ marginBottom: 0 }}>
          <Row justify="space-between">
            <Col>
              <Button onClick={onClose}>取消</Button>
            </Col>
            <Col>
              <Button type="primary" loading={loading} onClick={handleSubmit}>
                提交提现申请
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </Modal>
  )
}
