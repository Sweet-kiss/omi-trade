import { Form, Input, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/useUserStore'
// 👇 只新加这一行，引入登录接口
import { login } from '../api/user'

const { Title, Text } = Typography

export default function Login() {
  // 从 store 里拿到 存用户 的方法
  const setUser = useUserStore((state) => state.setUser)

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

      const data = res.data.data

      console.log('登录接口返回的数据：', data) // 这里能看到后端返回的 token 和菜单了

      if (res.data.code === 0) {
        message.success('登录成功')

        // 👇 把 token 存起来
        localStorage.setItem('token', data.token)
        localStorage.setItem('userMenus', JSON.stringify(data.menus)) // 👈 关键存菜单
        // 把后端返回的 用户信息 存进去
        setUser({
          id: data.id,
          username: data.username,
          token: data.token,
          role: data.role, // 角色，你后面权限要用
        })

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
