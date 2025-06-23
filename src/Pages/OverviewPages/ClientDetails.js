import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Descriptions, 
  Spin, 
  notification, 
  Space, 
  Typography, 
  Divider,
  Row,
  Col,
  Table
} from 'antd';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { APIService } from '../../config/Api/apiServices';

const { Title, Text } = Typography;

const ClientDetails = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const response = await APIService.get(`/cadmin/clients/${clientId}`);
        setClient(response.data);
      } catch (error) {
        notification.error({
          message: 'Error',
          description: 'Failed to load client details'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [clientId]);

  const handleSuspendClient = () => {
    // TODO: Implement suspend client functionality
    notification.warning({
      message: 'Suspend Client',
      description: 'Client suspension functionality to be implemented'
    });
  };

  const handleLoginAsClient = () => {
    // TODO: Implement login as client functionality
    notification.info({
      message: 'Login as Client',
      description: 'Login as client functionality to be implemented'
    });
  };

  const handleEditSection = (section) => {
    // TODO: Implement edit functionality for each section
    notification.info({
      message: 'Edit Section',
      description: `Edit functionality for ${section} to be implemented`
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading client details..." />
      </div>
    );
  }

  // Branch and Device columns for the table
  const branchColumns = [
    {
      title: 'Branch Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Devices',
      dataIndex: 'devices',
      key: 'devices',
      render: (devices) => (
        <ul style={{ padding: 0, margin: 0 }}>
          {devices?.map((device, index) => (
            <li key={index}>
              {device.name} ({device.type}) - {device.provider}
              {device.type === 1 && ` - ${device.gen_size}kVA (${device.fuel_type})`}
            </li>
          ))}
        </ul>
      ),
    },
  ];

  // Additional Users columns
  const userColumns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => `${record.first_name || ''} ${record.last_name || ''}`.trim() || '---',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone_number',
      key: 'phone_number',
    },
    {
      title: 'Role',
      dataIndex: 'roles',
      key: 'roles',
    },
  ];

  return (
    <div style={{ margin: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: "wrap" }}>
       <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/clients')}
            style={{ padding: 0, height: 'auto' }}
          />
          <h2 style={{ margin: 0 }}>Client Details</h2>
        </div>
        <Space>
          <Button 
            type="primary" 
            danger
            onClick={handleSuspendClient}
          >
            Suspend Client
          </Button>
          <Button 
            type="primary"
            style={{ background: '#5C12A7' }}
            onClick={handleLoginAsClient}
          >
            Login as Client
          </Button>
        </Space>
      </div>

      {/* Client Information Section */}
      <Card 
        title="Client Information" 
        extra={
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditSection('client')}
          >
            Edit
          </Button>
        }
        style={{ marginBottom: '20px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Text strong>Client Name:</Text>
            <div>{client?.name || client?.client_name || '---'}</div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Text strong>Client Type:</Text>
            <div>{client?.client_type || '---'}</div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Text strong>Phone Number:</Text>
            <div>{client?.phone_number || '---'}</div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Text strong>Email:</Text>
            <div>{client?.email || '---'}</div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Text strong>Address:</Text>
            <div>{client?.address || '---'}</div>
          </Col>
          <Col xs={24}>
            <Text strong>Additional Emails:</Text>
            <div>
              {client?.additional_emails?.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {client.additional_emails.map((email, index) => (
                    <li key={index}>{email}</li>
                  ))}
                </ul>
              ) : '---'}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Main User Section */}
      <Card 
        title="Main User (Client Admin)" 
        extra={
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditSection('mainUser')}
          >
            Edit
          </Button>
        }
        style={{ marginBottom: '20px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Text strong>Username:</Text>
            <div>{client?.main_user?.username || '---'}</div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Text strong>Name:</Text>
            <div>{`${client?.main_user?.first_name || ''} ${client?.main_user?.last_name || ''}`.trim() || '---'}</div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Text strong>Email:</Text>
            <div>{client?.main_user?.email || '---'}</div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Text strong>Phone Number:</Text>
            <div>{client?.main_user?.phone_number || '---'}</div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Text strong>Role:</Text>
            <div>Client Admin</div>
          </Col>
        </Row>
      </Card>

      {/* Branches & Devices Section */}
      <Card 
        title="Branches & Devices" 
        extra={
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditSection('branches')}
          >
            Edit
          </Button>
        }
        style={{ marginBottom: '20px' }}
      >
        <Table 
          dataSource={client?.branches || []} 
          columns={branchColumns}
          rowKey="name"
          pagination={false}
        />
      </Card>

      {/* Additional Users Section */}
      <Card 
        title="Additional Users" 
        extra={
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditSection('additionalUsers')}
          >
            Edit
          </Button>
        }
      >
        <Table 
          dataSource={client?.additional_users || []} 
          columns={userColumns}
          rowKey="username"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default ClientDetails;