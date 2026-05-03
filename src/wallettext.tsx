import { useAccount, useConnect, useDisconnect } from 'wagmi'

export default function TestWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <div style={{ padding: '20px' }}>
      <h2>小狐狸连接测试</h2>

      {isConnected ? (
        <div>
          <p>已连接：{address}</p>
          <button onClick={() => disconnect()}>断开钱包</button>
        </div>
      ) : (
        <button onClick={() => connect({ connector: connectors[0] })}>
          连接小狐狸钱包
        </button>
      )}
    </div>
  )
}
