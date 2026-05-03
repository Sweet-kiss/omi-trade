import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './router/index.tsx'
import TestWallet from './wallettext'

// Wagmi 核心
import { WagmiProvider, createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// React Query（必须配套）
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 创建 QueryClient 实例
const queryClient = new QueryClient()

// Wagmi 配置
const config = createConfig({
  // 只连测试网
  chains: [sepolia],
  // 小狐狸钱包
  connectors: [injected()],
  // 节点地址
  transports: {
    [sepolia.id]: http(),
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <WagmiProvider config={config}>
    {/* 第二层：React Query 状态 */}
    <QueryClientProvider client={queryClient}>
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
    </QueryClientProvider>
  </WagmiProvider>,
)
