import React, { useState, useEffect } from 'react';
import { Modal, Button, notification, Table, Form, Input, Select, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

const EditAdditionalUsersModal = ({ visible, onCancel, users }) => {
  const [editingUsers, setEditingUsers] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (users) {
      setEditingUsers(users.map(user => ({ ...user, key: user.username })));
    }
  }, [users]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API endpoint when available
      console.log('Saving additional users:', editingUsers);
      
      notification.info({
        message: 'Not Implemented',
        description: 'The endpoint for updating additional users is not available yet.',
      });
      onCancel();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to update additional users.',
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

  const handleUserFormSubmit = (values) => {
    if (editingUser) {
      // Edit existing user
      setEditingUsers(editingUsers.map(user => 
        user.username === editingUser.username ? { ...user, ...values } : user
      ));
    } else {
      // Add new user
      const newUser = {
        ...values,
        key: values.username,
        id: Date.now(), // Temporary ID
      };
      setEditingUsers([...editingUsers, newUser]);
    }
    setIsAddModalVisible(false);
    setEditingUser(null);
    form.resetFields();
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
    { title: 'Role', dataIndex: 'roles', key: 'roles' },
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
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDeleteUser(record.username)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
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
              <Option value="OPERATOR">OPERATOR</Option>
              <Option value="MANAGER">MANAGER</Option>
              <Option value="VIEWER">VIEWER</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EditAdditionalUsersModal; 