import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Select, notification, Upload, Image } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { APIService } from '../../config/Api/apiServices';
import EnvData from '../../config/EnvData';

const { Option } = Select;

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const EditClientModal = ({ visible, onCancel, client, onClientUpdated }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [regions, setRegions] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    if (client) {
      form.setFieldsValue({
        name: client.name,
        email: client.email,
        client_type: client.client_type,
        phone_number: client.phone_number,
        address: client.address,
        additional_emails: client.additional_emails?.join(', '),
        regions: client.regions || [],
      });
      
      setUploadedFile(null);
      if (client.logo) {
        setImagePreview(`${EnvData.REACT_APP_API_URL}${client.logo}`);
      } else {
        setImagePreview('https://placeholdit.com/400x400/dddddd/999999?text=Add+Logo');
      }
    }
  }, [client, form, visible]);

  useEffect(() => {
    if (visible && client) {
      fetchRegions();
    }
  }, [visible, client]);

  const fetchRegions = async () => {
    try {
      const response = await APIService.get(`/api/v1/accounts/client/${client.id}/regions/`);
      setRegions(response.data.regions || []);
    } catch (error) {
      console.error('Failed to fetch regions:', error);
    }
  };

  const handleImageUpload = async ({ file }) => {
    const isLt1_5M = file.size / 1024 / 1024 < 1.5;
    if (!isLt1_5M) {
      notification.error({ message: 'Image must be smaller than 1.5MB!' });
      return;
    }
    if (file) {
      setUploadedFile(file);
      try {
        const dataUrl = await toBase64(file);
        setImagePreview(dataUrl);
      } catch (error) {
        notification.error({ message: 'Could not preview image.' });
      }
    }
  };

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        additional_emails: values.additional_emails ? values.additional_emails.split(',').map(item => item.trim()) : [],
      };

      if (uploadedFile) {
        const formData = new FormData();
        
        // Append all text/data fields
        Object.keys(payload).forEach(key => {
          if (payload[key]) {
            if (Array.isArray(payload[key])) {
              payload[key].forEach(value => formData.append(key, value));
            } else {
              formData.append(key, payload[key]);
            }
          }
        });
        
        formData.append('logo', uploadedFile, uploadedFile.name);

        await APIService.putMultipart(`/api/v1/accounts/view-update-client/${client.id}/`, formData);

      } else {
        await APIService.put(`/api/v1/accounts/view-update-client/${client.id}/`, payload);
      }
      
      notification.success({
        message: 'Success',
        description: 'Client details updated successfully.',
      });
      onClientUpdated();
      onCancel();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error?.response?.data?.message || error.message || 'Failed to update client details.',
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    name: 'logo',
    beforeUpload: () => false,
    onChange: handleImageUpload,
    showUploadList: false,
    accept: 'image/*',
  };

  return (
    <Modal
      title="Edit Client Details"
      visible={visible}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="back" onClick={onCancel}>Cancel</Button>,
        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>Save</Button>,
      ]}
    >
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <Image
          src={imagePreview}
          alt="Client Logo"
          style={{ maxHeight: 120, maxWidth: 200, objectFit: 'contain' }}
          fallback="https://placeholdit.com/400x400/dddddd/999999?text=Add+Logo"
        />
        <div style={{ marginTop: 10 }}>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Upload New Logo</Button>
          </Upload>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="name" label="Client Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone_number" label="Phone Number">
          <Input />
        </Form.Item>
        <Form.Item name="client_type" label="Client Type">
          <Select>
            <Option value="STANDARD">STANDARD</Option>
            <Option value="BESPOKE">BESPOKE</Option>
          </Select>
        </Form.Item>
        <Form.Item name="address" label="Address">
          <Input />
        </Form.Item>
        <Form.Item name="regions" label="Regions" help="Select from the list or type to add new regions.">
          <Select mode="tags" placeholder="Select or create regions">
            {regions.map(region => (
              <Option key={region.id} value={region.region}>
                {region.region}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="additional_emails" label="Additional Emails (comma-separated)">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditClientModal; 