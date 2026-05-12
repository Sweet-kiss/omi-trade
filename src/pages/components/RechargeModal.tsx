import React, { useState, useEffect } from 'react'
import {
  Modal,
  Button,
  Card,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  message,
  Input,
} from 'antd'
import { QrcodeOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { QRCodeSVG } from 'qrcode.react'

import { getCollectAddress } from '../../api/getCollectAddressApi.ts'

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

  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  // 👉 新增：用户钱包地址
  const [userWalletAddr, setUserWalletAddr] = useState('')

  // 👉 去掉自动调用，只保留手动触发
  const loadAddress = async () => {
    // 必须是ETH Sepolia
    if (!(currentCoin === 'ETH' && selected.chain === 'Sepolia')) {
      message.info('当前仅支持 ETH Sepolia 分配地址')
      return
    }

    // 校验用户必须输入钱包地址
    if (!userWalletAddr.trim()) {
      message.warning('请输入你的钱包地址')
      return
    }

    setLoading(true)
    try {
      const collectRes = await getCollectAddress({
        coin: currentCoin,
        chain: selected.chain,
        userWalletAddr: userWalletAddr, // 👉 传给后端
      })

      const resData = collectRes.data.data
      console.log(resData, 'resData----------')

      setAddress(resData.collectAddress)
      message.success('地址分配成功')
    } catch (err) {
      console.error(err)
      message.error('获取地址失败')
    } finally {
      setLoading(false)
    }
  }

  const switchCoin = (coin: string) => {
    setCurrentCoin(coin)
    setSelected(coinChains[coin][0])
    setAddress('') // 切换清空地址
    setUserWalletAddr('')
  }

  return (
    <>
      <Modal
        title="资产充值"
        open={visible}
        onCancel={onClose}
        width={700}
        footer={null}
        style={{ top: 10 }}
        styles={{
          body: {
            background: '#fff',
            padding: '8px 16px',
          },
        }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
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

          {/* 👉 新增：用户钱包地址输入框 */}
          {currentCoin === 'ETH' && selected.chain === 'Sepolia' && (
            <Card title="你的钱包地址" size="small">
              <Input
                placeholder="请输入你的钱包地址"
                value={userWalletAddr}
                onChange={(e) => setUserWalletAddr(e.target.value)}
                style={{ marginBottom: 10 }}
              />
              <Button
                type="primary"
                block
                loading={loading}
                onClick={loadAddress}>
                申请分配地址
              </Button>
            </Card>
          )}

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
                  {loading ? '加载中...' : address || '未分配'}
                </Paragraph>
              </Col>
              <Col span={7} style={{ textAlign: 'right' }}>
                <Button
                  icon={<QrcodeOutlined />}
                  onClick={() => setQrVisible(true)}
                  size="small"
                  disabled={!address}>
                  二维码
                </Button>
              </Col>
            </Row>
          </Card>

          <Row gutter={16}>
            <Col span={12}>
              <Card title="到账进度" size="small"></Card>
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
