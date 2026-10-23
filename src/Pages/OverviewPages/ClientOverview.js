import React, { useEffect, useState } from 'react';
import { Button, Table, Space, Spin, notification, Input, Dropdown } from 'antd';
import { PlusOutlined, MoreOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { APIService } from '../../config/Api/apiServices';
import OnboardClientModal from './OnboardClientModal';

const { Search } = Input;

const isSuperAdminUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return (
      user.role_text === 'SUPERADMIN' ||
      user.roles === 1 ||
      user.role === 1 ||
      user.roles?.id === 1 ||
      user.roles?.name === 'SUPERADMIN'
    );
  } catch {
    return false;
  }
};

const ClientOverview = () => {
  const isSuperAdmin = isSuperAdminUser();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [onboardClientId, setOnboardClientId] = useState(undefined);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const response = await APIService.get('/cadmin/clients');
        const data = response.data.results || response.data || [];
        const formattedClients = data.map((client, idx) => ({
          key: client.id || idx,
          name: client.name || client.client_name || client.username || '---',
          branches: client.number_of_branches || '---',
          clientType: client.client_type || '---',
          phone: client.phone_number || '---',
          email: client.email || '---',
          is_active: client.is_active,
        }));
        setClients(formattedClients);
        setFilteredClients(formattedClients);
      } catch (error) {
        notification.error({
          message: 'Error Fetching Clients',
          description: error?.response?.data?.message || error.message || 'Failed to load clients.'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    const searchLower = value.toLowerCase();
    const filtered = clients.filter(client => 
      client.name.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower)
    );
    setFilteredClients(filtered);
  };

  const handleViewClient = (clientId) => {
    navigate(`/client/${clientId}`);
  };
  const handleCreateSolar = (clientId) => {
    navigate('/solar-onboarding');
  };

  const handleSuspendClient = async (clientId, isActive) => {
    setLoading(true);
    try {
      await APIService.patch(`/api/v2/suspend_client/${clientId}/`, { is_active: isActive });
      notification.success({
        message: isActive ? 'Activate Client' : 'Suspend Client',
        description: isActive ? 'Client has been activated successfully.' : 'Client has been suspended successfully.'
      });
      // Refresh the client list
      const response = await APIService.get('/cadmin/clients');
      const data = response.data.results || response.data || [];
      const formattedClients = data.map((client, idx) => ({
        key: client.id || idx,
        name: client.name || client.client_name || client.username || '---',
        branches: client.number_of_branches || '---',
        clientType: client.client_type || '---',
        phone: client.phone_number || '---',
        email: client.email || '---',
        is_active: client.is_active,
      }));
      setClients(formattedClients);
      setFilteredClients(formattedClients);
    } catch (error) {
      notification.error({
        message: isActive ? 'Activate Client' : 'Suspend Client',
        description: error?.response?.data?.message || error.message || 'Failed to update client status.'
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Client Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Client Type',
      dataIndex: 'clientType',
      key: 'clientType',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Branches',
      dataIndex: 'branches',
      key: 'branches',
      align: 'center',
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      align: 'center',
      render: (is_active) => (
        is_active === false ? (
          <span style={{ color: 'red', fontWeight: 'bold' }}>Suspended</span>
        ) : (
          <span style={{ color: 'green', fontWeight: 'bold' }}>Active</span>
        )
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'View Client',
                onClick: () => handleViewClient(record.key)
              },
              ...(isSuperAdmin ? [{
                key: 'onboard',
                label: 'Send Onboarding Email',
                onClick: () => {
                  setOnboardClientId(record.key);
                  setOnboardModalOpen(true);
                }
              }] : []),
              {
                key: 'solar',
                label: 'Create Solar',
                onClick: () => handleCreateSolar(record.key)
              },
              {
                key: record.is_active ? 'suspend' : 'activate',
                label: record.is_active ? 'Suspend' : 'Activate',
                danger: record.is_active ? true : false,
                onClick: () => handleSuspendClient(record.key, !record.is_active)
              }
            ]
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const handleCreateClient = () => {
    navigate('/create-client');
  };

  return (
    <div style={{ margin: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Client</h2>
        <Space>
          {isSuperAdmin ? (
            <Button
              icon={<MailOutlined />}
              style={{ color: '#5C12A7', borderColor: '#5C12A7' }}
              onClick={() => {
                setOnboardClientId(undefined);
                setOnboardModalOpen(true);
              }}
            >
              Send Onboarding Email
            </Button>
          ) : null}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{background: "#5C12A7"}}
            onClick={handleCreateClient}
          >
            Create Client
          </Button>
        </Space>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <Search
          placeholder="Search by client name or email"
          allowClear
          size="large"
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ maxWidth: 500 }}
        />
      </div>
      <Spin spinning={loading}
        // style={{ color: "#5C12A7" }}
        // color="#5C12A7"
        tip="Loading clients...">
        <Table 
          dataSource={filteredClients}
          columns={columns} 
          pagination={{ 
            pageSize: 10,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} clients`
          }} 
        />
      </Spin>
      <OnboardClientModal
        open={onboardModalOpen}
        clients={clients}
        initialClientId={onboardClientId}
        onClose={() => {
          setOnboardModalOpen(false);
          setOnboardClientId(undefined);
        }}
      />
    </div>
  );
}

export default ClientOverview;
