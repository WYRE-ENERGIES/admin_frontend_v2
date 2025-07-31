import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Select, notification, Switch } from 'antd';
import { APIService } from '../../config/Api/apiServices';

const { Option } = Select;

const EditMainUserModal = ({ visible, onCancel, user, clientId, onUserUpdated }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        is_active: user.is_active !== false,
        roles: user.roles?.id || user.roles, // pre-select role id if available
      });
    }
  }, [user, form]);

  useEffect(() => {
    // Fetch roles from API
    const fetchRoles = async () => {
      try {
        const response = await APIService.get('/api/v2/roles');
        if (response.data && response.data.authenticatedData) {
          const rolesArr = Object.entries(response.data.authenticatedData).map(([name, id]) => ({ id, name }));
          setRoles(rolesArr);
        }
      } catch (error) {
        notification.error({ message: 'Error', description: 'Failed to fetch user roles.' });
      }
    };
    fetchRoles();
  }, []);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      // Remove password fields if not changing password
      if (!changePassword) {
        delete values.password;
        delete values.confirm_password;
      }
      // PATCH main user
      const payload = {
        user_id: user.id,
        username: values.username,
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone_number: values.phone_number,
        is_active: values.is_active,
        roles: values.roles, // send role id
      };
      if (changePassword && values.password) {
        payload.password = values.password;
      }
      await APIService.patch(`/api/v1/accounts/client/${clientId}/main-user/`, payload);
      notification.success({ message: 'Main user updated successfully' });
      if (onUserUpdated) onUserUpdated();
      onCancel();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error?.response?.data?.message || 'Failed to update user details.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Main User Details"
      visible={visible}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="back" onClick={onCancel}>Cancel</Button>,
        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>Save</Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="username" label="Username" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="first_name" label="First Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="last_name" label="Last Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone_number" label="Phone Number">
          <Input />
        </Form.Item>
        <Form.Item name="roles" label="Role" rules={[{ required: true, message: 'Please select a role' }]}>
          <Select placeholder="Select role">
            {roles.filter(role => role.name !== 'SUPERADMIN' && role.name !== 'CLIENT_ADMIN').map(role => (
              <Option key={role.id} value={role.id}>{role.name}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="is_active" label="Active Status" valuePropName="checked">
          <Switch />
        </Form.Item>
        
        <div style={{ marginBottom: 16 }}>
          <Switch 
            checked={changePassword} 
            onChange={setChangePassword}
            style={{ marginRight: 8 }}
          />
          Change Password
        </div>

        {changePassword && (
          <>
            <Form.Item 
              name="password" 
              label="New Password" 
              rules={[
                { required: true, message: 'Please enter a new password' },
                { min: 8, message: 'Password must be at least 8 characters' }
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item 
              name="confirm_password" 
              label="Confirm Password" 
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default EditMainUserModal; 