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
import { useNavigate } from 'react-router-dom';
import {
  fetchSolarStations,
  fetchSolarBranches,
  searchSolarStation,
  clearSolarStationSearch,
  saveSolarStation,
  toggleSolarStationStatus,
} from '../../redux/actions/solar/solar.action';

const { Title } = Typography;


const SolarOnboarding = ({
  solar: {
    stations,
    stationsLoading,
    stationsError,
    branches,
    branchesLoading,
    branchesError,
    searchStationLoading,
    searchedStation,
    searchedDevices = [],
    saveStationLoading,
    toggleStationStatusLoadingId,
  },
  fetchSolarStations: fetchStationsAction,
  fetchSolarBranches: fetchBranchesAction,
  searchSolarStation: searchStationAction,
  clearSolarStationSearch: clearSearchAction,
  saveSolarStation: saveStationAction,
  toggleSolarStationStatus: toggleStationStatusAction,
}) => {
  const [form] = Form.useForm();
  const [showDeviceDetails, setShowDeviceDetails] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchFilters, setSearchFilters] = useState({ searchText: '', branch_id: undefined });
  const [deviceSearchText, setDeviceSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStationsAction();
    fetchBranchesAction();
  }, [fetchBranchesAction, fetchStationsAction]);

  useEffect(() => {
    if (stationsError) {
      notification.warning({
        message: 'Warning',
        description: stationsError,
      });
    }
  }, [stationsError]);

  useEffect(() => {
    if (branchesError) {
      notification.warning({
        message: 'Warning',
        description: branchesError,
      });
    }
  }, [branchesError]);

  useEffect(() => {
    if (searchedStation && showDeviceDetails) {
      form.setFieldsValue(searchedStation);
    }
  }, [form, searchedStation, showDeviceDetails]);

  const handleSearchDevice = async (values) => {
    const { station_id, product_name } = values;
    if (!station_id || !product_name) {
      notification.warning({
        message: 'Validation Error',
        description: 'Please fill in both Station ID and Product Name.',
      });
      return;
    }

    try {
      setSearching(true);
      const result = await searchStationAction({ station_id, product_name });
      if (result?.fulfilled) {
        const isNew = result?.data?.isNew;
        form.setFieldsValue(result?.data?.station || {});
        setShowDeviceDetails(true);
        setDeviceSearchText('');

        notification[isNew ? 'info' : 'success']({
          message: isNew ? 'New Station' : 'Station Found',
          description: isNew ? 'Please fill in the station details below.' : 'Station details loaded successfully.',
        });
      } else {
        notification.error({
          message: 'Error',
          description: result?.message || 'Could not load station.',
        });
      }
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

    try {
      const selectedBranch = branches.find((b) => String(b.id) === String(values.branch_id));
      const branch_name = selectedBranch?.name || values.branch_name || '';
      const payload = {
        branch_id: values.branch_id,
        branch_name,
        product_name: values.product_name,
        station_id: values.station_id,
        installed_battery_capacity: values.installed_battery_capacity || 0,
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
        devices: Array.isArray(searchedDevices) ? searchedDevices : [],
        device_count: Array.isArray(searchedDevices) ? searchedDevices.length : 0,
      };

      const result = await saveStationAction(payload);
      if (result?.fulfilled) {
        notification.success({
          message: 'Success',
          description: 'Station details saved successfully.',
        });
        fetchStationsAction();
      } else {
        notification.error({
          message: 'Error',
          description: result?.message || 'Failed to save station details. Please try again.',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error?.message || 'Failed to save station details. Please try again.',
      });
    }
  };

  const handleToggleStationStatus = async (station) => {
    const branchIdentifier = station?.branch ?? station?.branch_id;
    if (!branchIdentifier) {
      notification.error({
        message: 'Error',
        description: 'Branch ID is missing for this station.',
      });
      return;
    }

    const result = await toggleStationStatusAction(station);
    if (result?.fulfilled) {
      notification.success({
        message: 'Success',
        description: result?.message || 'Station status updated successfully.',
      });
      fetchStationsAction();
    } else {
      notification.error({
        message: 'Error',
        description: result?.message || 'Failed to toggle station status. Please try again.',
      });
    }
  };

  const handleBack = () => {
    if (showDeviceDetails) {
      setShowDeviceDetails(false);
      form.resetFields();
      setDeviceSearchText('');
      clearSearchAction();
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
            loading={saveStationLoading}
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
                  loading={searching || searchStationLoading}
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
                (stations || []).filter((station) => {
                  const searchText = searchFilters?.searchText?.toLowerCase() || '';
                  const textMatch = searchText
                    ? (
                        (station.name || '').toLowerCase().includes(searchText) ||
                        (station.deye_station_id || '').toLowerCase().includes(searchText) ||
                        (station.address || '').toLowerCase().includes(searchText)
                      )
                    : true;
                  const branchMatch = searchFilters?.branch_id
                    ? String(station.branch) === String(searchFilters.branch_id) ||
                      String(station.branch_id) === String(searchFilters.branch_id)
                    : true;
                  return textMatch && branchMatch;
                })
              }
              columns={[
                { title: 'Station ID', dataIndex: 'deye_station_id', key: 'deye_station_id' },
                { title: 'Name', dataIndex: 'name', key: 'name' },
                { title: 'Branch', dataIndex: 'branch_name', key: 'branch_name' },
                { title: 'Installed Battery Capacity', dataIndex: 'installed_battery_capacity', key: 'installed_battery_capacity' },
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
                    const loadingKey = record.id ?? record.branch ?? record.branch_id;
                    const isToggling = toggleStationStatusLoadingId === loadingKey;
                    const isActive = record.is_active;
                    return (
                      <Button
                        variant="solid"
                        color={isActive ? 'danger' : 'primary'}
                        danger={isActive}
                        loading={isToggling}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleToggleStationStatus(record);
                        }}
                        disabled={isToggling}
                      >
                        {isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    );
                  },
                },
              ]}
              rowKey={(record) => record.id || record.deye_station_id}
              loading={stationsLoading}
              pagination={{ pageSize: 10 }}
              onRow={(record) => {
                const branchIdentifier = record?.branch ?? record?.branch_id;
                return {
                  onClick: () => {
                    if (!branchIdentifier) {
                      notification.warning({
                        message: 'Branch Missing',
                        description: 'Branch information is required to view station details.',
                      });
                      return;
                    }
                    navigate(`/solar-onboarding/stations/${branchIdentifier}`, {
                      state: {
                        stationId: record?.id,
                        station: record,
                      },
                    });
                  },
                  style: { cursor: 'pointer' },
                };
              }}
            />
          </Card>
        </>
      ) : (
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
                  label="Installed Battery Capacity"
                  name="installed_battery_capacity"
                >
                  <InputNumber
                    placeholder="Enter Installed Battery Capacity"
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
                searchedDevices.filter((device) => {
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
  solar: state.solar,
});

const mapDispatchToProps = {
  fetchSolarStations,
  fetchSolarBranches,
  searchSolarStation,
  clearSolarStationSearch,
  saveSolarStation,
  toggleSolarStationStatus,
};

export default connect(mapStateToProps, mapDispatchToProps)(SolarOnboarding);