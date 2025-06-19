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
  const [actionLoading, setActionLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchLoading, setBranchLoading] = useState(false);

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const response = await APIService.get(`/api/v1/accounts/view-update-client/${clientId}/`);
        setClient(response.data.client);
      } catch (error) {
        notification.error({
          message: 'Error',
          description: 'Failed to load client details'
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchBranches = async () => {
      setBranchLoading(true);
      try {
        const response = await APIService.get(`/api/v1/accounts/client/${clientId}/branches/`);
        setBranches(response.data.branches || []);
      } catch (error) {
        notification.error({
          message: 'Error',
          description: 'Failed to load branches'
        });
      } finally {
        setBranchLoading(false);
      }
    };

    fetchClientDetails();
    fetchBranches();
  }, [clientId]);

  const handleSuspendClient = async () => {
    if (!client) return;
    setActionLoading(true);
    try {
      await APIService.suspendClient(client.id, !client.is_active);
      notification.success({
        message: client.is_active ? 'Suspend Client' : 'Activate Client',
        description: client.is_active ? 'Client has been suspended successfully.' : 'Client has been activated successfully.'
      });
      // Refresh client details
      const response = await APIService.get(`/api/v1/accounts/view-update-client/${client.id}/`);
      setClient(response.data.client);
    } catch (error) {
      notification.error({
        message: client.is_active ? 'Suspend Client' : 'Activate Client',
        description: error?.response?.data?.message || error.message || 'Failed to update client status.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLoginAsClient = async () => {
    if (!client) return;
    try {
      await APIService.forceLoginClientAdmin(client.id);
      notification.success({
        message: 'Login as Client',
        description: 'You have been logged in as the client admin.'
      });
      // Optionally, redirect or handle the response here
    } catch (error) {
      notification.error({
        message: 'Login as Client',
        description: error?.response?.data?.message || error.message || 'Failed to login as client.'
      });
    }
  };

  const handleEditSection = (section) => {
    // TODO: Implement edit functionality for each section
    notification.info({
      message: 'Edit Section',
      description: `Edit functionality for ${section} to be implemented`
    });
  };

  const handleSuspendBranch = async (branchId, isActive) => {
    setBranchLoading(true);
    try {
      await APIService.suspendBranch(branchId, isActive);
      notification.success({
        message: isActive ? 'Activate Branch' : 'Suspend Branch',
        description: isActive ? 'Branch has been activated successfully.' : 'Branch has been suspended successfully.'
      });
      // Refresh branches
      const response = await APIService.get(`/api/v1/accounts/client/${clientId}/branches/`);
      setBranches(response.data.branches || []);
    } catch (error) {
      notification.error({
        message: isActive ? 'Activate Branch' : 'Suspend Branch',
        description: error?.response?.data?.message || error.message || 'Failed to update branch status.'
      });
    } finally {
      setBranchLoading(false);
    }
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
      title: 'Status',
      dataIndex: 'Is_active',
      key: 'Is_active',
      render: (isActive) => (
        isActive === false ? (
          <span style={{ color: 'red', fontWeight: 'bold' }}>Suspended</span>
        ) : (
          <span style={{ color: 'green', fontWeight: 'bold' }}>Active</span>
        )
      ),
    },
    {
      title: 'Devices',
      dataIndex: 'devices',
      key: 'devices',
      render: (devices) => (
        devices && devices.length > 0
          ? devices.map(device => device.device_name || device.name).join(', ')
          : '---'
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          danger={record.Is_active}
          size="small"
          loading={branchLoading}
          onClick={() => handleSuspendBranch(record.branch_id, !record.Is_active)}
        >
          {record.Is_active ? 'Suspend' : 'Activate'}
        </Button>
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
            danger={client?.is_active}
            loading={actionLoading}
            onClick={handleSuspendClient}
          >
            {client?.is_active ? 'Suspend Client' : 'Activate Client'}
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
            <div>{client?.name || '---'}</div>
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
          <Col xs={24} sm={12} md={8}>
            <Text strong>Region:</Text>
            <div>{client?.region || '---'}</div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Text strong>Status:</Text>
            <div>
              {client?.is_active === false ? (
                <span style={{ color: 'red', fontWeight: 'bold' }}>Suspended</span>
              ) : (
                <span style={{ color: 'green', fontWeight: 'bold' }}>Active</span>
              )}
            </div>
          </Col>
          <Col xs={24}>
            <Text strong>Additional Emails:</Text>
            <div>
              {client?.additional_emails?.length > 0 ? (
                client.additional_emails.join(', ')
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
          dataSource={branches} 
          columns={branchColumns}
          rowKey="branch_id"
          pagination={false}
          loading={branchLoading}
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