import React from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  Row,
  Col,
  Typography,
  Modal,
  message,
  notification,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { APIService } from '../../config/Api/apiServices';
import { createAdditionalUsers } from './CreateClient';

const { Title, Text } = Typography;
const { Option } = Select;

const USER_ROLES = [
  { id: 3, name: 'CLIENT_ADMIN' },
  { id: 4, name: 'OPERATOR' },
  { id: 5, name: 'VIEWER' },
];

const initialUserForm = {
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  role: null,
};

const AddAdditionalUsersModal = ({ visible, clientId, onCancel, onUsersAdded }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const submitAdditionalUsers = async (values) => {
    if (!clientId) {
      message.error('Client ID not found. Please go back to step 1.');
      return { success: false, error: 'Client ID not found' };
    }

    setIsSubmitting(true);
    
    try {
      const response = await createAdditionalUsers(clientId, values.additionalUsers);

      
      notification.success({ message: 'Additional users created successfully!' });
      
      onCancel();
      onUsersAdded();
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Additional users creation error:', error);
      let errorMessage = 'Error Creating Main User';
      
      if (error.response?.data?.errors.username) {
        errorMessage = error.response.data.errors.username;
      } else if (error.response?.data?.mesage) {
        errorMessage = error.response.data.message;
      }
      notification.error({ message: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title="Add Additional Users"
      visible={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="back" onClick={onCancel}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={() => form.submit()}>Add User</Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        name="add_additional_users"
        onFinish={submitAdditionalUsers}
      >
        <Form.List name="additionalUsers">
          {(fields, { add: addUser, remove: removeUser }) => (
            <div>
              {fields.map(({ key: userKey, name: userName, ...userRestField }) => (
                <Card key={userKey} style={{ marginBottom: 16, background: '#fafafa' }} size="small">
                  <Row gutter={16} align="middle">
                    <Col flex="auto">
                      <Text strong>User {userKey + 1}</Text>
                    </Col>
                    <Col>
                      <MinusCircleOutlined style={{ color: 'red' }} onClick={() => removeUser(userName)} />
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...userRestField}
                        name={[userName, 'username']}
                        label="Username"
                        rules={[{ required: true, message: 'Username is required!' }]}
                      >
                        <Input placeholder="Username" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...userRestField}
                        name={[userName, 'firstName']}
                        label="First Name"
                        rules={[{ required: false, message: 'First Name is optional' }]}
                      >
                        <Input placeholder="First Name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...userRestField}
                        name={[userName, 'lastName']}
                        label="Last Name"
                      >
                        <Input placeholder="Last Name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...userRestField}
                        name={[userName, 'email']}
                        label="Email"
                        rules={[{ type: 'email', required: true, message: 'Please enter a valid email!' }]}
                      >
                        <Input placeholder="Email" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...userRestField}
                        name={[userName, 'phoneNumber']}
                        label="Phone Number"
                      >
                        <Input placeholder="Phone Number" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...userRestField}
                        name={[userName, 'password']}
                        label="Password"
                        rules={[{ required: true, message: 'Password is required!' }]}
                      >
                        <Input.Password placeholder="Password" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...userRestField}
                        name={[userName, 'role']}
                        label="Role"
                        rules={[{ required: true, message: 'Role is required!' }]}
                      >
                        <Select placeholder="Select Role">
                          {USER_ROLES.map(role => (
                            <Option key={role.id} value={role.id}>{role.name}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ))}
              <Button type="dashed" onClick={() => addUser(initialUserForm)} block icon={<PlusOutlined />}>
                Add Additional User
              </Button>
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default AddAdditionalUsersModal;
