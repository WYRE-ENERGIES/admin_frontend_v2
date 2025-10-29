import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { APIService } from '../../config/Api/apiServices';

const { Title, Text } = Typography;
const { Option } = Select;

const SolarOnboarding = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [showStationDetails, setShowStationDetails] = useState(false);
  const [stationData, setStationData] = useState(null);
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Fetch all branches for the select dropdown
  const fetchAllBranches = async () => {
    setBranchesLoading(true);
    try {
      // Try common API patterns for fetching all branches
      const endpoints = [
        '/cadmin/branches',
        '/api/v1/accounts/branches/',
        '/api/v2/branches/',
      ];
      
      let response = null;
      for (const endpoint of endpoints) {
        try {
          response = await APIService.get(endpoint);
          if (response && response.data) {
            break;
          }
        } catch (err) {
          // Try next endpoint
          continue;
        }
      }
      
      if (response && response.data) {
        // Handle different response structures
        const branchesData = 
          response.data.branches || 
          response.data.results || 
          response.data.data || 
          (Array.isArray(response.data) ? response.data : []);
        
        setBranches(branchesData);
      } else {
        notification.warning({
          message: 'Warning',
          description: 'Could not load branches list. You may need to manually enter branch information.',
        });
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      notification.warning({
        message: 'Warning',
        description: 'Could not load branches list. You may still proceed with station details.',
      });
    } finally {
      setBranchesLoading(false);
    }
  };

  useEffect(() => {
    if (showStationDetails) {
      fetchAllBranches();
    }
  }, [showStationDetails]);

  // Handle initial form submission (Station Number and Product Name)
  const handleSearchStation = async (values) => {
    const { stationNumber, productName } = values;
    
    if (!stationNumber || !productName) {
      notification.warning({
        message: 'Validation Error',
        description: 'Please fill in both Station Number and Product Name.',
      });
      return;
    }

    setSearching(true);
    try {
      // Try to fetch station data based on station number
      // You may need to adjust this endpoint based on your API
      const endpoints = [
        `/api/v2/solar-station/${stationNumber}/`,
        `/api/v1/solar-station/${stationNumber}/`,
        `/cadmin/solar-station/${stationNumber}/`,
      ];
      
      let response = null;
      let stationFound = false;
      
      for (const endpoint of endpoints) {
        try {
          response = await APIService.get(endpoint);
          if (response && response.data) {
            stationFound = true;
            break;
          }
        } catch (err) {
          continue;
        }
      }
      
      if (stationFound && response) {
        // Station exists - load its data
        const station = response.data.station || response.data || {};
        setStationData({
          ...station,
          stationNumber,
          productName,
          // Ensure we have the required fields with defaults
          name: station.name || station.station_name || '',
          phone: station.phone || station.phone_number || '',
          email: station.email || '',
          branchId: station.branch_id || station.branch || null,
        });
        
        // Pre-fill the form with station data
        form.setFieldsValue({
          name: station.name || station.station_name || '',
          phone: station.phone || station.phone_number || '',
          email: station.email || '',
          branchId: station.branch_id || station.branch || null,
          stationBranches: station.branches || [],
        });
        
        setShowStationDetails(true);
        notification.success({
          message: 'Station Found',
          description: 'Station details loaded successfully.',
        });
      } else {
        // Station doesn't exist - create new station data structure
        setStationData({
          stationNumber,
          productName,
          name: '',
          phone: '',
          email: '',
          branchId: null,
          stationBranches: [],
        });
        
        form.setFieldsValue({
          name: '',
          phone: '',
          email: '',
          branchId: null,
          stationBranches: [],
        });
        
        setShowStationDetails(true);
        notification.info({
          message: 'New Station',
          description: 'Creating new station. Please fill in the station details.',
        });
      }
    } catch (error) {
      // Station doesn't exist or error - initialize as new
      setStationData({
        stationNumber,
        productName,
        name: '',
        phone: '',
        email: '',
        branchId: null,
        stationBranches: [],
      });
      
      form.setFieldsValue({
        name: '',
        phone: '',
        email: '',
        branchId: null,
        stationBranches: [],
      });
      
      setShowStationDetails(true);
      notification.info({
        message: 'New Station',
        description: 'Please fill in the station details below.',
      });
    } finally {
      setSearching(false);
    }
  };

  // Handle saving station details
  const handleSave = async (values) => {
    if (!stationData) {
      notification.error({
        message: 'Error',
        description: 'Station data not found. Please search for a station first.',
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        station_number: stationData.stationNumber,
        product_name: stationData.productName,
        name: values.name,
        phone: values.phone || values.phoneNumber,
        email: values.email,
        branch_id: values.branchId,
        client_id: clientId,
      };

      // Try different endpoints for creating/updating solar station
      const endpoints = [
        `/api/v2/solar-station/`,
        `/api/v1/solar-station/`,
        `/cadmin/solar-station/`,
      ];

      let success = false;
      let error = null;

      for (const endpoint of endpoints) {
        try {
          if (stationData.id) {
            // Update existing
            const updateEndpoint = `${endpoint}${stationData.id}/`;
            await APIService.patch(updateEndpoint, payload);
          } else {
            // Create new
            await APIService.post(endpoint, payload);
          }
          success = true;
          break;
        } catch (err) {
          error = err;
          continue;
        }
      }

      if (success) {
        notification.success({
          message: 'Success',
          description: 'Station details saved successfully.',
        });
        
        // Optionally navigate back to clients list after a delay
        setTimeout(() => {
          navigate('/clients');
        }, 1500);
      } else {
        throw error || new Error('Failed to save station details');
      }
    } catch (error) {
      console.error('Save error:', error);
      notification.error({
        message: 'Error',
        description: error?.response?.data?.message || 
                    error?.response?.data?.detail || 
                    error.message || 
                    'Failed to save station details. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (showStationDetails) {
      setShowStationDetails(false);
      setStationData(null);
      form.resetFields();
    } else {
      navigate('/clients');
    }
  };

  return (
    <div style={{ margin: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            style={{ padding: 0, height: 'auto' }}
          />
          <Title level={3} style={{ margin: 0 }}>
            {showStationDetails ? 'Solar Station Details' : 'Solar Onboarding'}
          </Title>
        </div>
      </div>

      {!showStationDetails ? (
        // Initial Form: Station Number and Product Name
        <Card title="Search Station" style={{ maxWidth: 600, margin: '0 auto' }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSearchStation}
            autoComplete="off"
          >
            <Form.Item
              label="Station Number"
              name="stationNumber"
              rules={[{ required: true, message: 'Station Number is required!' }]}
            >
              <Input placeholder="Enter Station Number" size="large" />
            </Form.Item>

            <Form.Item
              label="Product Name"
              name="productName"
              rules={[{ required: true, message: 'Product Name is required!' }]}
            >
              <Input placeholder="Enter Product Name" size="large" />
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
      ) : (
        // Station Details Form (Editable)
        <Card
          title="Station Information"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            autoComplete="off"
          >
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item label="Station Number">
                  <Input value={stationData?.stationNumber} disabled />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item label="Product Name">
                  <Input value={stationData?.productName} disabled />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Station Name"
                  name="name"
                  rules={[{ required: true, message: 'Station Name is required!' }]}
                >
                  <Input placeholder="Enter Station Name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Phone Number"
                  name="phone"
                  rules={[
                    { required: true, message: 'Phone Number is required!' },
                  ]}
                >
                  <Input placeholder="Enter Phone Number" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { type: 'email', message: 'Please enter a valid email!' },
                    { required: true, message: 'Email is required!' },
                  ]}
                >
                  <Input placeholder="Enter Email" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Branch"
                  name="branchId"
                  rules={[{ required: true, message: 'Please select a branch!' }]}
                >
                  <Select
                    placeholder="Select Branch"
                    loading={branchesLoading}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children || '').toLowerCase().includes(input.toLowerCase())
                    }
                    allowClear
                  >
                    {branches.map((branch) => (
                      <Option key={branch.id || branch.branch_id} value={branch.id || branch.branch_id}>
                        {branch.name || branch.branch_name || `Branch ${branch.id || branch.branch_id}`}
                      </Option>
                    ))}
                  </Select>
                  {branchesLoading && (
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      Loading branches...
                    </Text>
                  )}
                  {!branchesLoading && branches.length === 0 && (
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      No branches available. Please contact support.
                    </Text>
                  )}
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
                style={{ background: '#5C12A7' }}
              >
                Save
              </Button>
            </div>
          </Form>
        </Card>
      )}
    </div>
  );
};

export default SolarOnboarding;
