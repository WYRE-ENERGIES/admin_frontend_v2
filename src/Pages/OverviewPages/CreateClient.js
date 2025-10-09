import React, { useState, useEffect, useRef } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  Space,
  Divider,
  Typography,
  Checkbox,
  Row,
  Col,
  InputNumber,
  Steps,
  message,
  TimePicker
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { APIService, instanceMultipart } from '../../config/Api/apiServices';
import { notification } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

const LOCAL_STORAGE_KEY = 'createClientFormData_Raw';
const CLIENT_PROGRESS_KEY = 'createClientProgress';
const CLIENT_ID_KEY = 'createClientId';
const CLIENT_STEP_KEY = 'createClientCurrentStep';
const CLIENT_TYPES = ["STANDARD", "BESPOKE", "RESELLER", "BULK_MONITORING"];
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
const FUEL_TYPES = ["diesel", "gas", "other"];
const USER_ROLES = [
  { id: 3, name: 'CLIENT_ADMIN' },
  { id: 4, name: 'OPERATOR' },
  { id: 5, name: 'VIEWER' },
];

const getInitialDeviceForm = () => ({ 
  name: '', 
  type: null, 
  provider: null, 
  deviceId: '', 
  isLoad: false, 
  isSource: false, 
  genSize: null, 
  fuelType: null,
  // Defaults to full day window: 00:00 - 23:59
  operationalStartTime: dayjs('00:00', 'HH:mm'),
  operationalEndTime: dayjs('23:59', 'HH:mm')
});
const initialBranchForm = { name: '', address: '', city: '', email: '', region: null, copyEmail: '', devices: [getInitialDeviceForm()] };
const initialUserForm = { username: '', firstName: '', lastName: '', email: '', phoneNumber: '', password: '', role: null };
const initialEmailForm = { email: '' };
const initialRegionForm = { region: '' };

const createClientWithRegions = async (clientData) => {
  const formData = new FormData();
  formData.append('name', clientData.clientName);
  formData.append('client_type', clientData.clientType);
  formData.append('phone_number', clientData.clientPhoneNumber);
  
  if (clientData.clientEmail) {
    formData.append('email', clientData.clientEmail);
  }
  
  if (clientData.clientAddress) {
    formData.append('address', clientData.clientAddress);
  }
  
  if (clientData.logoFile) {
    formData.append('logo', clientData.logoFile);
  }
  
  if (clientData.additionalEmails && clientData.additionalEmails.length > 0) {
    clientData.additionalEmails.forEach((item, index) => {
      if (item?.email) {
        formData.append('additional_emails', item.email);
      }
    });
  }
  
  if (clientData.regions && clientData.regions.length > 0) {
    clientData.regions.forEach((item, index) => {
      if (item?.region) {
        formData.append('regions', item.region);
      }
    });
  }
  

  // Debug: Log form data entries
  // for (let [key, value] of formData.entries()) {
  //   console.log(key, value);
  // }
  
  return await instanceMultipart.post('/api/v1/accounts/create-client-with-regions/', formData);
};

export const createMainUser = async (clientId, userData) => {
  const payload = {
    username: userData.mainUsername,
    password: userData.mainPassword,
    first_name: userData.mainFirstName,
    last_name: userData.mainLastName,
    email: userData.mainEmail,
    phone_number: userData.mainPhoneNumber
  };
  
  return await APIService.post(`/api/v1/accounts/client/${clientId}/main-user/`, payload);
};

export const createBranches = async (clientId, branchesData) => {
  const payload = branchesData.map(branch => ({
    name: branch.name,
    address: branch.address || null,
    city: branch.city || null,
    email: branch.email || null,
    region: branch.region || null,
    copy_email: branch.copyEmail || null,
    devices: branch.devices?.map(device => ({
      name: device.name,
      type: device.type,
      is_load: !!device.isLoad,
      provider: device.provider,
      device_id: device.deviceId,
      is_source: !!device.isSource,
      ...(device.type === 1 ? {
        gen_size: device.genSize,
        fuel_type: device.fuelType,
        operating_hours_start: device.operationalStartTime,
        operating_hours_end: device.operationalEndTime,
      } : {})
    })) || []
  }));
  
  return await APIService.post(`/api/v1/accounts/client/${clientId}/branches/`, payload);
};

export const createAdditionalUsers = async (clientId, usersData) => {
  const payload = usersData.map(user => ({
    username: user.username,
    password: user.password,
    first_name: user.firstName || null,
    last_name: user.lastName || null,
    email: user.email,
    roles: user.role,
    phone_number: user.phoneNumber || null
  }));
  
  return await APIService.post(`/api/v1/accounts/client/${clientId}/additional-user/`, payload);
};

const getClientRegions = async (clientId) => {
  return await APIService.get(`/api/v1/accounts/client/${clientId}/regions/`);
};

const DeviceFields = ({ deviceKey, deviceName, branchName, deviceRestField, form }) => {
  const deviceType = Form.useWatch(['branches', branchName, 'devices', deviceName, 'type'], form);

  return (
    <Card key={deviceKey} size="small" style={{ marginBottom: 10, background: '#fafafa' }}>
      <Row gutter={16} align="middle">
          <Col flex="auto">
              <Text strong>Device {deviceKey + 1}</Text>
          </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            {...deviceRestField}
            label="Device Name"
            name={[deviceName, 'name']}
            rules={[{ required: true, message: '${label} is required!' }]}
          >
            <Input placeholder="Device Name" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            {...deviceRestField}
            label="Device Type"
            name={[deviceName, 'type']}
            rules={[{ required: true, message: 'Please select a ${label}!' }]}
          >
            <Select placeholder="Select Type">
              {DEVICE_TYPES.map(dt => <Option key={dt.id} value={dt.id}>{dt.name} ({dt.id})</Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            {...deviceRestField}
            label="Provider"
            name={[deviceName, 'provider']}
            rules={[{ required: true, message: 'Please select a ${label}!' }]}
          >
             <Select placeholder="Select Provider">
              {DEVICE_PROVIDERS.map(p => <Option key={p} value={p}>{p}</Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            {...deviceRestField}
            label="Device ID"
            name={[deviceName, 'deviceId']}
            rules={[{ required: true, message: '${label} is required!' }]}
          >
            <Input placeholder="Unique Device ID" />
          </Form.Item>
        </Col>
        {deviceType === 1 && (
            <>
                <Col xs={24} sm={12} md={6}>
                    <Form.Item
                        {...deviceRestField}
                        label="Gen Size (kVA)"
                        name={[deviceName, 'genSize']}
                        rules={[{ required: true, message: '${label} is required for Generator!' }]}
                    >
                        <InputNumber style={{ width: '100%', height: '33px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} placeholder="e.g., 100" />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Form.Item
                        {...deviceRestField}
                        label="Fuel Type"
                        name={[deviceName, 'fuelType']}
                        rules={[{ required: true, message: 'Please select ${label} for Generator!' }]}
                    >
                         <Select placeholder="Select Fuel Type">
                          {FUEL_TYPES.map(ft => <Option key={ft} value={ft}>{ft}</Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Form.Item
                        {...deviceRestField}
                        label="Operational Start Time"
                        name={[deviceName, 'operationalStartTime']}
                        rules={[
                            { 
                                required: true, 
                                message: '${label} is required for Generator!' 
                            },
                            {
                                validator: (_, value) => {
                                    if (!value) {
                                        return Promise.resolve();
                                    }
                                    if (value && typeof value.isValid === 'function' && !value.isValid()) {
                                        return Promise.reject(new Error('Please select a valid start time'));
                                    }
                                    const end = form.getFieldValue(['branches', branchName, 'devices', deviceName, 'operationalEndTime']);
                                    if (end && typeof end.isValid === 'function' && end.isValid()) {
                                        if (value.isAfter(end)) {
                                            return Promise.reject(new Error('Start time cannot be after end time'));
                                        }
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <TimePicker 
                            style={{ width: '100%' }} 
                            format="HH:mm" 
                        placeholder="Select start time"
                        defaultValue={dayjs('00:00', 'HH:mm')}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Form.Item
                        {...deviceRestField}
                        label="Operational End Time"
                        name={[deviceName, 'operationalEndTime']}
                        rules={[
                            { 
                                required: true, 
                                message: '${label} is required for Generator!' 
                            },
                            {
                                validator: (_, value) => {
                                    if (!value) {
                                        return Promise.resolve();
                                    }
                                    if (value && typeof value.isValid === 'function' && !value.isValid()) {
                                        return Promise.reject(new Error('Please select a valid end time'));
                                    }
                                    const start = form.getFieldValue(['branches', branchName, 'devices', deviceName, 'operationalStartTime']);
                                    if (start && typeof start.isValid === 'function' && start.isValid()) {
                                        if (value.isBefore(start)) {
                                            return Promise.reject(new Error('End time cannot be before start time'));
                                        }
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <TimePicker 
                            style={{ width: '100%' }} 
                            format="HH:mm" 
                        placeholder="Select end time"
                        defaultValue={dayjs('23:59', 'HH:mm')}
                        />
                    </Form.Item>
                </Col>
            </>
        )}
        <Col xs={12} sm={6} md={3}>
           <Form.Item
              {...deviceRestField}
              name={[deviceName, 'isLoad']}
              valuePropName="checked"
              label="Is Load?"
            >
              <Checkbox />
            </Form.Item>
        </Col>
         <Col xs={12} sm={6} md={3}>
            <Form.Item
              {...deviceRestField}
              name={[deviceName, 'isSource']}
              valuePropName="checked"
              label="Is Source?"
            >
              <Checkbox />
            </Form.Item>
         </Col>
      </Row>
    </Card>
  );
};

const CreateClient = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [clientRegions, setClientRegions] = useState([]);
  const [stepData, setStepData] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const fileInputRef = useRef(null);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedProgress = localStorage.getItem(CLIENT_PROGRESS_KEY);
    const savedClientId = localStorage.getItem(CLIENT_ID_KEY);
    const savedStep = localStorage.getItem(CLIENT_STEP_KEY);
    
    let loadedFormValues = {};
    let loadedProgress = {};
    
    if (savedData) {
      try {
        loadedFormValues = JSON.parse(savedData);
      } catch (error) {
        console.error('Error parsing saved form data:', error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        message.warning('Corrupted form data detected and cleared. Please start fresh.');
      }
    }
    
    if (savedProgress) {
      try {
        loadedProgress = JSON.parse(savedProgress);
      } catch (error) {
        localStorage.removeItem(CLIENT_PROGRESS_KEY);
      }
    }
    
    // Load saved client ID and step
    if (savedClientId) {
      setClientId(savedClientId);
    }
    
    if (savedStep) {
      const stepNumber = parseInt(savedStep, 10);
      if (stepNumber >= 0 && stepNumber <= 3) {
        setCurrentStep(stepNumber);
      }
    }
    
    const merged = {
      clientName: '',
      clientType: null,
      clientPhoneNumber: '',
      clientEmail: '',
      clientAddress: '',
      regions: [],
      additionalEmails: [],
      mainUsername: '',
      mainFirstName: '',
      mainLastName: '',
      mainEmail: '',
      mainPhoneNumber: '',
      mainPassword: '',
      branches: [initialBranchForm],
      additionalUsers: [],
      ...loadedFormValues,
    };
    
    // Remove logoFile from merged data as it can't be serialized/deserialized
    delete merged.logoFile;
    
    merged.branches.forEach(branch => {
      if (!Array.isArray(branch.devices) || branch.devices.length === 0) {
        branch.devices = [getInitialDeviceForm()];
      } else {
        // Ensure all existing devices have proper time field initialization
        branch.devices.forEach(device => {
          // Ensure valid Dayjs instances and apply defaults if missing
          if (!device.operationalStartTime || typeof device.operationalStartTime.isValid !== 'function' || !device.operationalStartTime.isValid()) {
            device.operationalStartTime = dayjs('00:00', 'HH:mm');
          }
          if (!device.operationalEndTime || typeof device.operationalEndTime.isValid !== 'function' || !device.operationalEndTime.isValid()) {
            device.operationalEndTime = dayjs('23:59', 'HH:mm');
          }
        });
      }
    });
    
    // Prefill time fields on initial load for all devices
    merged.branches.forEach(branch => {
      branch.devices = (branch.devices || []).map(device => ({
        ...device,
        operationalStartTime: device.operationalStartTime || dayjs('00:00', 'HH:mm'),
        operationalEndTime: device.operationalEndTime || dayjs('23:59', 'HH:mm')
      }));
    });

    form.setFieldsValue(merged);
    setStepData(loadedProgress);
    setInitialDataLoaded(true);
    
    // Load regions if we're past step 1 and have a client ID
    if (savedClientId && savedStep && parseInt(savedStep, 10) >= 2) {
      setClientId(savedClientId);
      // Delay regions loading to ensure clientId is set
      setTimeout(() => {
        loadClientRegions();
      }, 100);
    }
  }, [form]);

  useEffect(() => {
    if (clientId && currentStep >= 2 && clientRegions.length === 0 && !regionsLoading) {
      loadClientRegions();
    }
  }, [clientId, currentStep]);

  const handleValuesChange = (changedValues, allValues) => {
     if (!initialDataLoaded) {
        return;
     }
    try {
        // Create a copy of allValues without logoFile since it can't be serialized
        const valuesToSave = { ...allValues };
        delete valuesToSave.logoFile;
        
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(valuesToSave));
    } catch (error) {
        console.error("Failed to save to localStorage:", error);
        message.warning("Could not save form progress. LocalStorage might be full.")
    }
  };

  const openNotification = ({ type, message, description }) => {
    notification[type]({
      message,
      description,
      placement: 'topRight',
      duration: 5,
    });
  };

  const loadClientRegions = async () => {
    if (!clientId) {
      return;
    }
    
    setRegionsLoading(true);
    try {
      const response = await getClientRegions(clientId);

      
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
      console.error('Failed to load client regions:', error);
      console.error('Error response:', error.response);
      message.error('Failed to load client regions');
      setClientRegions([]); // Set empty array on error
    } finally {
      setRegionsLoading(false);
    }
  };

  const submitClientInfo = async (values) => {
    setIsSubmitting(true);
    message.loading({ content: 'Creating client...', key: 'createClient', duration: 0 });
    
    try {
      // Combine form values with logoFile state
      const submitData = { ...values, logoFile };
      const response = await createClientWithRegions(submitData);

      
      // Check for different possible response structures
      let clientId = null;
      if (response.data && response.data.id) {
        clientId = response.data.id;
      } else if (response.data && response.data.client_id) {
        clientId = response.data.client_id;
      } else if (response.data && response.data.data && response.data.data.id) {
        clientId = response.data.data.id;
      } else if (response.data && response.data.data && response.data.data.client_id) {
        clientId = response.data.data.client_id;
      }
      
      
      if (clientId) {

        setClientId(clientId);
        setStepData(prev => ({ ...prev, clientInfo: response.data }));
        
        // Save progress to localStorage
        localStorage.setItem(CLIENT_ID_KEY, clientId);
        localStorage.setItem(CLIENT_STEP_KEY, '1');
        localStorage.setItem(CLIENT_PROGRESS_KEY, JSON.stringify({ ...stepData, clientInfo: response.data }));
        
        message.success({ content: 'Client created successfully!', key: 'createClient', duration: 2 });
        return { success: true, data: response.data };
      } else {

        // If the API call was successful but we can't find the ID, still consider it a success
        // and try to extract any useful information
        if (response.status >= 200 && response.status < 300) {

          setStepData(prev => ({ ...prev, clientInfo: response.data }));
          
          // Try to extract client ID from response data
          const extractedClientId = response.data?.id || response.data?.client_id || response.data?.data?.id || response.data?.data?.client_id;
          if (extractedClientId) {
            setClientId(extractedClientId);
            localStorage.setItem(CLIENT_ID_KEY, extractedClientId);
          }
          localStorage.setItem(CLIENT_STEP_KEY, '1');
          localStorage.setItem(CLIENT_PROGRESS_KEY, JSON.stringify({ ...stepData, clientInfo: response.data }));
          
          message.success({ content: 'Client created successfully!', key: 'createClient', duration: 2 });
          return { success: true, data: response.data };
        } else {
          throw new Error('Client creation failed - unexpected response structure');
        }
      }
    } catch (error) {
      console.error('Client creation error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Failed to create client. Please check your connection and try again.';
      let fieldErrors = {};
      
      // Handle specific field errors from API response
      if (error.response?.data?.errors) {
        fieldErrors = error.response.data.errors;
        
        // Set form field errors for specific fields
        Object.keys(fieldErrors).forEach(fieldName => {
          const fieldPath = fieldName === 'name' ? 'clientName' : 
                          fieldName === 'client_type' ? 'clientType' :
                          fieldName === 'phone_number' ? 'clientPhoneNumber' :
                          fieldName === 'email' ? 'clientEmail' :
                          fieldName === 'address' ? 'clientAddress' : fieldName;
          
          form.setFields([{
            name: fieldPath,
            errors: fieldErrors[fieldName]
          }]);
        });
        
        // Create a user-friendly error message
        const firstError = Object.values(fieldErrors)[0]?.[0];
        if (firstError) {
          errorMessage = firstError;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data;
      }
      
      message.error({ content: errorMessage, key: 'createClient', duration: 5 });
      openNotification({
        type: 'error',
        message: 'Error Creating Client',
        description: errorMessage
      });
      return { success: false, error: errorMessage, fieldErrors };
    } finally {
      setIsSubmitting(false);
      message.destroy('createClient');
    }
  };

  const submitMainUser = async (values) => {
    if (!clientId) {
      message.error('Client ID not found. Please go back to step 1.');
      return { success: false, error: 'Client ID not found' };
    }

    setIsSubmitting(true);
    message.loading({ content: 'Creating main user...', key: 'createMainUser', duration: 0 });
    
    try {
      const response = await createMainUser(clientId, values);
      
      setStepData(prev => ({ ...prev, mainUser: response.data }));
      
      // Save progress to localStorage
      localStorage.setItem(CLIENT_STEP_KEY, '2');
      localStorage.setItem(CLIENT_PROGRESS_KEY, JSON.stringify({ ...stepData, mainUser: response.data }));
      
      message.success({ content: 'Main user created successfully!', key: 'createMainUser', duration: 2 });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Main user creation error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Failed to create main user. Please check your connection and try again.';
      let fieldErrors = {};
      
      // Handle specific field errors from API response
      if (error.response?.data?.errors) {
        fieldErrors = error.response.data.errors;
        
        // Set form field errors for specific fields
        Object.keys(fieldErrors).forEach(fieldName => {
          const fieldPath = fieldName === 'email' ? 'mainEmail' : 
                          fieldName === 'username' ? 'mainUsername' :
                          fieldName === 'first_name' ? 'mainFirstName' :
                          fieldName === 'last_name' ? 'mainLastName' :
                          fieldName === 'phone_number' ? 'mainPhoneNumber' :
                          fieldName === 'password' ? 'mainPassword' : fieldName;
          
          form.setFields([{
            name: fieldPath,
            errors: fieldErrors[fieldName]
          }]);
        });
        
        // Create a user-friendly error message
        const firstError = Object.values(fieldErrors)[0]?.[0];
        if (firstError) {
          errorMessage = firstError;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      message.error({ content: errorMessage, key: 'createMainUser', duration: 5 });
      openNotification({
        type: 'error',
        message: 'Error Creating Main User',
        description: errorMessage
      });
      return { success: false, error: errorMessage, fieldErrors };
    } finally {
      setIsSubmitting(false);
      message.destroy('createMainUser');
    }
  };

  const submitBranches = async (values) => {
    if (!clientId) {
      message.error('Client ID not found. Please go back to step 1.');
      return { success: false, error: 'Client ID not found' };
    }

    setIsSubmitting(true);
    message.loading({ content: 'Creating branches...', key: 'createBranches', duration: 0 });
    
    try {
      const response = await createBranches(clientId, values.branches);
      
      setStepData(prev => ({ ...prev, branches: response.data }));
      
      // Save progress to localStorage
      localStorage.setItem(CLIENT_STEP_KEY, '3');
      localStorage.setItem(CLIENT_PROGRESS_KEY, JSON.stringify({ ...stepData, branches: response.data }));
      
      message.success({ content: 'Branches created successfully!', key: 'createBranches', duration: 2 });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Branches creation error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Failed to create branches. Please check your connection and try again.';
      let fieldErrors = {};
      
      // Handle specific field errors from API response
      if (error.response?.data?.errors) {
        fieldErrors = error.response.data.errors;
        
        // Set form field errors for specific fields
        Object.keys(fieldErrors).forEach(fieldName => {
          // For branches, errors might be structured differently
          // Check if it's an array of errors (multiple branches)
          if (Array.isArray(fieldErrors[fieldName])) {
            fieldErrors[fieldName].forEach((branchError, branchIndex) => {
              if (branchError && typeof branchError === 'object') {
                // Handle per-branch errors
                Object.keys(branchError).forEach(branchFieldName => {
                  const fieldPath = branchFieldName === 'name' ? 'name' : 
                                  branchFieldName === 'email' ? 'email' :
                                  branchFieldName === 'address' ? 'address' :
                                  branchFieldName === 'city' ? 'city' :
                                  branchFieldName === 'region' ? 'region' :
                                  branchFieldName === 'copy_email' ? 'copyEmail' : branchFieldName;
                  
                  form.setFields([{
                    name: ['branches', branchIndex, fieldPath],
                    errors: Array.isArray(branchError[branchFieldName]) ? branchError[branchFieldName] : [branchError[branchFieldName]]
                  }]);
                  
                  // Handle device errors within branches
                  if (branchFieldName === 'devices' && Array.isArray(branchError[branchFieldName])) {
                    branchError[branchFieldName].forEach((deviceError, deviceIndex) => {
                      if (deviceError && typeof deviceError === 'object') {
                        Object.keys(deviceError).forEach(deviceFieldName => {
                          const deviceFieldPath = deviceFieldName === 'name' ? 'name' : 
                                                deviceFieldName === 'type' ? 'type' :
                                                deviceFieldName === 'provider' ? 'provider' :
                                                deviceFieldName === 'device_id' ? 'deviceId' :
                                                deviceFieldName === 'is_load' ? 'isLoad' :
                                                deviceFieldName === 'is_source' ? 'isSource' :
                                                deviceFieldName === 'gen_size' ? 'genSize' :
                                                deviceFieldName === 'fuel_type' ? 'fuelType' : deviceFieldName;
                          
                          form.setFields([{
                            name: ['branches', branchIndex, 'devices', deviceIndex, deviceFieldPath],
                            errors: Array.isArray(deviceError[deviceFieldName]) ? deviceError[deviceFieldName] : [deviceError[deviceFieldName]]
                          }]);
                        });
                      }
                    });
                  }
                });
              }
            });
          } else {
            // Handle single field error (might be for the entire batch)
            const fieldPath = fieldName === 'name' ? 'name' : 
                            fieldName === 'email' ? 'email' :
                            fieldName === 'address' ? 'address' :
                            fieldName === 'city' ? 'city' :
                            fieldName === 'region' ? 'region' :
                            fieldName === 'copy_email' ? 'copyEmail' : fieldName;
            
            // Apply error to all branches for this field
            const branches = values.branches || [];
            branches.forEach((_, branchIndex) => {
              form.setFields([{
                name: ['branches', branchIndex, fieldPath],
                errors: Array.isArray(fieldErrors[fieldName]) ? fieldErrors[fieldName] : [fieldErrors[fieldName]]
              }]);
            });
          }
        });
        
        // Create a user-friendly error message
        const firstError = Object.values(fieldErrors)[0];
        if (Array.isArray(firstError) && firstError[0]) {
          if (typeof firstError[0] === 'object') {
            const firstBranchError = Object.values(firstError[0])[0];
            if (Array.isArray(firstBranchError)) {
              errorMessage = firstBranchError[0];
            } else {
              errorMessage = firstBranchError;
            }
          } else {
            errorMessage = firstError[0];
          }
        } else if (typeof firstError === 'string') {
          errorMessage = firstError;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      message.error({ content: errorMessage, key: 'createBranches', duration: 5 });
      openNotification({
        type: 'error',
        message: 'Error Creating Branches',
        description: errorMessage
      });
      return { success: false, error: errorMessage, fieldErrors };
    } finally {
      setIsSubmitting(false);
      message.destroy('createBranches');
    }
  };

  const submitAdditionalUsers = async (values) => {
    if (!clientId) {
      message.error('Client ID not found. Please go back to step 1.');
      return { success: false, error: 'Client ID not found' };
    }

    setIsSubmitting(true);
    message.loading({ content: 'Creating additional users...', key: 'createAdditionalUsers', duration: 0 });
    
    try {
      const response = await createAdditionalUsers(clientId, values.additionalUsers);
      
      setStepData(prev => ({ ...prev, additionalUsers: response.data }));
      
      // Save progress to localStorage
      localStorage.setItem(CLIENT_STEP_KEY, '4');
      localStorage.setItem(CLIENT_PROGRESS_KEY, JSON.stringify({ ...stepData, additionalUsers: response.data }));
      
      message.success({ content: 'Additional users created successfully!', key: 'createAdditionalUsers', duration: 2 });
      
      // Show final success notification
      openNotification({
        type: 'success',
        message: 'Client Setup Complete',
        description: `Client has been successfully created with all components.`
      });
      

      // Clear all localStorage and redirect
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(CLIENT_PROGRESS_KEY);
      localStorage.removeItem(CLIENT_ID_KEY);
      localStorage.removeItem(CLIENT_STEP_KEY);
      
      setTimeout(() => {
        navigate('/clients');
      }, 2000);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Additional users creation error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Failed to create additional users. Please check your connection and try again.';
      let fieldErrors = {};
      
      // Handle specific field errors from API response
      if (error.response?.data?.errors) {
        fieldErrors = error.response.data.errors;
        
        // Set form field errors for specific fields
        Object.keys(fieldErrors).forEach(fieldName => {
          // For additional users, errors might be structured differently
          // Check if it's an array of errors (multiple users)
          if (Array.isArray(fieldErrors[fieldName])) {
            fieldErrors[fieldName].forEach((userError, userIndex) => {
              if (userError && typeof userError === 'object') {
                // Handle per-user errors
                Object.keys(userError).forEach(userFieldName => {
                  const fieldPath = userFieldName === 'email' ? 'email' : 
                                  userFieldName === 'username' ? 'username' :
                                  userFieldName === 'first_name' ? 'firstName' :
                                  userFieldName === 'last_name' ? 'lastName' :
                                  userFieldName === 'phone_number' ? 'phoneNumber' :
                                  userFieldName === 'password' ? 'password' :
                                  userFieldName === 'roles' ? 'role' : userFieldName;
                  
                  form.setFields([{
                    name: ['additionalUsers', userIndex, fieldPath],
                    errors: Array.isArray(userError[userFieldName]) ? userError[userFieldName] : [userError[userFieldName]]
                  }]);
                });
              }
            });
          } else {
            // Handle single field error (might be for the entire batch)
            const fieldPath = fieldName === 'email' ? 'email' : 
                            fieldName === 'username' ? 'username' :
                            fieldName === 'first_name' ? 'firstName' :
                            fieldName === 'last_name' ? 'lastName' :
                            fieldName === 'phone_number' ? 'phoneNumber' :
                            fieldName === 'password' ? 'password' :
                            fieldName === 'roles' ? 'role' : fieldName;
            
            // Apply error to all additional users for this field
            const additionalUsers = values.additionalUsers || [];
            additionalUsers.forEach((_, userIndex) => {
              form.setFields([{
                name: ['additionalUsers', userIndex, fieldPath],
                errors: Array.isArray(fieldErrors[fieldName]) ? fieldErrors[fieldName] : [fieldErrors[fieldName]]
              }]);
            });
          }
        });
        
        // Create a user-friendly error message
        const firstError = Object.values(fieldErrors)[0];
        if (Array.isArray(firstError) && firstError[0]) {
          if (typeof firstError[0] === 'object') {
            const firstUserError = Object.values(firstError[0])[0];
            if (Array.isArray(firstUserError)) {
              errorMessage = firstUserError[0];
            } else {
              errorMessage = firstUserError;
            }
          } else {
            errorMessage = firstError[0];
          }
        } else if (typeof firstError === 'string') {
          errorMessage = firstError;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      message.error({ content: errorMessage, key: 'createAdditionalUsers', duration: 5 });
      openNotification({
        type: 'error',
        message: 'Error Creating Additional Users',
        description: errorMessage
      });
      return { success: false, error: errorMessage, fieldErrors };
    } finally {
      setIsSubmitting(false);
      message.destroy('createAdditionalUsers');
    }
  };

  const handleNext = async () => {
    const currentValues = form.getFieldsValue();
    
    // Validate current step fields
    let fieldsToValidatePaths = steps[currentStep].fieldsToValidate;
    
    if (currentStep === 2) {
      const branches = currentValues.branches || [];
      fieldsToValidatePaths = branches.flatMap((branch, branchIndex) => {
        if (!branch) return [];
        return [
          ['branches', branchIndex, 'name'],
          ...(branch.devices || []).flatMap((device, deviceIndex) => {
            if (!device) return [];
            const basePaths = [
              ['branches', branchIndex, 'devices', deviceIndex, 'name'],
              ['branches', branchIndex, 'devices', deviceIndex, 'type'],
              ['branches', branchIndex, 'devices', deviceIndex, 'provider'],
              ['branches', branchIndex, 'devices', deviceIndex, 'deviceId'],
            ];
            if (device.type === 1) {
              basePaths.push(
                ['branches', branchIndex, 'devices', deviceIndex, 'genSize'],
                ['branches', branchIndex, 'devices', deviceIndex, 'fuelType']
              );
            }
            return basePaths;
          })
        ];
      });
    } else if (currentStep === 3) {
      const users = currentValues.additionalUsers || [];
      fieldsToValidatePaths = users.flatMap((user, userIndex) => {
        if (!user) return [];
        return [
          ['additionalUsers', userIndex, 'username'],
          ['additionalUsers', userIndex, 'email'],
          ['additionalUsers', userIndex, 'password'],
          ['additionalUsers', userIndex, 'role'],
        ];
      });
    }

    try {
      await form.validateFields(fieldsToValidatePaths);
      
      // Submit current step data to API
      let result = { success: true };
      
      if (currentStep === 0) {
        result = await submitClientInfo(currentValues);
      } else if (currentStep === 1) {
        result = await submitMainUser(currentValues);
      } else if (currentStep === 2) {
        result = await submitBranches(currentValues);
      } else if (currentStep === 3) {
        result = await submitAdditionalUsers(currentValues);
      }
      
      
      if (result.success) {

        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        
        // Save current step to localStorage
        localStorage.setItem(CLIENT_STEP_KEY, nextStep.toString());
        
        // Load regions for branch step after main user creation
        if (currentStep === 1 && clientId) {
          await loadClientRegions();
        }
      } else {
        console.log('API call failed, not moving to next step');
      }
    } catch (info) {

      const firstErrorField = info.errorFields?.[0]?.name?.join('.') || 'fields';
      message.warning(`Please complete the required ${firstErrorField} for this step.`);
    }
  };

  const handlePrev = () => {
    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);
    localStorage.setItem(CLIENT_STEP_KEY, prevStep.toString());
  };

  const steps = [
    {
      title: 'Client Info',
      content: (
        <Card title="Client Details" style={{ marginBottom: 20 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Client Name"
                name="clientName"
                rules={[{ required: true, message: 'Client Name is required!' }]}
              >
                <Input placeholder="Enter client name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Client Type"
                name="clientType"
                rules={[{ required: true, message: 'Client Type is required!' }]}
              >
                <Select placeholder="Select client type">
                  {CLIENT_TYPES.map(type => <Option key={type} value={type}>{type}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Phone Number" name="clientPhoneNumber" rules={[{ required: true, message: 'Phone Number is required!' }]}> 
                <Input placeholder="Enter client phone number" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Email" name="clientEmail" rules={[{ type: 'email', message: 'Please enter a valid email!' }]}> 
                <Input placeholder="Enter client email" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item 
                label="Logo" 
              >
                <Input 
                  type="file" 
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        message.error('Logo file size must be less than 2MB!');
                        e.target.value = '';
                        return;
                      }
                      setLogoFile(file);
                    }
                  }}
                />
                {logoFile && (
                  <div style={{ marginTop: '4px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Selected: {logoFile.name} ({(logoFile.size / 1024 / 1024).toFixed(2)} MB)
                    </Text>
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={() => {
                        setLogoFile(null);
                        // Clear the file input using ref
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      style={{ padding: 0, marginLeft: '8px' }}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={16}>
              <Form.Item label="Address" name="clientAddress">
                <Input.TextArea rows={1} placeholder="Enter client address" />
              </Form.Item>
            </Col>
          </Row>
                    <Divider>Regions</Divider>
          <Form.List name="regions">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'region']}
                      label="Region"
                      style={{ width: '300px' }}
                      noStyle
                    >
                      <Input placeholder="Enter region name (optional)" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add(initialRegionForm)} block icon={<PlusOutlined />}>
                    Add Region
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Divider>Additional Emails</Divider>
          <Form.List name="additionalEmails">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'email']}
                      label="Additional Email"
                      rules={[{ type: 'email', message: 'Invalid email format' }]}
                      style={{ width: '300px' }}
                      noStyle
                    >
                      <Input placeholder="Additional Email" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add(initialEmailForm)} block icon={<PlusOutlined />}>
                    Add Email
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>
      ),
      fieldsToValidate: ['clientName', 'clientType', 'clientPhoneNumber'],
    },
    {
      title: 'Main User',
      content: (
        <Card title="Main User (Client Admin)" style={{ marginBottom: 20 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Username"
                name="mainUsername"
                rules={[{ required: true, message: 'Username is required!' }]}
              >
                <Input placeholder="Enter username" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="First Name" name="mainFirstName" rules={[{ required: true, message: 'First Name is required!' }]}> 
                <Input placeholder="Enter first name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Last Name" name="mainLastName" rules={[{ required: true, message: 'Last Name is required!' }]}> 
                <Input placeholder="Enter last name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Email"
                name="mainEmail"
                rules={[{ type: 'email', required: true, message: 'Please enter a valid email!' }]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Phone Number" name="mainPhoneNumber" rules={[{ required: true, message: 'Phone Number is required!' }]}> 
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Password"
                name="mainPassword"
                rules={[{ required: true, message: 'Password is required!' }]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>
            </Col>
          </Row>
          <Text type="secondary">Role will be set to Client Admin.</Text>
        </Card>
      ),
      fieldsToValidate: ['mainUsername', 'mainFirstName', 'mainLastName', 'mainEmail', 'mainPhoneNumber', 'mainPassword'],
    },
    {
      title: 'Branches & Devices',
      content: (
        <>
          <Title level={4} style={{ marginTop: 10, marginBottom: 10 }}>Branches</Title>
          <Form.List name="branches">
            {(branchFields, { add: addBranch, remove: removeBranch }) => (
              <> {branchFields.map(({ key: branchKey, name: branchName, ...branchRestField }) => (
                <Card key={branchKey} style={{ marginBottom: 16 }} bodyStyle={{ paddingBottom: 0 }}>
                  <Row gutter={16} align="middle"> 
                    <Col flex="auto">
                      <Title level={5}>Branch {branchKey + 1}</Title>
                    </Col> 
                    <Col>
                      <MinusCircleOutlined style={{ fontSize: '18px', color: 'red' }} onClick={() => removeBranch(branchName)} />
                    </Col> 
                  </Row>
                  <Row gutter={16}> 
                    <Col xs={24} md={8}>
                      <Form.Item {...branchRestField} label="Branch Name" name={[branchName, 'name']} rules={[{ required: true, message: '${label} is required!' }]}>
                        <Input placeholder="Branch Name" />
                      </Form.Item>
                    </Col> 
                    <Col xs={24} md={8}>
                      <Form.Item {...branchRestField} label="Branch Email" name={[branchName, 'email']} rules={[{ type: 'email', message: 'Invalid ${label}!' }]}>
                        <Input placeholder="Branch Email" />
                      </Form.Item>
                    </Col> 
                    <Col xs={24} md={8}>
                      <Form.Item {...branchRestField} label="Branch Address" name={[branchName, 'address']}>
                        <Input placeholder="Branch Address" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col xs={24} md={8}>
                      <Form.Item {...branchRestField} label="Region" name={[branchName, 'region']}>
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
                        {!regionsLoading && Array.isArray(clientRegions) && clientRegions.length === 0 && (
                          <div style={{ marginTop: '4px' }}>
                            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                              No regions found for this client
                            </Text>
                            {clientId && (
                              <Button 
                                type="link" 
                                size="small" 
                                onClick={() => {
                                  loadClientRegions();
                                }}
                                style={{ padding: 0, marginTop: '4px' }}
                              >
                                Retry Load Regions
                              </Button>
                            )}
                          </div>
                        )}
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item {...branchRestField} label="Copy Email" name={[branchName, 'copyEmail']}>
                        <Input placeholder="Copy Email (optional)" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item {...branchRestField} label="City" name={[branchName, 'city']}>
                        <Input placeholder="City" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Divider style={{ margin: '12px 0' }}>Devices</Divider>
                  <Form.List {...branchRestField} name={[branchName, 'devices']}>
                    {(deviceFields, { add: addDevice, remove: removeDevice }) => (
                      <div style={{ marginLeft: '20px', marginBottom: '15px' }}> 
                        {deviceFields.map(({ key: deviceKey, name: deviceName, ...deviceRestField }) => (
                          <Row key={deviceKey} gutter={8} align="top" style={{ marginBottom: '5px' }}> 
                            <Col flex="auto">
                              <DeviceFields deviceKey={deviceKey} deviceName={deviceName} branchName={branchName} deviceRestField={deviceRestField} form={form} />
                            </Col> 
                            <Col style={{ paddingTop: '8px' }}>
                              <MinusCircleOutlined style={{ color: 'red', fontSize: '16px' }} onClick={() => removeDevice(deviceName)} />
                            </Col> 
                          </Row>
                        ))} 
                        <Button type="dashed" onClick={() => addDevice(getInitialDeviceForm())} block icon={<PlusOutlined />} style={{marginTop: '10px'}}>
                          Add Device
                        </Button> 
                      </div>
                    )}
                  </Form.List>
                </Card>
              ))} 
              <Button type="dashed" onClick={() => addBranch(initialBranchForm)} block icon={<PlusOutlined />}>
                Add Branch
              </Button> 
              </>
            )}
          </Form.List>
        </>
      ),
      fieldsToValidate: ['branches'],
    },
    {
      title: 'Additional Users',
      content: (
        <>
           <Title level={4} style={{ marginTop: 10, marginBottom: 10 }}>Additional Users (Optional)</Title>
           <Form.List name="additionalUsers">
            {(userFields, { add: addUser, remove: removeUser }) => (
              <> {userFields.map(({ key: userKey, name: userName, ...userRestField }) => (
                 <Card key={userKey} style={{ marginBottom: 16, background: '#fafafa' }} size="small">
                    <Row gutter={16} align="middle"> 
                      <Col flex="auto">
                        <Text strong>User {userKey + 1}</Text>
                      </Col> 
                      <Col>
                        <MinusCircleOutlined style={{ color: 'red' }} onClick={() => removeUser(userName)} />
                      </Col> 
                    </Row>
                   <Row gutter={16}> 
                     <Col xs={24} sm={12} md={6}>
                       <Form.Item {...userRestField} label="Username" name={[userName, 'username']} rules={[{ required: true, message: '${label} is required!' }]}>
                         <Input placeholder="Username" />
                       </Form.Item>
                     </Col> 
                     <Col xs={24} sm={12} md={6}>
                       <Form.Item {...userRestField} label="First Name" name={[userName, 'firstName']}>
                         <Input placeholder="First Name" />
                       </Form.Item>
                     </Col> 
                     <Col xs={24} sm={12} md={6}>
                       <Form.Item {...userRestField} label="Last Name" name={[userName, 'lastName']}>
                         <Input placeholder="Last Name" />
                       </Form.Item>
                     </Col> 
                     <Col xs={24} sm={12} md={6}>
                       <Form.Item {...userRestField} label="Email" name={[userName, 'email']} rules={[{ type: 'email', required: true, message: 'Valid ${label} is required!' }]}>
                         <Input placeholder="Email" />
                       </Form.Item>
                     </Col> 
                     <Col xs={24} sm={12} md={6}>
                       <Form.Item {...userRestField} label="Phone Number" name={[userName, 'phoneNumber']}>
                         <Input placeholder="Phone Number" />
                       </Form.Item>
                     </Col> 
                     <Col xs={24} sm={12} md={6}>
                       <Form.Item {...userRestField} label="Password" name={[userName, 'password']} rules={[{ required: true, message: '${label} is required!' }]}>
                         <Input.Password placeholder="Password" />
                       </Form.Item>
                     </Col> 
                     <Col xs={24} sm={12} md={6}>
                       <Form.Item {...userRestField} label="Role" name={[userName, 'role']} rules={[{ required: true, message: 'Please select a ${label}!' }]}>
                         <Select placeholder="Select Role">
                           {USER_ROLES.map(role => <Option key={role.id} value={role.id}>{role.name}</Option>)}
                         </Select>
                       </Form.Item>
                     </Col> 
                   </Row>
                 </Card>
              ))} 
              <Button type="dashed" onClick={() => addUser(initialUserForm)} block icon={<PlusOutlined />}>
                Add Additional User
              </Button> 
              </>
            )}
          </Form.List>
        </>
      ),
       fieldsToValidate: ['additionalUsers'],
    },
  ];

  const clearAllProgress = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(CLIENT_PROGRESS_KEY);
    localStorage.removeItem(CLIENT_ID_KEY);
    localStorage.removeItem(CLIENT_STEP_KEY);
    
    setCurrentStep(0);
    setClientId(null);
    setStepData({});
    setLogoFile(null);
    setClientRegions([]);
    form.resetFields();
    
    message.success('Progress cleared. Starting fresh.');
  };

  const clearCorruptedData = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(CLIENT_PROGRESS_KEY);
      localStorage.removeItem(CLIENT_ID_KEY);
      localStorage.removeItem(CLIENT_STEP_KEY);
      
      const initialFormData = {
        clientName: '',
        clientType: null,
        clientPhoneNumber: '',
        clientEmail: '',
        clientAddress: '',
        regions: [],
        additionalEmails: [],
        mainUsername: '',
        mainFirstName: '',
        mainLastName: '',
        mainEmail: '',
        mainPhoneNumber: '',
        mainPassword: '',
        branches: [initialBranchForm],
        additionalUsers: [],
      };
      
      form.setFieldsValue(initialFormData);
      setCurrentStep(0);
      setClientId(null);
      setStepData({});
      setLogoFile(null);
      setClientRegions([]);
      
      message.success('Corrupted data cleared. Form reset to initial state.');
    } catch (error) {
      console.error('Error clearing corrupted data:', error);
      message.error('Failed to clear corrupted data. Please refresh the page.');
    }
  };

  // Render null until initial data is loaded to prevent flicker/errors
  if (!initialDataLoaded) {
    return null;
  }

  return (
    <div style={{ margin: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <Title level={2}>Create New Client</Title>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <Button 
            type="default" 
            onClick={clearCorruptedData}
            style={{ marginLeft: 'auto' }}
          >
            Clear Corrupted Data
          </Button>
          {clientId && (
            <Button 
              type="default" 
              onClick={clearAllProgress}
            >
              Start Over
            </Button>
          )}
        </div>
      </div>
      <Form
        form={form}
        name="create_client_wizard"
        layout="vertical"
        onValuesChange={handleValuesChange}
        autoComplete="off"
        style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
      >
        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          {steps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div style={{ minHeight: 350 }}>
          {steps.map((step, idx) => (
            <div
              key={step.title}
              style={{ display: idx === currentStep ? 'block' : 'none', transition: 'all 0.3s', animation: idx === currentStep ? 'fadeIn 0.4s' : 'none' }}
            >
              {step.content}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
          <Button disabled={currentStep === 0} onClick={handlePrev} style={{ minWidth: 120 }}>
            Previous
          </Button>
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={handleNext} loading={isSubmitting} style={{ minWidth: 120 }}>
              Next
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button type="primary" onClick={handleNext} loading={isSubmitting} style={{ minWidth: 140 }}>
              Complete Setup
            </Button>
          )}
        </div>
      </Form>
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        `}
      </style>
    </div>
  );
};

export default CreateClient; 