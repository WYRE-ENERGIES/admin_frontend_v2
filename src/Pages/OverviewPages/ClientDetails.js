import React, { useEffect, useState, useCallback } from 'react';
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
import EnvData from '../../config/EnvData';
import EditClientModal from './EditClientModal';
import EditBranchModal from './EditBranchModal';
import EditMainUserModal from './EditMainUserModal';
import EditAdditionalUsersModal from './EditAdditionalUsersModal';

const { Title, Text } = Typography;

const ClientDetails = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchLoading, setBranchLoading] = useState(false);
  const [regions, setRegions] = useState([]);

  // Modal states
  const [editingSection, setEditingSection] = useState(null);
  const [editingBranch, setEditingBranch] = useState(null);

  const fetchClientDetails = useCallback(async () => {
    setLoading(true);
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
  }, [clientId]);

  const fetchBranches = useCallback(async () => {
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
  }, [clientId]);

  useEffect(() => {
    fetchClientDetails();
    fetchBranches();

    const fetchRegions = async () => {
      try {
        const response = await APIService.get(`/api/v1/accounts/client/${clientId}/regions/`);
        setRegions(response.data.regions || []);
      } catch (error) {
        notification.error({
          message: 'Error',
          description: 'Failed to load client regions'
        });
      }
    };
    fetchRegions();
  }, [clientId, fetchClientDetails, fetchBranches]);

  const handleSuspendClient = async () => {
    if (!client) return;
    setActionLoading(true);
    try {
      await APIService.suspendClient(client.id, !client.is_active);
      notification.success({
        message: client.is_active ? 'Suspend Client' : 'Activate Client',
        description: client.is_active ? 'Client has been suspended successfully.' : 'Client has been activated successfully.'
      });
      fetchClientDetails();
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
      const response = await APIService.forceLoginClientAdmin(client.id);
      const tokenData = response.data?.data?.token;
      const userData = response.data?.data;
      if (tokenData?.access && tokenData?.refresh) {
        // Open /force-login in a new tab with tokens and user info as query params
        const params = new URLSearchParams({
          access: tokenData.access,
          refresh: tokenData.refresh,
          username: userData.username,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
        });
        window.open(`/force-login?${params.toString()}`, '_blank');
        notification.success({
          message: 'Login as Client',
          description: 'A new tab has been opened for the client admin.'
        });
      } else {
        notification.error({
          message: 'Login as Client',
          description: 'Login succeeded but no access token was provided.'
        });
      }
    } catch (error) {
      notification.error({
        message: 'Login as Client',
        description: error?.response?.data?.message || error.message || 'Failed to login as client.'
      });
    }
  };

  const handleClientUpdated = () => {
    setEditingSection(null);
    fetchClientDetails();
  };

  const handleBranchUpdated = () => {
    setEditingBranch(null);
    fetchBranches();
  };

  const handleSuspendBranch = async (branchId, isActive) => {
    setBranchLoading(true);
    try {
      await APIService.suspendBranch(branchId, isActive);
      notification.success({
        message: isActive ? 'Activate Branch' : 'Suspend Branch',
        description: isActive ? 'Branch has been activated successfully.' : 'Branch has been suspended successfully.'
      });
      fetchBranches();
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
        <Space>
          <Button
            type="primary"
            danger={record.Is_active}
            size="small"
            onClick={() => handleSuspendBranch(record.branch_id, !record.Is_active)}
          >
            {record.Is_active ? 'Suspend' : 'Activate'}
          </Button>
          <Button size="small" onClick={() => setEditingBranch(record)}>
            Edit
          </Button>
        </Space>
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
        extra={<Button type="text" icon={<EditOutlined />} onClick={() => setEditingSection('client')}>Edit</Button>}
        style={{ marginBottom: '20px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Text strong>Logo:</Text>
            <div>
              {client?.logo ? (
                <img 
                  src={`${EnvData.REACT_APP_API_URL}${client.logo}`} 
                  alt="Client Logo" 
                  style={{ maxHeight: 60, maxWidth: 120, objectFit: 'contain' }} 
                />
              ) : (
                <img 
                  src="https://placeholdit.com/400x400/dddddd/999999?text=Add+Logo" 
                  alt="Default Logo" 
                  style={{ maxHeight: 60, maxWidth: 120, objectFit: 'contain' }} 
                />
              )}
            </div>
          </Col>
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
            <div>
              {regions.length > 0
                ? regions.map(r => r.region).join(', ')
                : '---'}
            </div>
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
        extra={<Button type="text" icon={<EditOutlined />} onClick={() => setEditingSection('mainUser')}>Edit</Button>}
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
        // extra={<Button type="text" icon={<EditOutlined />} onClick={() => setEditingSection('branches')}>Edit</Button>}
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
        extra={<Button type="text" icon={<EditOutlined />} onClick={() => setEditingSection('additionalUsers')}>Edit</Button>}
      >
        <Table 
          dataSource={client?.additional_users || []} 
          columns={userColumns}
          rowKey="username"
          pagination={false}
        />
      </Card>

      <EditClientModal
        visible={editingSection === 'client'}
        onCancel={() => setEditingSection(null)}
        client={client}
        onClientUpdated={handleClientUpdated}
      />
      <EditMainUserModal
        visible={editingSection === 'mainUser'}
        onCancel={() => setEditingSection(null)}
        user={client?.main_user}
      />
      <EditAdditionalUsersModal
        visible={editingSection === 'additionalUsers'}
        onCancel={() => setEditingSection(null)}
        users={client?.additional_users}
      />
      <EditBranchModal
        visible={!!editingBranch}
        clientId={client.id}
        onCancel={() => setEditingBranch(null)}
        branch={editingBranch}
        onBranchUpdated={handleBranchUpdated}
      />
    </div>
  );
};

export default ClientDetails;