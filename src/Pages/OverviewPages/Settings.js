"use client"

import { useState } from "react"
import { Layout, Menu, Avatar, Card, Input, Button, Select, Upload, Form, Typography, Space, Divider } from "antd"
import {
  DashboardOutlined,
  UserOutlined,
  EnvironmentOutlined,
  AimOutlined,
  CarOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  EditOutlined,
  UploadOutlined,
  MenuOutlined,
} from "@ant-design/icons"

const { Sider, Content } = Layout
const { Title, Text } = Typography
const { Option } = Select

export default function SettingsPage() {
  const [editingPersonal, setEditingPersonal] = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('loggedWyreUserAdmin')) || {}
  const decodedUserData = userData.decodedUserData || {}

  const logOut = () => {
    window.localStorage.removeItem("loggedWyreUserAdmin");
    window.location.href = "/";
  };

  return (
    <section>
        <div
          style={{
            backgroundImage: "url(/images/profile-banner.png)",
            height: "200px",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat", 
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: "-130px",
              left: "40px",
              gap: "20px",
            }}
          >
            <Avatar 
            size={120}
            style={{ backgroundColor: "#b9b9b9", border: "4px solid #fff" }}
            shape="square"
              src={decodedUserData.client_image ? `/media/${decodedUserData.client_image}` : undefined}
              icon={<UserOutlined />}
            />
            <div>
              <Title level={2} style={{ margin: 0 }}>
                {decodedUserData.first_name || "Asake. U. Way "} {decodedUserData.last_name}
              </Title>
              <Text type="secondary">
                {decodedUserData.email || "asake@wyre.com"}
              </Text>
            </div>
          </div>
        </div>

        <Content
          style={{
            padding: "80px 40px 40px",
          background: "#f5f5f5",
            marginTop: "70px",
            minHeight: "calc(100vh - 180px)",
          }}
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <UserOutlined />
                  Personal Info
                </div>
              }
              extra={
                !editingPersonal && (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => setEditingPersonal(true)}
                  >
                    Edit
                  </Button>
                )
              }
              style={{ borderRadius: "12px" }}
            >
              {!editingPersonal ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                  <div>
                    <Text type="secondary">Full Name</Text>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                      <UserOutlined />
                      <Text>{decodedUserData.first_name} {decodedUserData.last_name}</Text>
                    </div>
                  </div>
                  <div>
                    <Text type="secondary">Email Address</Text>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                      <Text>{decodedUserData.email}</Text>
                    </div>
                  </div>
                  <div>
                    <Text type="secondary">Phone Number</Text>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                      <span style={{ color: "#00C851" }}>🇳🇬</span>
                      <Text>{decodedUserData.phone_number}</Text>
                    </div>
                  </div>
                  <div>
                    <Text type="secondary">Account Type</Text>
                    <div style={{ marginTop: "4px" }}>
                      <Text>{decodedUserData.role_text}</Text>
                    </div>
                  </div>
                </div>
              ) : (
                <Form layout="vertical">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                    <Form.Item label="Full Name">
                      <Input prefix={<UserOutlined />} defaultValue={`${decodedUserData.first_name} ${decodedUserData.last_name}`} style={{ borderRadius: "8px" }} />
                    </Form.Item>
                    <Form.Item label="Email Address">
                      <Input defaultValue={decodedUserData.email} style={{ borderRadius: "8px" }} />
                    </Form.Item>
                    <Form.Item label="Phone Number">
                      <Input.Group compact>
                        <Select defaultValue="+234" style={{ width: "80px" }}>
                          <Option value="+234">🇳🇬 +234</Option>
                        </Select>
                        <Input
                          defaultValue={decodedUserData.phone_number}
                          style={{ width: "calc(100% - 80px)", borderRadius: "0 8px 8px 0" }}
                        />
                      </Input.Group>
                    </Form.Item>
                    <Form.Item label="Account Type">
                      <Input defaultValue={decodedUserData.role_text} style={{ borderRadius: "8px" }} />
                    </Form.Item>
                  </div>

                  <Divider />

                  <Form.Item label="Change Avatar">
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <Avatar
                        size={64}
                        src={decodedUserData.client_image ? `/media/${decodedUserData.client_image}` : undefined}
                        icon={<UserOutlined />}
                      />
                      <Upload>
                        <div
                          style={{
                            border: "2px dashed #d9d9d9",
                            borderRadius: "8px",
                            padding: "20px",
                            textAlign: "center",
                            cursor: "pointer",
                          }}
                        >
                          <UploadOutlined style={{ fontSize: "24px", color: "#8B5CF6" }} />
                          <div style={{ marginTop: "8px" }}>
                            <Text style={{ color: "#8B5CF6" }}>Click here</Text> to upload your file or drag.
                          </div>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            Supported Format: JPG, PNG (1mb each)
                          </Text>
                        </div>
                      </Upload>
                    </div>
                  </Form.Item>

                  <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                    <Button onClick={() => setEditingPersonal(false)}>Cancel</Button>
                    <Button type="primary">
                      Save
                    </Button>
                  </div>
                </Form>
              )}
            </Card>

            {/* Password & Security Section */}
            <Card
              title={<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>Password & Security</div>}
              extra={
                !editingPassword && (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => setEditingPassword(true)}
                  >
                    Edit
                  </Button>
                )
              }
              style={{ borderRadius: "12px" }}
            >
              {!editingPassword ? (
                <div>
                  <Text type="secondary">Password</Text>
                  <div style={{ marginTop: "4px" }}>
                    <Text>Godis****</Text>
                  </div>
                </div>
              ) : (
                <Form layout="vertical">
                  <Text type="secondary" style={{ display: "block", marginBottom: "16px" }}>
                    You can change your current password settings here.
                  </Text>

                  <Form.Item label="Current password">
                    <Input.Password style={{ borderRadius: "8px" }} />
                  </Form.Item>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                    <Form.Item label="New password">
                      <Input.Password style={{ borderRadius: "8px" }} />
                    </Form.Item>
                    <Form.Item label="Confirm password">
                      <Input.Password style={{ borderRadius: "8px" }} />
                    </Form.Item>
                  </div>

                  <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                    <Button onClick={() => setEditingPassword(false)}>Cancel</Button>
                    <Button type="primary">
                      Save
                    </Button>
                  </div>
                </Form>
              )}
            </Card>
          </Space>

        <div
          style={{
            float: "right",
            marginTop: "50px",
          }}
          >
            <Button
              danger
              style={{
                background: "#E74C3C",
                borderColor: "#E74C3C",
                color: "white",
              }}
            onClick={logOut}
            >
              Log out
            </Button>
          </div>
        </Content>
    </section>
  )
}
