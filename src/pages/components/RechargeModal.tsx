import React, { useState, useEffect } from 'react'
import {
  Modal,
  Button,
  Card,
  Space,
  Tag,
  Typography,
  Timeline,
  Row,
  Col,
  message,
} from 'antd'
import { QrcodeOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { QRCodeSVG } from 'qrcode.react'

// 你真实接口
import { getDepositAddress } from '../../api/walletApi'

const { Text, Paragraph } = Typography

const coinChains: Record<string, any[]> = {
  USDT: [
    { chain: 'TRC20', network: 'Tron', fee: '1 USDT', fast: true },
    { chain: 'BEP20', network: 'BSC', fee: '0.5 USDT', fast: true },
    { chain: 'ERC20', network: 'Ethereum', fee: '12 USDT', fast: false },
  ],
  BTC: [
    { chain: 'BTC', network: 'Bitcoin', fee: '0.0001 BTC', fast: false },
    {
      chain: 'Lightning',
      network: 'Lightning Network',
      fee: '0.00001 BTC',
      fast: true,
    },
  ],
  ETH: [
    {
      chain: 'Sepolia',
      network: 'Sepolia Testnet',
      fee: '0.001 ETH',
      fast: true,
    },
    { chain: 'ERC20', network: 'Ethereum', fee: '0.01 ETH', fast: false },
    {
      chain: 'Arbitrum',
      network: 'Arbitrum One',
      fee: '0.002 ETH',
      fast: true,
    },
    { chain: 'Optimism', network: 'Optimism', fee: '0.003 ETH', fast: true },
  ],
  BNB: [{ chain: 'BEP20', network: 'BSC', fee: '0.005 BNB', fast: true }],
}

interface RechargeModalProps {
  visible: boolean
  onClose: () => void
}

const RechargeModal: React.FC<RechargeModalProps> = ({ visible, onClose }) => {
  const [currentCoin, setCurrentCoin] = useState('USDT')
  const [selected, setSelected] = useState(coinChains.USDT[0])
  const [qrVisible, setQrVisible] = useState(false)

  // 充值地址
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  // ========== 真实调用后端接口 ==========
  const loadAddress = async () => {
    // 只有 ETH Sepolia 才调用真实接口做演示
    if (!(currentCoin === 'ETH' && selected.chain === 'Sepolia')) {
      setAddress('演示地址：暂未开通')
      return
    }

    setLoading(true)
    try {
      const result = await getDepositAddress({
        coin: currentCoin,
        chain: selected.chain,
      })
      console.log('接口返回地址：', result.data)
      setAddress(result.data.address || '')
    } catch (err) {
      console.error(err)
      message.error('获取地址失败')
    } finally {
      setLoading(false)
    }
  }

  // 打开弹窗 / 切 ETH Sepolia 时重新加载
  useEffect(() => {
    if (visible) {
      loadAddress()
    }
  }, [visible, currentCoin, selected])

  const switchCoin = (coin: string) => {
    setCurrentCoin(coin)
    setSelected(coinChains[coin][0])
  }

  return (
    <>
      <Modal
        title="资产充值"
        open={visible}
        onCancel={onClose}
        width={700}
        footer={null}
        style={{ top: 20 }}
        styles={{
          body: {
            background: '#fff',
            padding: '8px 16px',
          },
        }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {/* 币种 */}
          <Card title="选择币种" size="small">
            <Space wrap>
              {['USDT', 'BTC', 'ETH', 'BNB'].map((coin) => (
                <Button
                  key={coin}
                  type={currentCoin === coin ? 'primary' : 'default'}
                  onClick={() => switchCoin(coin)}>
                  {coin}
                </Button>
              ))}
            </Space>
          </Card>

          {/* 链 */}
          <Card title="选择链类型" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              {coinChains[currentCoin].map((item) => (
                <div
                  key={item.chain}
                  onClick={() => setSelected(item)}
                  style={{
                    padding: '10px 12px',
                    border:
                      selected.chain === item.chain
                        ? '1px solid #1890ff'
                        : '1px solid #e8e8e8',
                    borderRadius: 6,
                    cursor: 'pointer',
                    background:
                      selected.chain === item.chain ? '#f0f7ff' : '#fff',
                  }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}>
                    <Text strong>{item.chain}</Text>
                    {item.fast && (
                      <Tag
                        color="green"
                        icon={<ThunderboltOutlined />}
                        size="small">
                        高速
                      </Tag>
                    )}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 12,
                      color: '#666',
                    }}>
                    <span>{item.network}</span>
                    <span>手续费: {item.fee}</span>
                  </div>
                </div>
              ))}
            </Space>
          </Card>

          {/* 充值地址 —— 真实显示后端返回的地址 */}
          <Card title="充值地址" size="small">
            <Row gutter={16} align="middle">
              <Col span={17}>
                <Paragraph
                  copyable
                  style={{
                    background: '#f7f8fa',
                    padding: '10px',
                    borderRadius: 6,
                    wordBreak: 'break-all',
                  }}>
                  {loading ? '加载中...' : address}
                </Paragraph>
              </Col>
              <Col span={7} style={{ textAlign: 'right' }}>
                <Button
                  icon={<QrcodeOutlined />}
                  onClick={() => setQrVisible(true)}
                  size="small">
                  二维码
                </Button>
              </Col>
            </Row>
          </Card>

          {/* 进度 + 提示 */}
          <Row gutter={16}>
            <Col span={12}>
              <Card title="到账进度" size="small">
                <Timeline
                  items={[
                    { color: 'green', children: '等待转账' },
                    { color: 'gray', children: '网络确认中' },
                    { color: 'gray', children: '到账成功' },
                  ]}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="温馨提示" size="small">
                <div style={{ fontSize: 12, color: '#666', lineHeight: 1.7 }}>
                  • 仅支持 {currentCoin}({selected.chain}) 转入
                  <br />
                  • 选错链资产将丢失
                  <br />• 到账后自动显示在资产中
                </div>
              </Card>
            </Col>
          </Row>
        </Space>
      </Modal>

      {/* 二维码弹窗 */}
      <Modal
        open={qrVisible}
        onCancel={() => setQrVisible(false)}
        footer={null}
        width={340}
        title="充值二维码">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          {loading ? (
            <div>加载中...</div>
          ) : (
            <QRCodeSVG value={address || ''} size={200} />
          )}
          <Paragraph
            copyable
            style={{
              wordBreak: 'break-all',
              marginTop: 16,
              background: '#f7f8fa',
              padding: 8,
              borderRadius: 6,
            }}>
            {address}
          </Paragraph>
        </div>
      </Modal>
    </>
  )
}

export default RechargeModal
