import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  notification,
  Typography,
  Table,
  InputNumber,
  Select,
  
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { APIService } from '../../config/Api/apiServices';

const { Title } = Typography;


const SolarOnboarding = (props) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [showDeviceDetails, setShowDeviceDetails] = useState(false);
  const [devices, setDevices] = useState([]);
  const [searching, setSearching] = useState(false);
  const [stations, setStations] = useState([]);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState({ searchText: '', branch_id: undefined });
  const [togglingStationId, setTogglingStationId] = useState(null);
  const [deviceSearchText, setDeviceSearchText] = useState('');

  const fetchStations = async () => {
    setStationsLoading(true);
    try {
      const resp = await APIService.get('/api/v1/solar/stations/all/');
      const data = resp?.data || {};
      const list = Array.isArray(data.stations) ? data.stations : [];
      setStations(list.length ? list : []);
    } catch (error) {
      console.error('Failed to fetch stations:', error);
      notification.warning({
        message: 'Warning',
        description: 'Could not load stations list.',
      });
      setStations([]);
    } finally {
      setStationsLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchBranches = async () => {
      setBranchesLoading(true);
      try {
        const resp = await APIService.get('/cadmin/branches/');
        const branches = Array.isArray(resp?.data)
          ? resp.data.map(({ id, name }) => ({ id, name })) : [];
        setBranches(branches);
      } catch (error) {
        console.error('Failed to fetch branches:', error);
        setBranches([]);
      } finally {
        setBranchesLoading(false);
      }
    };
    fetchBranches();
  }, []);

  const handleSearchDevice = async (values) => {
    const { station_id, product_name } = values;
    if (!station_id || !product_name) {
      notification.warning({
        message: 'Validation Error',
        description: 'Please fill in both Station ID and Product Name.',
      });
      return;
    }

    setSearching(true);
    try {
      const response = await APIService.get(`/api/v1/solar/stations/${product_name}/${station_id}/`);
      const data = response?.data || {};

      if (data?.error) {
        notification.error({
          message: 'Error',
          description: data.error,
        });
        return;
      }

      const stationInfo = data.station_info || {};
      const station = {
        product_name: data.product_name || product_name,
        station_id: data.station_id || station_id,
        branch_id: data.branch_id || null,
        name: stationInfo.name || '',
        installed_capacity: stationInfo.installed_capacity || 0,
        latitude: stationInfo.latitude || null,
        longitude: stationInfo.longitude || null,
        address: stationInfo.address || '',
        region: stationInfo.region || '',
        currency: stationInfo.currency || '',
        create_time: stationInfo.create_time || null,
      };

      setDevices(Array.isArray(data.devices) ? data.devices : []);
      setDeviceSearchText('');

      form.setFieldsValue(station);
        setShowDeviceDetails(true);
        notification.success({
        message: 'Station Found',
        description: 'Station details loaded successfully.',
      });
    } catch (error) {
      const apiError = error?.response?.data?.error || error?.response?.data?.detail || error?.message;
      if (apiError) {
        notification.error({
          message: 'Error',
          description: apiError,
        });
        return;
      }
      const station = {
        product_name,
        station_id,
        name: '',
        installed_capacity: 0,
        latitude: null,
        longitude: null,
        address: '',
        region: '',
        currency: '',
        create_time: null,
      };
      setDevices([]);
      setDeviceSearchText('');
      form.setFieldsValue(station);
      setShowDeviceDetails(true);
      notification.info({
        message: 'New Station',
        description: 'Please fill in the station details below.',
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSave = async (values) => {
    if (!values || !values.station_id || !values.product_name) {
      notification.error({
        message: 'Error',
        description: 'Station data not found. Please search for a station first.',
      });
      return;
    }

    if (!values.branch_id) {
      notification.error({
        message: 'Error',
        description: 'Please select a branch for this station.',
      });
      return;
    }

    setSaving(true);
    try {
      const selectedBranch = branches.find((b) => String(b.id) === String(values.branch_id));
      const branch_name = selectedBranch?.name || values.branch_name || '';
      const payload = {
        branch_id: values.branch_id,
        branch_name,
        product_name: values.product_name,
        station_id: values.station_id,
        station_info: {
          name: values.name || '',
          installed_capacity: values.installed_capacity || 0,
          latitude: values.latitude ?? null,
          longitude: values.longitude ?? null,
          address: values.address || '',
          region: values.region || '',
          currency: values.currency || '',
          create_time: values.create_time || null,
        },
        devices: Array.isArray(devices) ? devices : [],
        device_count: Array.isArray(devices) ? devices.length : 0,
      };

      await APIService.post(`/api/v1/solar/branch/${payload.branch_id}/`, payload);
      
      notification.success({
        message: 'Success',
        description: 'Station details saved successfully.',
      });
    } catch (error) {
      console.error('Save error:', error);
      notification.error({
        message: 'Error',
        description: error?.response?.data?.message || error?.response?.data?.detail || error.message || 'Failed to save station details. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStationStatus = async (stationId) => {
    if (!stationId) {
      notification.error({
        message: 'Error',
        description: 'Station ID is missing.',
      });
      return;
    }

    setTogglingStationId(stationId);
    try {
      const response = await APIService.post(`/api/v1/solar/stations/${stationId}/toggle-status/`);
      const data = response?.data || {};

      if (data.station) {
        // Update the station in the local state
        setStations((prevStations) =>
          prevStations.map((station) =>
            station.id === stationId || station.id === data.station.id
              ? { ...station, ...data.station, is_active: data.current_status }
              : station
          )
        );

        notification.success({
          message: 'Success',
          description: data.message || `Station ${data.current_status ? 'activated' : 'deactivated'} successfully.`,
        });
      } else {
        notification.error({
          message: 'Error',
          description: 'Failed to update station status. Please try again.',
        });
      }
    } catch (error) {
      console.error('Toggle station status error:', error);
      notification.error({
        message: 'Error',
        description: error?.response?.data?.message || error?.response?.data?.detail || error.message || 'Failed to toggle station status. Please try again.',
      });
    } finally {
      setTogglingStationId(null);
    }
  };

  const handleBack = () => {
    if (showDeviceDetails) {
      setShowDeviceDetails(false);
      form.resetFields();
      setDeviceSearchText('');
    }
  };

  const deviceColumns = [
    {
      title: 'Device SN',
      dataIndex: 'device_sn',
      key: 'device_sn',
    },
    {
      title: 'Device Type',
      dataIndex: 'device_type',
      key: 'device_type',
    },
    {
      title: 'Device ID',
      dataIndex: 'device_id',
      key: 'device_id',
    },
    {
      title: 'Product ID',
      dataIndex: 'product_id',
      key: 'product_id',
    },
    {
      title: 'Connection Status',
      dataIndex: 'connect_status',
      key: 'connect_status',
      render: (value) => (
        <span style={{ color: Number(value) === 1 ? 'green' : 'red', fontWeight: 'bold' }}>
          {Number(value) === 1 ? 'Connected' : 'Disconnected'}
        </span>
      ),
    },
    {
      title: 'Collection Time',
      dataIndex: 'collection_time',
      key: 'collection_time',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{ 
          color: status === 'online' ? 'green' : 'red',
          fontWeight: 'bold' 
        }}>
          {status || 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <div style={{ margin: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Title level={3} style={{ margin: 0 }}>
            {showDeviceDetails ? 'Solar Station Details' : 'Solar Onboarding'}
          </Title>
        </div>
        {showDeviceDetails && (
          <Button
            type="primary"
            htmlType="submit"
            form="station-details-form"
            loading={saving}
            icon={<SaveOutlined />}
            style={{ background: '#5C12A7' }}
          >
            Save
          </Button>
        )}
      </div>

      {!showDeviceDetails ? (
        <>
          {/* Initial Form: Station ID and Product Name */}
          <Card title="Onboard Station" style={{ marginBottom: '20px' }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSearchDevice}
              autoComplete="off"
            >
              <Form.Item
                label="Station ID"
                name="station_id"
                rules={[{ required: true, message: 'Station ID is required!' }]}
              >
                <Input placeholder="Enter Station ID" size="large" />
              </Form.Item>

              <Form.Item
                label="Product Name"
                name="product_name"
                rules={[{ required: true, message: 'Product Name is required!' }]}
              >
                <Select
                  placeholder="Select Product Name"
                  size="large"
                  options={[
                    { label: 'Deye', value: 'deye' },
                  ]}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={searching}
                  size="large"
                  block
                  style={{ background: '#5C12A7', width: 'max-content' }}
                >
                  {searching ? 'Searching...' : 'Proceed'}
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title="All Stations">
            <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <Input.Search
                placeholder="Search by Name, Station ID, or Address"
                allowClear
                onSearch={(value) => {
                  setSearchFilters((prev) => ({ ...prev, searchText: value }));
                }}
                onChange={e =>
                  setSearchFilters((prev) => ({ ...prev, searchText: e.target.value }))
                }
                style={{ width: 300 }}
                value={searchFilters?.searchText || ''}
                enterButton
              />
              <Select
                placeholder="Filter by Branch"
                allowClear
                style={{ width: 200 }}
                loading={branchesLoading}
                value={searchFilters?.branch_id || undefined}
                onChange={(value) =>
                  setSearchFilters((prev) => ({ ...prev, branch_id: value }))
                }
                options={[
                  ...branches.map((b) => ({ label: b.name, value: b.id }))
                ]}
                showSearch
                optionFilterProp="label"
              />
              <Button
                onClick={() => setSearchFilters({ searchText: '', branch_id: undefined })}
                disabled={!searchFilters?.searchText && !searchFilters?.branch_id}
              >
                Reset Filters
              </Button>
            </div>
            <Table
              dataSource={
                stations.filter((station) => {
                  const searchText = searchFilters?.searchText?.toLowerCase() || '';
                  const textMatch = searchText
                    ? (
                        (station.name || '').toLowerCase().includes(searchText) ||
                        (station.deye_station_id || '').toLowerCase().includes(searchText) ||
                        (station.address || '').toLowerCase().includes(searchText)
                      )
                    : true;
                  const branchMatch = searchFilters?.branch_id
                    ? String(station.branch_id) === String(searchFilters.branch_id) ||
                      String(station.branch) === String(searchFilters.branch_id)
                    : true;
                  return textMatch && branchMatch;
                })
              }
              columns={[
                { title: 'Station ID', dataIndex: 'deye_station_id', key: 'deye_station_id' },
                { title: 'Name', dataIndex: 'name', key: 'name' },
                { title: 'Branch', dataIndex: 'branch_name', key: 'branch_name' },
                { title: 'Installed Capacity (kWp)', dataIndex: 'installed_capacity', key: 'installed_capacity' },
                {
                  title: 'Active',
                  dataIndex: 'is_active',
                  key: 'is_active',
                  render: (val) => (
                    <span style={{ color: val ? 'green' : 'red', fontWeight: 'bold' }}>{val ? 'Yes' : 'No'}</span>
                  ),
                },
                { title: 'Address', dataIndex: 'address', key: 'address' },
                { title: 'Latitude', dataIndex: 'latitude', key: 'latitude' },
                { title: 'Longitude', dataIndex: 'longitude', key: 'longitude' },
                { title: 'Created At', dataIndex: 'created_at', key: 'created_at' },
                {
                  title: 'Action',
                  key: 'action',
                  render: (_, record) => {
                    const isToggling = togglingStationId === record.id;
                    const isActive = record.is_active;
                    return (
                      <Button
                        variant="solid"
                        color={isActive ? 'danger' : 'primary'}
                        danger={isActive}
                        loading={isToggling}
                        onClick={() => handleToggleStationStatus(record.id)}
                        disabled={isToggling}
                      >
                        {isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    );
                  },
                },
              ]}
              rowKey="id"
              loading={stationsLoading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </>
      ) : (
        // Station Details Form (Editable)
        <Card title="Station Information">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            autoComplete="off"
            id="station-details-form"
          >
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Product Name"
                  name="product_name"
                  rules={[{ required: true, message: 'Station ID is required!' }]}
                >
                  <Input placeholder="Enter Product Name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Station ID"
                  name="station_id"
                  rules={[{ required: true, message: 'Station ID is required!' }]}
                >
                  <Input placeholder="Enter Station ID" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Name"
                  name="name"
                >
                  <Input placeholder="Enter Station Name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Branch"
                  name="branch_id"
                  rules={[{ required: true, message: 'Branch is required!' }]}
                >
                  <Select
                    placeholder="Select Branch"
                    loading={branchesLoading}
                    options={branches.map((b) => ({ label: b.name, value: b.id }))}
                    showSearch
                    optionFilterProp="label"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Installed Capacity (kWp)"
                  name="installed_capacity"
                >
                  <InputNumber
                    placeholder="Enter Capacity"
                    style={{ width: '100%' }}
                    min={0}
                    step={0.1}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Latitude"
                  name="latitude"
                >
                  <InputNumber style={{ width: '100%' }} step={0.000001} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Longitude"
                  name="longitude"
                >
                  <InputNumber style={{ width: '100%' }} step={0.000001} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  label="Address"
                  name="address"
                >
                  <Input placeholder="Enter Address" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Region"
                  name="region"
                >
                  <Input placeholder="Enter Region" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Currency"
                  name="currency"
                >
                  <Input placeholder="Enter Currency" />
                </Form.Item>
              </Col>
            </Row>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-start', gap: '8px' }}>
              <Button onClick={handleBack}>Back</Button>
            </div>
          </Form>
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>Devices</Title>
              <Input.Search
                placeholder="Search by Device SN, Device ID, Type, or Product ID"
                allowClear
                onSearch={(value) => {
                  setDeviceSearchText(value);
                }}
                onChange={e =>
                  setDeviceSearchText(e.target.value)
                }
                style={{ width: 350 }}
                value={deviceSearchText}
                enterButton
              />
            </div>
            <Table
              dataSource={
                devices.filter((device) => {
                  const searchText = deviceSearchText?.toLowerCase() || '';
                  if (!searchText) return true;
                  return (
                    String(device.device_sn || '').toLowerCase().includes(searchText) ||
                    String(device.device_id || '').toLowerCase().includes(searchText) ||
                    String(device.device_type || '').toLowerCase().includes(searchText) ||
                    String(device.product_id || '').toLowerCase().includes(searchText) ||
                    String(device.status || '').toLowerCase().includes(searchText)
                  );
                })
              }
              columns={deviceColumns}
              rowKey="device_id"
              pagination={{ pageSize: 10 }}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(SolarOnboarding);