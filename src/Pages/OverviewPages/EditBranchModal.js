import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  Row,
  Col,
  Divider,
  Checkbox,
  Modal,
  message,
  Typography,
  notification
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { APIService } from '../../config/Api/apiServices';

const { Text } = Typography;
const { Option } = Select;

const DEVICE_TYPES = [
  { id: 1, name: 'GENERATOR' },
  { id: 2, name: 'UTILITY' },
  { id: 3, name: 'IPP' },
  { id: 4, name: 'LOAD' },
  { id: 5, name: 'IPP2' },
  { id: 6, name: 'Water Area' },
  { id: 7, name: 'Swimming Pool' },
  { id: 8, name: 'FEEDER' },
];

const DEVICE_PROVIDERS = ["ACCRELL", "SATEC", "ACREL-ACB"];

const EditBranchModal = ({ visible, clientId, onCancel, branch, onBranchUpdated }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [clientRegions, setClientRegions] = useState([]);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    if (branch) {
      form.setFieldsValue({
        name: branch.name,
        email: branch.email,
        address: branch.address,
        copy_email: branch.copy_email || '',
        region: branch.region || branch.regions?.[0]?.id || null,
      });
      setDevices(branch.devices || []);
    }
  }, [branch, form]);

  useEffect(() => {
    if (clientId) {
      loadClientRegions();
    }
  }, [clientId]);

  const loadClientRegions = async () => {
    if (!clientId) {
      console.log('No client ID available for loading regions');
      return;
    }
    
    console.log('Loading regions for client ID:', clientId);
    setRegionsLoading(true);
    try {
      const response = await APIService.get(`/api/v1/accounts/client/${clientId}/regions/`);
      console.log('Regions API response:', response);
      
      let regionsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          regionsData = response.data;
        } else if (response.data.regions && Array.isArray(response.data.regions)) {
          regionsData = response.data.regions;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          regionsData = response.data.data;
        }
      }
      
      console.log('Processed regions data:', regionsData);
      setClientRegions(regionsData);
      
      // If we have a branch and regions data, try to pre-fill the region
      if (branch && regionsData.length > 0) {
        const branchRegion = branch.region || branch.regions?.[0]?.id;
        if (branchRegion) {
          const region = regionsData.find(r => r.id === branchRegion);
          if (region) {
            form.setFieldsValue({ region: region.id });
          }
        }
      }
    } catch (error) {
      console.error('Failed to load client regions:', error);
      message.error('Failed to load client regions');
      setClientRegions([]);
    } finally {
      setRegionsLoading(false);
    }
  };

  const addDevice = () => {
    const newDevice = {
      id: Date.now(),
      device_name: '',
      device_type: 1, 
      provider: 'ACCRELL',
      device_id: '',
      is_load: false,
      is_source: true
    };
    setDevices([...devices, newDevice]);
  };

  const removeDevice = (index) => {
    const updatedDevices = devices.filter((_, i) => i !== index);
    setDevices(updatedDevices);
  };

  const updateDevice = (index, field, value) => {
    const updatedDevices = [...devices];
    if (field === 'device_type' && typeof value === 'string') {
      const type = DEVICE_TYPES.find(dt => dt.name === value);
      value = type ? type.id : 1; 
    }
    updatedDevices[index] = { ...updatedDevices[index], [field]: value };
    setDevices(updatedDevices);
  };

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const newDevices = devices.filter(device => !device.id || device.id.toString().startsWith('new_'));
      
      const payload = {
        name: values.name,
        address: values.address,
        email: values.email,
        region: values.region,
        copy_email: values.copy_email,
        devices: newDevices.map(device => ({
          name: device.device_name,
          type: device.device_type, 
          is_load: device.is_load,
          provider: device.provider || 'ACCRELL',
          device_id: device.device_id,
          is_source: device.is_source
        }))
      };
      
      await APIService.put(`/api/v1/accounts/update-branch/${branch.branch_id}/`, payload);
      notification.success({
        message: 'Branch updated successfully',
        description: 'Branch has been updated successfully.'
      });
      onBranchUpdated();
      onCancel();
    } catch (error) {
      console.error('Failed to update branch:', error);
      notification.error({
        message: 'Failed to update branch',
        description: error?.response?.data?.message || error.message || 'Failed to update branch'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Edit Branch"
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          name: branch?.name || '',
          email: branch?.email || '',
          address: branch?.address || '',
          region: branch?.region || null,
          copy_email: branch?.copy_email || ''
        }}
      >
        <Card title="Branch Information">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Branch Name"
                rules={[{ required: true, message: 'Please enter branch name' }]}
              >
                <Input placeholder="Enter branch name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, message: 'Please enter email' }]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: 'Please enter address' }]}
              >
                <Input.TextArea placeholder="Enter address" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="region"
                label="Region"
                rules={[{ required: true, message: 'Please select region' }]}
              >
                <Select
                  placeholder="Select region"
                  loading={regionsLoading}
                  // defaultValue={branch?.region || branch?.region.id || "null"}
                >
                  {clientRegions.map(region => (
                    <Option key={region.id} value={region.id}>
                      {region.region}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="copy_email"
                label="Copy Email"
              >
                <Input placeholder="Enter copy email" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Devices" style={{ marginTop: 16 }}>
          {devices.map((device, index) => (
            <Row key={device.id} gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Form.Item
                  label="Device Name"
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    value={device.device_name}
                    onChange={(e) => updateDevice(index, 'device_name', e.target.value)}
                    placeholder="Enter device name"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Type"
                  style={{ marginBottom: 0 }}
                >
                  <Select
                    value={device.device_type}
                    onChange={(value) => updateDevice(index, 'device_type', value)}
                  >
                    {DEVICE_TYPES.map(type => (
                      <Option key={type.id} value={type.id}>
                        {type.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Provider"
                  style={{ marginBottom: 0 }}
                >
                  <Select
                    value={device.provider}
                    onChange={(value) => updateDevice(index, 'provider', value)}
                  >
                    {DEVICE_PROVIDERS.map(provider => (
                      <Option key={provider} value={provider}>
                        {provider}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Device ID"
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    value={device.device_id}
                    onChange={(e) => updateDevice(index, 'device_id', e.target.value)}
                    placeholder="Enter device ID"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Button
                  type="text"
                  color="red"
                  style={{color: 'red', marginTop: 4}}
                  icon={<MinusCircleOutlined />}
                  onClick={() => removeDevice(index)}
                >
                  Remove Device
                </Button>
              </Col>
            </Row>
          ))}
          <Button
            type="dashed"
            onClick={addDevice}
            style={{ width: '100%', marginBottom: 16 }}
            icon={<PlusOutlined />}
          >
            Add Device
          </Button>
        </Card>

        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Button onClick={handleCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update Branch
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditBranchModal;