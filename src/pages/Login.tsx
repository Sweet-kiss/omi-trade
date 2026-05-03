import { Form, Input, Select, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
// 👇 只新加这一行，引入登录接口
import { login } from '../api/user'

const { Title, Text } = Typography

export default function Login() {
  // 角色选项（解决 TS 报错）
  const roleOptions = [
    { value: 'super', label: '超级管理员' },
    { value: 'admin', label: '管理员' },
    { value: 'auditor', label: '审核员' },
    { value: 'user', label: '普通用户' },
  ]

  const navigate = useNavigate()
  const [form] = Form.useForm()

  const handleLogin = async () => {
    try {
      const values = await form.validateFields()

      // 👇 调用真实后端登录接口
      const res = await login({
        username: values.username,
        password: values.password,
        role: values.role,
      })

      const data = res.data

      if (data.code === 0) {
        message.success('登录成功')

        // 👇 把 token 存起来
        localStorage.setItem('token', data.token)

        navigate('/')
      } else {
        message.error(data.msg || '登录失败')
      }
    } catch (err) {
      message.error('账号或密码错误')
      console.error(err)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #050d27 0%, #0d1a3d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}>
      <Card
        style={{
          width: 420,
          borderRadius: 12,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}>登录</Title>
          <Text type="secondary">ERC20 代币撮合交易系统</Text>
        </div>

        <Form form={form} layout="vertical" autoComplete="off">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}>
            <Input
              autoComplete="new-password"
              placeholder="请输入用户名"
              prefix={<UserOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password
              placeholder="请输入密码"
              autoComplete="new-password"
              prefix={<LockOutlined />}
            />
          </Form.Item>

          <Form.Item label="注册角色" name="role" initialValue="user">
            <Select options={roleOptions} placeholder="请选择角色" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" block size="large" onClick={handleLogin}>
              登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Text>没有账号？</Text>
          <Button
            type="link"
            onClick={() => navigate('/register')}
            style={{ paddingLeft: 4 }}>
            去注册
          </Button>
        </div>
      </Card>
    </div>
  )
}
