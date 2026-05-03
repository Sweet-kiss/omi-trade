import React, { useState } from 'react'
import MainLayout from './layout/MainLayout'
import Home from './pages/Home'

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <MainLayout collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)}>
      {/* 这里面写你的页面内容！ */}
      <Home />
    </MainLayout>
  )
}

export default App
