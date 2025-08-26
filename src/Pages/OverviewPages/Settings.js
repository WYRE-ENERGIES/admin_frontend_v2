import { useState, useEffect } from "react"
import { Layout, Avatar, Card, Input, Button, Select, Upload, Form, Typography, Space, Divider, notification } from "antd"
import {
  UserOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons"
import EnvData from '../../config/EnvData';
import { connect } from 'react-redux';
import { updateUserProfile, updateUserPassword } from '../../redux/actions/auth/auth.action';

const { Content } = Layout
const { Title, Text } = Typography
const { Option } = Select

function SettingsPage({ auth, updateUserProfile, updateUserPassword }) {
  const updateProfileLoading = auth.updateProfileLoading;
  const updatePasswordLoading = auth.updatePasswordLoading;
  // Use state for userData
  const [userData, setUserData] = useState(() => {
    return JSON.parse(localStorage.getItem('currentUser')) || {}
  })
  const [editingPersonal, setEditingPersonal] = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [, setIsLogoLoading] = useState(false)
  
  const [imagePreview, setImagePreview] = useState(null);
  const [pendingLogo, setPendingLogo] = useState(null);

  useEffect(() => {
    const handleStorage = () => {
      const updatedUser = JSON.parse(localStorage.getItem('currentUser')) || {}
      setUserData(updatedUser)
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  


  useEffect(() => {
    form.setFieldsValue({
      username: userData.username,
      email: userData.email,
      phone_number: userData.phone_number,
      roles: userData.client_type
    })
  }, [userData, form])

  

  const handleSubmit = async (values) => {
    const updatedUserData = {
      username: values.username || userData.username,
      phone_number: values.phone_number || userData.phone_number || userData.phone,
      email: values.email || userData.email,
      roles: userData.roles,
      branch_id: userData.branch_id
    };
    const result = await updateUserProfile(userData.client_id, userData.id, updatedUserData, pendingLogo);
    if (result && result.fulfilled)
    {
      notification.success({
        message: 'Success',
        description: 'Profile updated successfully!',
        duration: 3
      });
      setEditingPersonal(false);
      // Update localStorage and userData with new data
      const newUserData = {
        ...userData,
        ...result.data
      };
      setUserData(newUserData);
      localStorage.setItem('currentUser', JSON.stringify(newUserData));
      form.setFieldsValue({
        username: result.data.username,
        email: result.data.email,
        phone_number: result.data.phone,
        roles: result.data.client_type
      });
    } else
    {
      notification.error({
        message: 'Error',
        description: result?.message || 'Failed to update profile. Please try again.',
        duration: 3
      });
    }
  };

  const handleLogoUpload = async (file) => {
    try
    {
      setIsLogoLoading(true)

      const fileObj = file.originFileObj || file.file

      if (!fileObj)
      {
        throw new Error('No file selected')
      }

      const dataUrl = await toBase64(fileObj)
      setImagePreview(dataUrl)
      setPendingLogo(fileObj)

      notification.success({
        message: 'Success',
        description: 'Logo preview updated successfully!',
        duration: 3
      })
    } catch (error)
    {
      console.error('Error updating logo preview:', error)
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to update logo preview. Please try again.',
        duration: 3
      })
    } finally
    {
      setIsLogoLoading(false)
    }
  }

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng)
    {
      notification.error({
        message: 'Error',
        description: 'You can only upload JPG/PNG file!',
        duration: 3
      })
      return false
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M)
    {
      notification.error({
        message: 'Error',
        description: 'Image must smaller than 2MB!',
        duration: 3
      })
      return false
    }
    return true
  }

  const handlePasswordSubmit = async (values) => {
    const updatePayload = {
      current_password: values.current_password,
      new_password: values.new_password,
    };
    const result = await updateUserPassword(updatePayload);
    if (result && result.fulfilled)
    {
      notification.success({
        message: 'Success',
        description: 'Password updated successfully!',
        duration: 3
      });
      setEditingPassword(false);
      passwordForm.resetFields();
    } else
    {
      notification.error({
        message: 'Error',
        description: result?.message || 'Failed to update password. Please try again.',
        duration: 3
      });
    }
  };

  const validatePhoneNumber = (_, value) => {
    if (!value)
    {
      return Promise.reject('Please enter your phone number');
    }

    const numericValue = value.replace(/\D/g, '');

    // Check prefix
    const mobilePrefixes = ['07', '08', '09'];
    const landlinePrefixes = ['01', '02', '03'];
    const allPrefixes = [...mobilePrefixes, ...landlinePrefixes];

    const prefix = numericValue.substring(0, 2);
    if (!allPrefixes.includes(prefix))
    {
      return Promise.reject('Phone number must start with 01, 02, 03 (landline) or 07, 08, 09 (mobile)');
    }

    // Check length based on type
    if (mobilePrefixes.includes(prefix))
    {
      if (numericValue.length !== 11)
      {
        return Promise.reject('Mobile number must be exactly 11 digits');
      }
    } else if (landlinePrefixes.includes(prefix))
    {
      if (numericValue.length !== 8 && numericValue.length !== 10)
      {
        return Promise.reject('Landline number must be either 8 or 10 digits');
      }
    }

    return Promise.resolve();
  };

  const validatePassword = (_, value) => {
    if (!value)
    {
      return Promise.reject('Please enter your password');
    }

    if (value.length < 8)
    {
      return Promise.reject('Password must be at least 8 characters long');
    }

    if (!/[0-9]/.test(value))
    {
      return Promise.reject('Password must contain at least one number');
    }

    if (!/[A-Z]/.test(value))
    {
      return Promise.reject('Password must contain at least one uppercase letter');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value))
    {
      return Promise.reject('Password must contain at least one special character');
    }

    return Promise.resolve();
  };

  const validateConfirmPassword = (_, value) => {
    const { new_password } = passwordForm.getFieldsValue();
    if (!value || !new_password)
    {
      return Promise.reject('Please confirm your password');
    }
    if (value !== new_password)
    {
      return Promise.reject('Passwords do not match');
    }

    if (value.length < 8)
    {
      return Promise.reject('Password must be at least 8 characters long');
    }
    if (!/[0-9]/.test(value))
    {
      return Promise.reject('Password must contain at least one number');
    }
    if (!/[A-Z]/.test(value))
    {
      return Promise.reject('Password must contain at least one uppercase letter');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value))
    {
      return Promise.reject('Password must contain at least one special character');
    }

    return Promise.resolve();
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
            bottom: "-140px",
            left: "40px",
            gap: "20px",
          }}
        >
          <Avatar
            size={120}
            style={{ backgroundColor: "#b9b9b9", border: "4px solid #fff" }}
            shape="square"
            src={EnvData.REACT_APP_API_URL + userData.client_image}
            icon={<UserOutlined />}
          />
          <div>
            <Title level={2} style={{ marginTop: 1 }}>
              {userData.first_name || "---"} {userData.last_name}
            </Title>
            <p style={{ marginTop: -10 }}>
              {userData.username}
            </p>
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
                    <Text>{userData.first_name} {userData.last_name}</Text>
                  </div>
                </div>
                <div>
                  <Text type="secondary">Email Address</Text>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <Text>{userData.email}</Text>
                  </div>
                </div>
                <div>
                  <Text type="secondary">Phone Number</Text>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <Text>{userData.phone_number || "---"}</Text>
                  </div>
                </div>
                <div>
                  <Text type="secondary">Account Type</Text>
                  <div style={{ marginTop: "4px" }}>
                    <Text>{userData.client_type}</Text>
                  </div>
                </div>
              </div>
            ) : (
              <Form
                layout="vertical"
                form={form}
                onFinish={handleSubmit}
                initialValues={{
                  username: userData.username,
                  email: userData.email,
                  phone_number: userData.phone_number,
                  roles: userData.client_type
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                  <Form.Item
                    name="username"
                    label="Username"
                    rules={[{ required: true, message: 'Please enter your username' }]}
                    validateTrigger={"onChange"}
                  >
                    <Input prefix={<UserOutlined />} defaultValue={userData.username} style={{ borderRadius: "8px" }} />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Please enter a valid email' }]}
                    validateTrigger={"onChange"}
                  >
                    <Input defaultValue={userData.email} style={{ borderRadius: "8px" }} disabled />
                  </Form.Item>
                  <Form.Item
                    name="phone_number"
                    label="Phone Number"
                    validateTrigger={"onType"}
                  >
                    <Input.Group compact style={{ display: "flex", alignItems: "center" }}>
                      <Select defaultValue="+234" disabled>
                        <Option value="+234">🇳🇬 +234</Option>
                      </Select>
                      <Form.Item
                        name="phone_number"
                        noStyle
                        rules={[{ required: true, validator: validatePhoneNumber }]}
                      >
                        <Input
                          defaultValue={userData.phone_number}
                          type="number"
                          pattern="[0-9]*"
                          style={{ width: "calc(100% - 80px)", borderRadius: "0 8px 8px 0" }}
                        />
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>
                  <Form.Item
                    name="roles"
                    label="Account Type"
                    rules={[{ required: true, message: 'Please select your account type' }]}
                    validateTrigger={"onChange"}
                  >
                    <Input defaultValue={userData.client_type} style={{ borderRadius: "8px" }} disabled />
                  </Form.Item>
                </div>

                <Divider />

                <Form.Item label="Change Logo">
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <Avatar
                      size={64}
                      shape="square"
                      src={imagePreview || EnvData.REACT_APP_API_URL + userData.client_image}
                      icon={<UserOutlined />}
                    />
                    <Upload
                      name="logo_url"
                      listType="picture"
                      showUploadList={false}
                      beforeUpload={beforeUpload}
                      onChange={(info) => {
                        if (info.file.status === 'done')
                        {
                          handleLogoUpload(info.file)
                        }
                      }}
                      customRequest={(options) => {
                        // Prevent the default upload behavior
                        options.onSuccess('ok')
                      }}
                    >
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
                          <Text style={{ color: "#8B5CF6" }}>Click here</Text> to upload your logo or drag.
                        </div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          Supported Format: JPG, PNG (2mb each)
                        </Text>
                      </div>
                    </Upload>
                  </div>
                </Form.Item>

                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                  <Button onClick={() => setEditingPersonal(false)}>Cancel</Button>
                  <Button type="primary" htmlType="submit" loading={updateProfileLoading}>
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
                  <Text>********</Text>
                </div>
              </div>
            ) : (
              <Form
                layout="vertical"
                form={passwordForm}
                onFinish={handlePasswordSubmit}
              >
                <Text type="secondary" style={{ display: "block", marginBottom: "16px" }}>
                  You can change your current password settings here.
                </Text>

                <Form.Item
                  label="Current Password"
                  name="current_password"
                  rules={[{ required: true, message: 'Please enter your current password' }]}
                >
                  <Input.Password placeholder="Enter current password" />
                </Form.Item>

                <Form.Item
                  label="New Password"
                  name="new_password"
                  rules={[{ required: true, validator: validatePassword }]}
                >
                  <Input.Password placeholder="Enter new password" />
                </Form.Item>

                <Form.Item
                  label="Confirm New Password"
                  name="confirm_password"
                  rules={[{ required: true, validator: validateConfirmPassword }]}
                >
                  <Input.Password placeholder="Confirm new password" />
                </Form.Item>

                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                  <Button onClick={() => setEditingPassword(false)}>Cancel</Button>
                  <Button type="primary" htmlType="submit" loading={updatePasswordLoading}>
                    Save
                  </Button>
                </div>
              </Form>
            )}
          </Card>
        </Space>

      </Content>
    </section>
  )
}

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { updateUserProfile, updateUserPassword })(SettingsPage)
