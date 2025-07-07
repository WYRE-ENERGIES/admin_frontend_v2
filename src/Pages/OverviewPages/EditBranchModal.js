import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Select, notification, Space, Card, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { APIService } from '../../config/Api/apiServices';

const { Option } = Select;
const { Text } = Typography;

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

const EditBranchModal = ({ visible, onCancel, clientId, branch, onBranchUpdated }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [regions, setRegions] = useState([]);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    if (branch) {
      form.setFieldsValue({
        name: branch.name,
        email: branch.email,
        address: branch.address,
        copy_email: branch.copy_email || '',
        region: branch.regions?.[0]?.id || null,
      });
      setDevices(branch.devices || []);
    }
  }, [branch, form]);

  useEffect(() => {
    if (visible) {
      fetchRegions();
    }
  }, [visible]);

  const fetchRegions = async () => {
    try {
      const response = await APIService.get(`api/v1/accounts/client/${clientId}/regions/`);
      setRegions(response.data.regions || []);
    } catch (error) {
      console.error('Failed to fetch regions:', error);
    }
  };

  const addDevice = () => {
    const newDevice = {
      id: Date.now(),
      device_name: '',
      device_type: 'UTILITY',
      provider: 'ACCRELL',
      device_id: '',
    };
    setDevices([...devices, newDevice]);
  };

  const removeDevice = (index) => {
    const updatedDevices = devices.filter((_, i) => i !== index);
    setDevices(updatedDevices);
  };

  const updateDevice = (index, field, value) => {
    const updatedDevices = [...devices];
    updatedDevices[index] = { ...updatedDevices[index], [field]: value };
    setDevices(updatedDevices);
  };

  const handleFinish = async (values) => {
    setLoading(true);

    try {
      const payload = {
        name: values.name,
        address: values.address,
        email: values.email,
        region: values.region,
        copy_email: values.copy_email,
        devices: devices.map(device => ({
          name: device.device_name,
          type: device.device_type,
          is_load: device.device_type === 4, // Automatically set based on device type
          provider: device.provider || 'ACCRELL',
          device_id: device.device_id,
          is_source: device.device_type !== 4 // Automatically set based on device type
        }))
      };
      
      await APIService.put(`/api/v1/accounts/update-branch/${branch.branch_id}/`, payload);
      notification.success({
        message: 'Success',
        description: 'Branch details updated successfully.',
      });
      onBranchUpdated();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error?.response?.data?.message || 'Failed to update branch details.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Branch Details"
      visible={visible}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="back" onClick={onCancel}>Cancel</Button>,
        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>Save</Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="name" label="Branch Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="copy_email" label="Copy Email" rules={[{ type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Address">
          <Input />
        </Form.Item>
        <Form.Item name="region" label="Region">
          <Select placeholder="Select region">
            {regions.map(region => (
              <Option key={region.id} value={region.id}>
                {region.region}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Card title="Devices" size="small" style={{ marginTop: 16 }}>
          {devices.map((device, index) => (
            <div key={device.id || index} style={{ marginBottom: 16, padding: 12, border: '1px solid #d9d9d9', borderRadius: 6 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <Form.Item
                    name={`devices.${index}.device_name`}
                    rules={[{ required: true, message: 'Device name is required' }]}
                  >
                    <Input
                      placeholder="Device Name"
                      value={device.device_name}
                      onChange={(e) => updateDevice(index, 'device_name', e.target.value)}
                      style={{ width: 200 }}
                    />
                  </Form.Item>
                  <Form.Item
                    name={`devices.${index}.device_type`}
                    rules={[{ required: true, message: 'Device type is required' }]}
                  >
                    <Select
                      value={device.device_type}
                      onChange={(value) => updateDevice(index, 'device_type', value)}
                      style={{ width: 150 }}
                    >
                      {DEVICE_TYPES.map(dt => (
                        <Option key={dt.id} value={dt.id.toString()}>
                          {dt.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name={`devices.${index}.provider`}
                    rules={[{ required: true, message: 'Provider is required' }]}
                  >
                    <Select
                      value={device.provider}
                      onChange={(value) => updateDevice(index, 'provider', value)}
                      style={{ width: 150 }}
                    >
                      {DEVICE_PROVIDERS.map(p => (
                        <Option key={p} value={p}>
                          {p}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name={`devices.${index}.device_id`}
                    rules={[{ required: true, message: 'Device ID is required' }]}
                  >
                    <Input
                      placeholder="Device ID"
                      value={device.device_id}
                      onChange={(e) => updateDevice(index, 'device_id', e.target.value)}
                      style={{ width: 200 }}
                    />
                  </Form.Item>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeDevice(index)}
                  />
                </Space>
              </Space>
            </div>
          ))}
          <Button type="dashed" onClick={addDevice} icon={<PlusOutlined />} style={{ width: '100%' }}>
            Add Device
          </Button>
        </Card>
      </Form>
    </Modal>
  );
};

export default EditBranchModal;