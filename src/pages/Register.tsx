import { Form, Input, Select, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { register } from '../api/user'

const { Title, Text } = Typography

export default function Register() {
  const navigate = useNavigate()
  const [form] = Form.useForm()

  // 角色选项（解决 TS 报错）
  const roleOptions = [
    { value: 'super', label: '超级管理员' },
    { value: 'admin', label: '管理员' },
    { value: 'auditor', label: '审核员' },
    { value: 'user', label: '普通用户' },
  ]

  const handleRegister = async () => {
    try {
      const values = await form.validateFields()
      console.log('提交的表单数据：', values) // 这里能看到 role 了

      const res = await register({
        username: values.username,
        password: values.password,
        email: values.email,
        role: values.role, // 👈 把角色一起传给后端
      })

      const data = res.data

      if (data.code === 0) {
        message.success('注册成功')
        navigate('/login')
      } else {
        message.error(data.msg ?? '注册失败')
      }
    } catch (err) {
      message.error('注册失败')
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
          <Title level={3}>用户注册</Title>
          <Text type="secondary">ERC20 代币撮合交易系统</Text>
        </div>

        <Form form={form} layout="vertical" autoComplete="off">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}>
            <Input
              placeholder="请输入用户名"
              autoComplete="new-password"
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

          <Form.Item
            name="repassword"
            label="确认密码"
            rules={[{ required: true, message: '请确认密码' }]}>
            <Input.Password
              placeholder="再次输入密码"
              prefix={<LockOutlined />}
            />
          </Form.Item>

          <Form.Item name="email" label="邮箱（选填）">
            <Input placeholder="请输入邮箱" prefix={<MailOutlined />} />
          </Form.Item>

          {/* 👈 修好的角色选择，不报错 */}
          <Form.Item label="注册角色" name="role" initialValue="user">
            <Select options={roleOptions} placeholder="请选择角色" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" block size="large" onClick={handleRegister}>
              注册
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Text>已有账号？</Text>
          <Button
            type="link"
            onClick={() => navigate('/login')}
            style={{ paddingLeft: 4 }}>
            去登录
          </Button>
        </div>
      </Card>
    </div>
  )
}
