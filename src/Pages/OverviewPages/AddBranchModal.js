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
  Typography
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

const initialDeviceForm = { name: '', type: null, provider: null, deviceId: '', isLoad: false, isSource: false, genSize: null, fuelType: null };

const AddBranchModal = ({ visible, clientId, onCancel, onBranchAdded }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [clientRegions, setClientRegions] = useState([]);

  useEffect(() => {
    if (clientId) {
      loadClientRegions();
    }
  }, [clientId]);

  const loadClientRegions = async () => {
    if (!clientId) {
      return;
    }
    
    setRegionsLoading(true);
    try {
      const response = await APIService.get(`/api/v1/accounts/client/${clientId}/regions/`);
      
      // Ensure we always set an array
      let regionsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          regionsData = response.data;
        } else if (response.data.regions && Array.isArray(response.data.regions)) {
          regionsData = response.data.regions;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          regionsData = response.data.data;
        } else {
          console.warn('Unexpected regions data structure:', response.data);
          regionsData = [];
        }
      }
    
      setClientRegions(regionsData);
    } catch (error) {
      message.error('Failed to load client regions');
      setClientRegions([]); // Set empty array on error
    } finally {
      setRegionsLoading(false);
    }
  };

  const submitBranch = async (values) => {
    if (!clientId) {
      message.error('Client ID not found. Please go back to step 1.');
      return { success: false, error: 'Client ID not found' };
    }

    setLoading(true);
    try {
      const response = await APIService.post(`/api/v1/accounts/client/${clientId}/branches/`, {
        name: values.name,
        address: values.address,
        email: values.email,
        region: values.region,
        city: values.city,
        copy_email: values.copyEmail,
        devices: values.devices?.map(device => ({
          name: device.name,
          type: device.type,
          is_load: !!device.isLoad,
          provider: device.provider,
          device_id: device.deviceId,
          is_source: !!device.isSource,
          ...(device.type === 1 ? {
            gen_size: device.genSize,
            fuel_type: device.fuelType,
          } : {})
        })) || []
      });

      message.success('Branch created successfully!');
      
      onCancel();
      onBranchAdded();
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Branch creation error:', error);
      let errorMessage = 'Failed to create branch. Please check your connection and try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add Branch"
      visible={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="back" onClick={onCancel}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={() => form.submit()}>Add Branch</Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        name="add_branch"
        onFinish={submitBranch}
      >
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              label="Branch Name"
              name="name"
              rules={[{ required: true, message: 'Branch Name is required!' }]}
            >
              <Input placeholder="Enter branch name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Branch Email"
              name="email"
              rules={[{ type: 'email', message: 'Invalid email format' }]}
            >
              <Input placeholder="Branch Email" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Branch Address"
              name="address"
            >
              <Input placeholder="Branch Address" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              label="Region"
              name="region"
            >
              <Select 
                placeholder={regionsLoading ? "Loading regions..." : "Select Region (optional)"} 
                allowClear
                loading={regionsLoading}
                disabled={regionsLoading}
                notFoundContent={regionsLoading ? "Loading..." : "No regions available"}
              >
                {Array.isArray(clientRegions) && clientRegions.map(region => (
                  <Option key={region.id} value={region.id}>{region.region}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="City"
              name="city"
            >
              <Input placeholder="Enter city" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Copy Email"
              name="copyEmail"
            >
              <Input placeholder="Copy Email (optional)" />
            </Form.Item>
          </Col>
        </Row>
        <Divider style={{ margin: '12px 0' }}>Devices</Divider>
        <Form.List name="devices">
          {(fields, { add, remove }) => (
            <div style={{ marginLeft: '20px', marginBottom: '15px' }}> 
              {fields.map(({ key, name, ...restField }) => (
                <Row key={key} gutter={8} align="top" style={{ marginBottom: '5px' }}> 
                  <Col flex="auto">
                    <Card key={key} style={{ marginBottom: 10, background: '#fafafa' }} size="small">
                      <Row gutter={16}>
                        <Col flex="auto">
                          <Text strong>Device {key + 1}</Text>
                        </Col>
                        <Col>
                          <MinusCircleOutlined style={{ color: 'red' }} onClick={() => remove(name)} />
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col xs={24} sm={12} md={6}>
                          <Form.Item
                            {...restField}
                            label="Device Name"
                            name={[name, 'name']}
                            rules={[{ required: true, message: 'Device Name is required!' }]}
                          >
                            <Input placeholder="Enter device name" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <Form.Item
                            {...restField}
                            label="Device Type"
                            name={[name, 'type']}
                            rules={[{ required: true, message: 'Device Type is required!' }]}
                          >
                            <Select placeholder="Select Type">
                              {DEVICE_TYPES.map(dt => <Option key={dt.id} value={dt.id}>{dt.name} ({dt.id})</Option>)}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <Form.Item
                            {...restField}
                            label="Provider"
                            name={[name, 'provider']}
                            rules={[{ required: true, message: 'Provider is required!' }]}
                          >
                            <Select placeholder="Select Provider">
                              {DEVICE_PROVIDERS.map(p => <Option key={p} value={p}>{p}</Option>)}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <Form.Item
                            {...restField}
                            label="Device ID"
                            name={[name, 'deviceId']}
                            rules={[{ required: true, message: 'Device ID is required!' }]}
                          >
                            <Input placeholder="Enter device ID" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <Form.Item
                            {...restField}
                            label="Is Load"
                            name={[name, 'isLoad']}
                            valuePropName="checked"
                          >
                            <Checkbox />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <Form.Item
                            {...restField}
                            label="Is Source"
                            name={[name, 'isSource']}
                            valuePropName="checked"
                          >
                            <Checkbox />
                          </Form.Item>
                        </Col>
                      </Row>
                      {form.getFieldValue([name, 'type']) === 1 && (
                        <Row gutter={16}>
                          <Col xs={24} sm={12} md={6}>
                            <Form.Item
                              {...restField}
                              label="Gen Size (kVA)"
                              name={[name, 'genSize']}
                              rules={[{ required: true, message: 'Gen Size is required!' }]}
                            >
                              <Input placeholder="Enter generator size" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} md={6}>
                            <Form.Item
                              {...restField}
                              label="Fuel Type"
                              name={[name, 'fuelType']}
                              rules={[{ required: true, message: 'Fuel Type is required!' }]}
                            >
                              <Select placeholder="Select fuel type">
                                <Option value="diesel">Diesel</Option>
                                <Option value="gas">Gas</Option>
                                <Option value="other">Other</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>
                      )}
                    </Card>
                  </Col>
                </Row>
              ))}
        <Button type="dashed" onClick={() => add(initialDeviceForm)} block icon={<PlusOutlined />}>
          Add Device
        </Button>
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};


export default AddBranchModal;
