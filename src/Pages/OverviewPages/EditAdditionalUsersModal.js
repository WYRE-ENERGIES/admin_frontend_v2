import React, { useState, useEffect } from 'react';
import { Modal, Button, notification, Table, Form, Input, Select, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { APIService } from '../../config/Api/apiServices';

const { Option } = Select;

const EditAdditionalUsersModal = ({ visible, onCancel, users, clientId, onUserUpdated }) => {
  const [editingUsers, setEditingUsers] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (users) {
      setEditingUsers(users.map(user => ({ ...user, key: user.username })));
    }
  }, [users]);

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

  const handleSave = async () => {
    setLoading(true);
    try {
      // PATCH each edited user (could be optimized for batch, but API expects one at a time)
      for (const user of editingUsers) {
        const payload = {
          user_id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          roles: typeof user.roles === 'object' ? user.roles.id : user.roles,
          phone_number: user.phone_number,
        };
        await APIService.patch(`/api/v1/accounts/client/${clientId}/additional-user/`, payload);
      }
      notification.success({ message: 'Users updated successfully' });
      if (onUserUpdated) onUserUpdated();
      onCancel();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error?.response?.data?.message || error.message || 'Failed to update additional users.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsAddModalVisible(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      roles: user.roles,
    });
    setIsAddModalVisible(true);
  };

  const handleDeleteUser = (username) => {
    setEditingUsers(editingUsers.filter(user => user.username !== username));
  };

  const handleUserFormSubmit = async (values) => {
    if (editingUser) {
      // Edit existing user (handled in handleSave)
      setEditingUsers(editingUsers.map(user => 
        user.username === editingUser.username ? { ...user, ...values } : user
      ));
      setIsAddModalVisible(false);
      setEditingUser(null);
      form.resetFields();
    } else {
      // Add new user: POST to API
      setLoading(true);
      try {
        const payload = [{
          username: values.username,
          password: values.password,
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          roles: typeof values.roles === 'object' ? values.roles.id : values.roles,
          phone_number: values.phone_number,
        }];
        await APIService.post(`/api/v1/accounts/client/${clientId}/additional-user/`, payload);
        notification.success({ message: 'User created successfully' });
        if (onUserUpdated) onUserUpdated();
        setIsAddModalVisible(false);
        setEditingUser(null);
        form.resetFields();
      } catch (error) {
        notification.error({
          message: 'Error',
          description: error?.response?.data?.message || error.message || 'Failed to create user.',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const columns = [
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { 
      title: 'Name', 
      key: 'name', 
      render: (_, record) => `${record.first_name || ''} ${record.last_name || ''}`.trim() || '---' 
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone_number', key: 'phone_number' },
    {
      title: 'Role',
      key: 'roles',
      render: (_, record) => `${record.roles.name || ''}`, 
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        title="Edit Additional Users"
        visible={visible}
        onCancel={onCancel}
        width={1000}
        footer={[
          <Button key="back" onClick={onCancel}>Cancel</Button>,
          <Button key="add" type="dashed" icon={<PlusOutlined />} onClick={handleAddUser}>
            Add User
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleSave}>
            Save
          </Button>,
        ]}
      >
        <Table 
          dataSource={editingUsers} 
          columns={columns} 
          rowKey="username" 
          pagination={false} 
          size="small"
        />
      </Modal>

      <Modal
        title={editingUser ? "Edit User" : "Add New User"}
        visible={isAddModalVisible}
        onCancel={() => {
          setIsAddModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={[
          <Button key="back" onClick={() => {
            setIsAddModalVisible(false);
            setEditingUser(null);
            form.resetFields();
          }}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            {editingUser ? 'Update' : 'Add'}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleUserFormSubmit}>
          <Form.Item 
            name="username" 
            label="Username" 
            rules={[{ required: true, message: 'Please enter username' }]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>
          {!editingUser && (
            <Form.Item 
              name="password" 
              label="Password" 
              rules={[{ required: true, message: 'Please enter password' }, { min: 8, message: 'Password must be at least 8 characters' }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item 
            name="first_name" 
            label="First Name" 
            rules={[{ required: true, message: 'Please enter first name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            name="last_name" 
            label="Last Name" 
            rules={[{ required: true, message: 'Please enter last name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            name="email" 
            label="Email" 
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="phone_number" label="Phone Number">
            <Input />
          </Form.Item>
          <Form.Item 
            name="roles" 
            label="Role" 
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select placeholder="Select role">
              {roles.map(role => (
                 role.name !== "SUPERADMIN" && role.name !== "CLIENT_ADMIN" &&
                    <Option key={role.id} value={role.id}>{role.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EditAdditionalUsersModal; 