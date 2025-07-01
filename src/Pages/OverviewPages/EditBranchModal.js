import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Select, notification, Space, Card, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { APIService } from '../../config/Api/apiServices';

const { Option } = Select;
const { Text } = Typography;

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
        copy_email: branch.copy_email,
        region: branch.region,
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
      // You might need to adjust this endpoint to get all available regions
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
        ...values,
        devices: devices.filter(device => device.device_name.trim() !== ''), // Only include devices with names
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
                  <Input
                    placeholder="Device Name"
                    value={device.device_name}
                    onChange={(e) => updateDevice(index, 'device_name', e.target.value)}
                    style={{ width: 200 }}
                  />
                  <Select
                    value={device.device_type}
                    onChange={(value) => updateDevice(index, 'device_type', value)}
                    style={{ width: 150 }}
                  >
                    <Option value="UTILITY">UTILITY</Option>
                    <Option value="GENERATOR">GENERATOR</Option>
                    <Option value="SOLAR">SOLAR</Option>
                    <Option value="BATTERY">BATTERY</Option>
                  </Select>
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