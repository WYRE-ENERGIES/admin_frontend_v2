import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  Row,
  Col,
  notification,
  Typography,
  Table,
  Space,
  InputNumber,
  Switch,
  Modal,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined, EditOutlined, PlusOutlined, BulbOutlined } from '@ant-design/icons';
import { APIService } from '../../config/Api/apiServices';

const { Title, Text } = Typography;
const { Option } = Select;

const DEVICE_TYPES = ['BATTERY', 'INVERTER', 'SOLAR_PANEL', 'CHARGE_CONTROLLER', 'OTHER'];
const DEVICE_STATUS = ['online', 'offline', 'maintenance', 'error'];

const SolarOnboarding = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeviceDetails, setShowDeviceDetails] = useState(false);
  const [deviceData, setDeviceData] = useState(null);
  const [editingDevice, setEditingDevice] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isToggleModalVisible, setIsToggleModalVisible] = useState(false);
  const [togglingDevice, setTogglingDevice] = useState(null);
  const [devices, setDevices] = useState([]);
  const [searching, setSearching] = useState(false);

  // Fetch all devices
  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await APIService.get('/api/v1/solar/devices/all/');
      const devicesData = response.data.devices || response.data.results || response.data.data || 
                         (Array.isArray(response.data) ? response.data : []);
      setDevices(devicesData);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      notification.warning({
        message: 'Warning',
        description: 'Could not load devices list.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // Handle initial form submission (Serial Number and Model)
  const handleSearchDevice = async (values) => {
    const { serial, model } = values;
    
    if (!serial || !model) {
      notification.warning({
        message: 'Validation Error',
        description: 'Please fill in both Serial Number and Model.',
      });
      return;
    }

    setSearching(true);
    try {
      // Try to fetch device data based on serial number
      const response = await APIService.get(`/api/v1/solar/devices/?serial=${serial}`);
      
      const devicesList = response.data.devices || response.data.results || response.data.data || 
                         (Array.isArray(response.data) ? response.data : []);
      
      const existingDevice = devicesList.find(d => d.serial === serial);
      
      if (existingDevice) {
        // Device exists - load its data
        setDeviceData({
          ...existingDevice,
          serial,
          model: existingDevice.model || model,
        });
        
        // Pre-fill the form with device data
        form.setFieldsValue({
          serial: existingDevice.serial,
          model: existingDevice.model || model,
          device_type: existingDevice.device_type || 'BATTERY',
          capacity_kwp: existingDevice.capacity_kwp || 0,
          status: existingDevice.status || 'online',
          is_active: existingDevice.is_active !== undefined ? existingDevice.is_active : true,
          branch: existingDevice.branch || null,
        });
        
        setShowDeviceDetails(true);
        notification.success({
          message: 'Device Found',
          description: 'Device details loaded successfully.',
        });
      } else {
        // Device doesn't exist - create new device data structure
        setDeviceData({
          serial,
          model,
          device_type: 'BATTERY',
          capacity_kwp: 0,
          status: 'online',
          is_active: true,
          branch: null,
        });
        
        form.setFieldsValue({
          serial,
          model,
          device_type: 'BATTERY',
          capacity_kwp: 0,
          status: 'online',
          is_active: true,
          branch: null,
        });
        
        setShowDeviceDetails(true);
        notification.info({
          message: 'New Device',
          description: 'Creating new device. Please fill in the device details.',
        });
      }
    } catch (error) {
      // Device doesn't exist or error - initialize as new
      setDeviceData({
        serial,
        model,
        device_type: 'BATTERY',
        capacity_kwp: 0,
        status: 'online',
        is_active: true,
        branch: null,
      });
      
      form.setFieldsValue({
        serial,
        model,
        device_type: 'BATTERY',
        capacity_kwp: 0,
        status: 'online',
        is_active: true,
        branch: null,
      });
      
      setShowDeviceDetails(true);
      notification.info({
        message: 'New Device',
        description: 'Please fill in the device details below.',
      });
    } finally {
      setSearching(false);
    }
  };

  // Handle saving device details (create new)
  const handleSave = async (values) => {
    if (!deviceData) {
      notification.error({
        message: 'Error',
        description: 'Device data not found. Please search for a device first.',
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        serial: values.serial,
        model: values.model || '',
        device_type: values.device_type || 'BATTERY',
        capacity_kwp: values.capacity_kwp || 0,
        status: values.status || 'online',
        is_active: values.is_active !== undefined ? values.is_active : true,
      };

      // If device has an ID, update it; otherwise create new
      if (deviceData.id) {
        await APIService.patch(`/api/v1/solar/devices/${deviceData.id}/update/`, payload);
        notification.success({
          message: 'Success',
          description: 'Device updated successfully.',
        });
      } else {
        // Create new device - try to find endpoint
        await APIService.post('/api/v1/solar/devices/', payload);
        notification.success({
          message: 'Success',
          description: 'Device created successfully.',
        });
      }
      
      // Refresh devices list
      await fetchDevices();
      
      // Reset form and go back
      setShowDeviceDetails(false);
      setDeviceData(null);
      form.resetFields();
    } catch (error) {
      console.error('Save error:', error);
      notification.error({
        message: 'Error',
        description: error?.response?.data?.message || 
                    error?.response?.data?.detail || 
                    error.message || 
                    'Failed to save device details. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle editing device
  const handleEdit = (device) => {
    setEditingDevice(device);
    editForm.setFieldsValue({
      serial: device.serial,
      model: device.model || '',
      device_type: device.device_type || 'BATTERY',
      capacity_kwp: device.capacity_kwp || 0,
      status: device.status || 'online',
      is_active: device.is_active !== undefined ? device.is_active : true,
    });
    setIsEditModalVisible(true);
  };

  // Handle updating device
  const handleUpdateDevice = async (values) => {
    if (!editingDevice) return;

    setSaving(true);
    try {
      const payload = {
        serial: values.serial,
        model: values.model || '',
        device_type: values.device_type || 'BATTERY',
        capacity_kwp: values.capacity_kwp || 0,
        status: values.status || 'online',
        is_active: values.is_active !== undefined ? values.is_active : true,
      };

      await APIService.patch(`/api/v1/solar/devices/${editingDevice.id}/update/`, payload);
      
      notification.success({
        message: 'Success',
        description: 'Device updated successfully.',
      });
      
      setIsEditModalVisible(false);
      setEditingDevice(null);
      await fetchDevices();
    } catch (error) {
      console.error('Update error:', error);
      notification.error({
        message: 'Error',
        description: error?.response?.data?.message || 
                    error?.response?.data?.detail || 
                    error.message || 
                    'Failed to update device. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle toggle device status
  const handleToggleStatus = (device) => {
    setTogglingDevice(device);
    setIsToggleModalVisible(true);
  };

  // Confirm toggle status
  const confirmToggleStatus = async () => {
    if (!togglingDevice) return;

    setSaving(true);
    try {
      const response = await APIService.post(`/api/v1/solar/devices/${togglingDevice.id}/toggle-status/`);
      
      notification.success({
        message: 'Success',
        description: response.data.message || 'Device status toggled successfully.',
      });
      
      setIsToggleModalVisible(false);
      setTogglingDevice(null);
      await fetchDevices();
    } catch (error) {
      console.error('Toggle error:', error);
      notification.error({
        message: 'Error',
        description: error?.response?.data?.message || 
                    error?.response?.data?.detail || 
                    error.message || 
                    'Failed to toggle device status. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (showDeviceDetails) {
      setShowDeviceDetails(false);
      setDeviceData(null);
      form.resetFields();
    }
  };

  const deviceColumns = [
    {
      title: 'Serial',
      dataIndex: 'serial',
      key: 'serial',
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Device Type',
      dataIndex: 'device_type',
      key: 'device_type',
    },
    {
      title: 'Capacity (kWp)',
      dataIndex: 'capacity_kwp',
      key: 'capacity_kwp',
      render: (value) => value || 0,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{ 
          color: status === 'online' ? 'green' : status === 'offline' ? 'red' : 'orange',
          fontWeight: 'bold' 
        }}>
          {status || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <span style={{ color: isActive ? 'green' : 'red', fontWeight: 'bold' }}>
          {isActive ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      title: 'Branch',
      dataIndex: 'branch',
      key: 'branch',
      render: (branch) => branch || '---',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type={record.is_active ? 'default' : 'primary'}
            size="small"
            icon={<BulbOutlined />}
            onClick={() => handleToggleStatus(record)}
          >
            {record.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ margin: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Title level={3} style={{ margin: 0 }}>
            {showDeviceDetails ? 'Solar Device Details' : 'Solar Onboarding'}
          </Title>
        </div>
        {/* {!showDeviceDetails && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowDeviceDetails(true)}
            style={{ background: '#5C12A7' }}
          >
            Add New Device
          </Button>
        )} */}
      </div>

      {!showDeviceDetails ? (
        <>
          {/* Initial Form: Serial Number and Model */}
          <Card title="Add New Solar Device" style={{ marginBottom: '20px' }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSearchDevice}
              autoComplete="off"
            >
              <Form.Item
                label="Serial Number"
                name="serial"
                rules={[{ required: true, message: 'Serial Number is required!' }]}
              >
                <Input placeholder="Enter Serial Number" size="large" />
              </Form.Item>

              <Form.Item
                label="Model"
                name="model"
                rules={[{ required: true, message: 'Model is required!' }]}
              >
                <Input placeholder="Enter Model" size="large" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={searching}
                  size="large"
                  block
                  style={{ background: '#5C12A7' }}
                >
                  {searching ? 'Searching...' : 'Proceed'}
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* Devices List */}
          <Card title="Solar Devices">
            <Table
              dataSource={devices}
              columns={deviceColumns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </>
      ) : (
        // Device Details Form (Editable)
        <Card title="Device Information">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            autoComplete="off"
          >
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Serial Number"
                  name="serial"
                  rules={[{ required: true, message: 'Serial Number is required!' }]}
                >
                  <Input placeholder="Enter Serial Number" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Model"
                  name="model"
                >
                  <Input placeholder="Enter Model" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Device Type"
                  name="device_type"
                  rules={[{ required: true, message: 'Device Type is required!' }]}
                >
                  <Select placeholder="Select Device Type">
                    {DEVICE_TYPES.map(type => (
                      <Option key={type} value={type}>{type}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Capacity (kWp)"
                  name="capacity_kwp"
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
                  label="Status"
                  name="status"
                  rules={[{ required: true, message: 'Status is required!' }]}
                >
                  <Select placeholder="Select Status">
                    {DEVICE_STATUS.map(status => (
                      <Option key={status} value={status}>{status.toUpperCase()}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Active"
                  name="is_active"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button onClick={handleBack}>
                Back
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                icon={<SaveOutlined />}
                style={{ background: '#5C12A7' }}
              >
                Save
              </Button>
            </div>
          </Form>
        </Card>
      )}

      {/* Edit Device Modal */}
      <Modal
        title="Edit Device"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingDevice(null);
          editForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateDevice}
        >
          <Form.Item
            label="Serial Number"
            name="serial"
            rules={[{ required: true, message: 'Serial Number is required!' }]}
          >
            <Input placeholder="Enter Serial Number" />
          </Form.Item>
          <Form.Item
            label="Model"
            name="model"
          >
            <Input placeholder="Enter Model" />
          </Form.Item>
          <Form.Item
            label="Device Type"
            name="device_type"
            rules={[{ required: true, message: 'Device Type is required!' }]}
          >
            <Select placeholder="Select Device Type">
              {DEVICE_TYPES.map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Capacity (kWp)"
            name="capacity_kwp"
          >
            <InputNumber
              placeholder="Enter Capacity"
              style={{ width: '100%' }}
              min={0}
              step={0.1}
            />
          </Form.Item>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Status is required!' }]}
          >
            <Select placeholder="Select Status">
              {DEVICE_STATUS.map(status => (
                <Option key={status} value={status}>{status.toUpperCase()}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Active"
            name="is_active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsEditModalVisible(false);
                setEditingDevice(null);
                editForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                style={{ background: '#5C12A7' }}
              >
                Update
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Toggle Status Confirmation Modal */}
      <Modal
        title="Confirm Action"
        open={isToggleModalVisible}
        onOk={confirmToggleStatus}
        onCancel={() => {
          setIsToggleModalVisible(false);
          setTogglingDevice(null);
        }}
        confirmLoading={saving}
      >
        <p>
          Are you sure you want to {togglingDevice?.is_active ? 'deactivate' : 'activate'} device with serial "{togglingDevice?.serial}"?
        </p>
      </Modal>
    </div>
  );
};

export default SolarOnboarding;