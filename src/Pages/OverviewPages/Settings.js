import React, { useState, useEffect } from "react"
import { Layout, Card, Form, Input, Button, Avatar, Typography, Space, Menu, Upload, message } from "antd"
import {
  UserOutlined,
  EditOutlined,
  LogoutOutlined,
  DeleteOutlined,
  SettingOutlined,
  DashboardOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  BarChartOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import { APIService } from "../../config/Api/apiServices"
import { useDispatch } from "react-redux"
import { logUserOut } from "../../redux/actions/auth/auth.action"

const { Sider, Content } = Layout
const { Title, Text } = Typography

const SettingsPage = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [activeView, setActiveView] = useState("overview") // 'overview' or 'detailed'
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [userProfile, setUserProfile] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    avatar: "",
    username: "",
    roles: 0,
    branch_id: []
  })

  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await APIService.get(`/api/v2/clients/${localStorage.getItem('clientId')}/users/${localStorage.getItem('userId')}/`)
      setUserProfile(response.data)
      profileForm.setFieldsValue(response.data)
    } catch (error) {
      message.error("Failed to fetch user profile")
    }
  }

  const handleProfileSave = async (values) => {
    try {
      const response = await APIService.put(
        `/api/v2/clients/${localStorage.getItem('clientId')}/users/${localStorage.getItem('userId')}/`,
        {
          username: values.username || userProfile.username,
          phone_number: values.phoneNumber,
          email: values.email,
          roles: values.roles || userProfile.roles,
          branch_id: values.branch_id || userProfile.branch_id
        }
      )
      setUserProfile(response.data)
      message.success("Profile updated successfully")
      setIsEditing(false)
    } catch (error) {
      message.error("Failed to update profile")
    }
  }

  const handleLogout = () => {
    dispatch(logUserOut())
    navigate('/login')
  }

  const handlePasswordChange = (values) => {
    message.success("Password changed successfully")
    passwordForm.resetFields()
  }

  const handleAvatarUpload = (info) => {
    if (info.file.status === "done") {
      message.success("Avatar uploaded successfully")
      // Update user profile with new avatar URL
      setUserProfile({ ...userProfile, avatar: info.file.response.url })
    }
  }

  const sidebarItems = [
    { key: "admin-overview", icon: <DashboardOutlined />, label: "Admin Overview" },
    { key: "users", icon: <TeamOutlined />, label: "Users" },
    { key: "view-location", icon: <EnvironmentOutlined />, label: "View Location" },
    { key: "set-target", icon: <BarChartOutlined />, label: "Set Target" },
    { key: "diesel-overview", icon: <DashboardOutlined />, label: "Diesel Overview" },
    { key: "settings", icon: <SettingOutlined />, label: "Settings" },
    { key: "support", icon: <QuestionCircleOutlined />, label: "Support" },
  ]

  const DetailedView = () => (
    <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "100vh", maxWidth: "800px" }}>
      <div style={{  marginInline: "auto", width: "100%" }}>
        {/* Profile Info Section */}
        <Card
          style={{
            marginBottom: "24px",
            borderRadius: "12px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          }}
        >
          <Title level={3} style={{ marginBottom: "24px", color: "#333" }}>
            Profile Info
          </Title>

          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <Avatar size={120} src={userProfile.avatar} icon={<UserOutlined />} style={{ marginBottom: "16px" }} />
            <div>
              <Upload showUploadList={false} onChange={handleAvatarUpload} style={{ marginRight: "12px" }}>
                <Button size="small" style={{ marginRight: "8px" }}>
                  Remove Photo
                </Button>
              </Upload>
              <Upload showUploadList={false} onChange={handleAvatarUpload}>
                <Button size="small" type="primary">
                  Upload Photo
                </Button>
              </Upload>
            </div>
          </div>

          <Form form={profileForm} layout="vertical" initialValues={userProfile} onFinish={handleProfileSave}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Form.Item
                label={
                  <Text strong style={{ fontSize: "12px", color: "#666" }}>
                    *REQUIRED FIELD
                  </Text>
                }
                name="firstName"
                rules={[{ required: true, message: "First name is required" }]}
              >
                <Input placeholder="FIRST NAME" style={{ height: "40px" }} />
              </Form.Item>

              <Form.Item
                label={
                  <Text strong style={{ fontSize: "12px", color: "#666" }}>
                    LAST NAME
                  </Text>
                }
                name="lastName"
              >
                <Input placeholder="LAST NAME" style={{ height: "40px" }} />
              </Form.Item>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Form.Item
                label={
                  <Text strong style={{ fontSize: "12px", color: "#666" }}>
                    PHONE NUMBER*
                  </Text>
                }
                name="phoneNumber"
              >
                <Input placeholder="PHONE NUMBER" style={{ height: "40px" }} />
              </Form.Item>

              <Form.Item
                label={
                  <Text strong style={{ fontSize: "12px", color: "#666" }}>
                    EMAIL*
                  </Text>
                }
                name="email"
              >
                <Input
                  placeholder="EMAIL"
                  style={{ height: "40px" }}
                  suffix={<Text style={{ color: "#ff4d4f", fontSize: "12px" }}>Verify Email</Text>}
                />
              </Form.Item>
            </div>

            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  width: "100%",
                  height: "40px",
                  borderRadius: "8px",
                }}
              >
                Save Changes
              </Button>
            </div>
          </Form>
        </Card>

        {/* Change Password Section */}
        <Card
          style={{
            marginTop: "24px",
            borderRadius: "12px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          }}
        >
          <Title level={3} style={{ marginBottom: "24px", color: "#333" }}>
            Change Password
          </Title>
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordChange}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
              <Form.Item
                label={
                  <Text strong style={{ fontSize: "12px", color: "#666" }}>
                    CURRENT PASSWORD*
                  </Text>
                }
                name="currentPassword"
                rules={[{ required: true, message: "Current password is required" }]}
              >
                <Input.Password placeholder="CURRENT PASSWORD" style={{ height: "40px" }} />
              </Form.Item>

              <Form.Item
                label={
                  <Text strong style={{ fontSize: "12px", color: "#666" }}>
                    NEW PASSWORD*
                  </Text>
                }
                name="newPassword"
                rules={[{ required: true, message: "New password is required" }]}
              >
                <Input.Password placeholder="NEW PASSWORD" style={{ height: "40px" }} />
              </Form.Item>

              <Form.Item
                label={
                  <Text strong style={{ fontSize: "12px", color: "#666" }}>
                    CONFIRM NEW PASSWORD*
                  </Text>
                }
                name="confirmPassword"
                rules={[{ required: true, message: "Confirm new password" }]}
              >
                <Input.Password placeholder="CONFIRM NEW PASSWORD" style={{ height: "40px" }} />
              </Form.Item>
            </div>

            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  width: "100%",
                  height: "40px",
                  borderRadius: "8px",
                }}
              >
                Change Password
              </Button>
            </div>
          </Form>
        </Card>

        {/* Logout Section */}
        <Card
          style={{
            marginTop: "24px",
            borderRadius: "12px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          }}
        >
          <Title level={3} style={{ marginBottom: "24px", color: "#333" }}>
            Account Actions
          </Title>
          <div style={{ textAlign: "center" }}>
            <Button
              type="primary"
              danger
              onClick={handleLogout}
              style={{
                width: "100%",
                height: "40px",
                borderRadius: "8px",
              }}
            >
              Logout
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )

  const OverviewView = () => (
    <div style={{ padding: "24px", backgroundColor: "#f8f9fa", minHeight: "100vh", marginInline: "auto", minWidth: "800px" }}>
      <Title level={2} style={{ marginBottom: "32px", color: "#333" }}>
        Settings
      </Title>

      <Space direction="vertical" size="large" style={{ width: "100%"}}>
        {/* Profile Info Card */}
        <Card
          style={{
            borderRadius: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "none",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
              <Avatar size={80} src={userProfile.avatar} icon={<UserOutlined />} />
              <div>
                <Title level={4} style={{ margin: "0 0 16px 0", color: "#333" }}>
                  Profile info
                </Title>
                <Space direction="vertical" size="small">
                  <div>
                    <Text strong style={{ fontSize: "12px", color: "#666", display: "block" }}>
                      FIRST NAME
                    </Text>
                    <Text style={{ color: "#333" }}>{userProfile.firstName}</Text>
                  </div>
                  <div>
                    <Text strong style={{ fontSize: "12px", color: "#666", display: "block" }}>
                      LAST NAME
                    </Text>
                    <Text style={{ color: "#333" }}>{userProfile.lastName}</Text>
                  </div>
                  <div>
                    <Text strong style={{ fontSize: "12px", color: "#666", display: "block" }}>
                      PHONE NUMBER
                    </Text>
                    <Text style={{ color: "#333" }}>{userProfile.phoneNumber || "-"}</Text>
                  </div>
                  <div>
                    <Text strong style={{ fontSize: "12px", color: "#666", display: "block" }}>
                      EMAIL
                    </Text>
                    <Text style={{ color: "#333" }}>{userProfile.email}</Text>
                  </div>
                </Space>
              </div>
            </div>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => setActiveView("detailed")}
              style={{ color: "#666" }}
            >
              Edit
            </Button>
          </div>
        </Card>

        {/* Password & Security Card */}
        <Card
          style={{
            borderRadius: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "none",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <Title level={4} style={{ margin: "0 0 16px 0", color: "#333" }}>
                Password & Security
              </Title>
              <div>
                <Text strong style={{ fontSize: "12px", color: "#666", display: "block" }}>
                  PASSWORD
                </Text>
                <Text style={{ color: "#333" }}>••••••••••••</Text>
              </div>
            </div>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => setActiveView("detailed")}
              style={{ color: "#666" }}
            >
              Edit
            </Button>
          </div>
        </Card>
      </Space>

      {/* Bottom Actions */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <Button type="text" icon={<LogoutOutlined />} style={{ color: "#666", textAlign: "right" }}>
          LOG OUT
        </Button>
      </div>
    </div>
  )

  return (
    <Content style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%"}}>
      {activeView === "detailed" ? <DetailedView /> : <OverviewView />}
    </Content>
  )
}

export default SettingsPage
