import React, { useState } from 'react';
import { Form, Input, Button, Card, Select, message, Typography } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons';
import { APIService } from '../../config/Api/apiServices';
import { createMainUser } from './CreateClient';
import { notification, Modal } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

const AddMainUserModal = ({ visible, clientId, onCancel, onUserAdded }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  

   const submitMainUser = async (values) => {
      if (!clientId) {
        message.error('Client ID not found. Please go back to step 1.');
        return { success: false, error: 'Client ID not found' };
      }
  
      setIsSubmitting(true);
      message.loading({ content: 'Creating main user...', key: 'createMainUser', duration: 0 });
      
      try {
        const response = await createMainUser(clientId, values);

        notification.success({ message: 'Main user updated successfully' });
        onCancel();
        onUserAdded();

        return { success: true, data: response.data };
      } catch (error) {
        let errorMessage = 'Failed to create main user. Please check your connection and try again.';
        if (error.response.data.errors.username)
        {
          notification.error({ message: error.response.data.errors.username });
        } else
        {
          notification.error({ message: "Error Creating Main User" });
        }
        return { success: false, error: errorMessage };
      } finally {
        setIsSubmitting(false);
        message.destroy('createMainUser');
      }
   };

  return (
      <Modal
      title="Add Main User (Client Admin)"
      visible={visible}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="back" onClick={onCancel}>Cancel</Button>,
        <Button key="submit" type="primary" loading={isSubmitting} onClick={() => form.submit()}>Add Main User</Button>,
      ]}
    >
    <Form
      form={form}
      layout="vertical"
      onFinish={submitMainUser}
    >
        <Form.Item
           label="Username"
          name="mainUsername"
          rules={[{ required: true, message: 'Username is required!' }]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>

        <Form.Item
          label="First Name"
          name="mainFirstName"
          rules={[{ required: true, message: 'First Name is required!' }]}
        >
          <Input placeholder="Enter first name" />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="mainLastName"
          rules={[{ required: true, message: 'Last Name is required!' }]}
        >
          <Input placeholder="Enter last name" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="mainEmail"
          rules={[{ type: 'email', required: true, message: 'Please enter a valid email!' }]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>

        <Form.Item
          label="Phone Number"
          name="mainPhoneNumber"
          rules={[{ required: true, message: 'Phone Number is required!' }]}
        >
          <Input placeholder="Enter phone number" />
        </Form.Item>

        <Form.Item
             label="Password"
                name="mainPassword"
          rules={[{ required: true, message: 'Password is required!' }]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>
    </Form>
    </Modal>
  );
};

export default AddMainUserModal;
