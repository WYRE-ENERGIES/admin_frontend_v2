import React, { useState, useEffect } from 'react';
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
  Modal,
  Result
} from 'antd';
import { MinusCircleOutlined, PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { APIService } from '../../config/Api/apiServices';
import { notification } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

// --- Constants for Select Options ---
const LOCAL_STORAGE_KEY = 'createClientFormData_Raw';
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
const FUEL_TYPES = ["diesel", "gas", "other"]; // Add more if needed
const USER_ROLES = [
  { id: 3, name: 'CLIENT_ADMIN' },
  { id: 4, name: 'OPERATOR' },
  { id: 5, name: 'VIEWER' },
  // SUPERADMIN and ADMIN are likely not assignable here
];

// --- ADD THESE DEFINITIONS ---
const initialDeviceForm = { name: '', type: null, provider: null, deviceId: '', isLoad: false, isSource: false, genSize: null, fuelType: null };
const initialBranchForm = { name: '', address: '', email: '', devices: [initialDeviceForm] }; // Branch starts with one initial device structure
const initialUserForm = { username: '', firstName: '', lastName: '', email: '', phoneNumber: '', password: '', role: null };
const initialEmailForm = { email: '' };
// --- END ADDITIONS ---

// --- Transformation Functions ---

// Transforms raw Ant Design Form values into the API payload structure
const transformFormToApi = (values = {}) => {
  // Helper to safely access properties
  const get = (obj, path, defaultValue = null) => path.reduce((a, c) => (a && a[c] ? a[c] : defaultValue), obj);

  return {
    name: values.clientName || null,
    client_type: values.clientType || null,
    phone_number: values.clientPhoneNumber || null,
    email: values.clientEmail || null,
    address: values.clientAddress || null,
    additional_emails: values.additionalEmails
      ?.map(item => item?.email)
      ?.filter(Boolean) || [],
    main_user: {
      username: values.mainUsername || null,
      first_name: values.mainFirstName || null,
      last_name: values.mainLastName || null,
      email: values.mainEmail || null,
      phone_number: values.mainPhoneNumber || null,
      password: values.mainPassword || null,
      roles: 3 // Fixed role
    },
    branches: (values.branches || [])
      .filter(branch => branch && branch.name) // Filter out empty/removed branches early
      .map(branch => ({
        name: branch.name || null,
        address: branch.address || null,
        email: branch.email || null,
        devices: (branch.devices || [])
          .filter(device => device && device.name && device.type && device.provider && device.deviceId) // Filter devices
          .map(device => ({
            name: device.name || null,
            type: device.type || null,
            is_load: !!device.isLoad,
            is_source: !!device.isSource,
            provider: device.provider || null,
            device_id: device.deviceId || null,
            ...(device.type === 1 ? {
                gen_size: device.genSize ?? null,
                fuel_type: device.fuelType ?? null,
              } : {}),
          }))
      })),
    additional_users: (values.additionalUsers || [])
       .filter(user => user && user.username && user.email && user.password && user.role) // Filter users
       .map(user => ({
          username: user.username || null,
          first_name: user.firstName || null,
          last_name: user.lastName || null,
          email: user.email || null,
          phone_number: user.phoneNumber || null,
          password: user.password || null,
          roles: user.role || null
      }))
  };
};

// Transforms API structure (or localStorage data) back into the Form structure
const transformApiToForm = (apiValues = {}) => {
  return {
      clientName: apiValues.name || '',
      clientType: apiValues.client_type || null,
      clientPhoneNumber: apiValues.phone_number || '',
      clientEmail: apiValues.email || '',
      clientAddress: apiValues.address || '',
      // Transform array of strings back to array of objects for Form.List
      additionalEmails: (apiValues.additional_emails || []).map(email => ({ email: email || '' })),
      // Flatten main user details
      mainUsername: apiValues.main_user?.username || '',
      mainFirstName: apiValues.main_user?.first_name || '',
      mainLastName: apiValues.main_user?.last_name || '',
      mainEmail: apiValues.main_user?.email || '',
      mainPhoneNumber: apiValues.main_user?.phone_number || '',
      mainPassword: apiValues.main_user?.password || '',
      // Branches and Devices map directly if keys match, ensure defaults if needed
      branches: (apiValues.branches || []).map(branch => ({
          name: branch.name || '',
          address: branch.address || '',
          email: branch.email || '',
          // Ensure devices array exists and map device fields
          devices: (branch.devices || []).map(device => ({
              name: device.name || '',
              type: device.type || null,
              provider: device.provider || null,
              deviceId: device.device_id || '', // Note the key difference
              isLoad: !!device.is_load, // Note the key difference
              isSource: !!device.is_source, // Note the key difference
              genSize: device.gen_size ?? null,
              fuelType: device.fuel_type ?? null,
          })),
      })),
      // Additional users map directly if keys match form field names
       additionalUsers: (apiValues.additional_users || []).map(user => ({
          username: user.username || '',
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          email: user.email || '',
          phoneNumber: user.phone_number || '',
          password: user.password || '',
          role: user.roles || null // Note the key difference 'roles' vs 'role'
      })),
  };
};

// --- DeviceFields Component (Paste the code from step 1 here) ---
const DeviceFields = ({ deviceKey, deviceName, branchName, deviceRestField, form }) => {
  // Correctly use branchName (branch index) and deviceName (device index) in the path
  const deviceType = Form.useWatch(['branches', branchName, 'devices', deviceName, 'type'], form);

  return (
    <Card key={deviceKey} size="small" style={{ marginBottom: 10, background: '#fafafa' }}>
      <Row gutter={16} align="middle">
          <Col flex="auto">
              <Text strong>Device {deviceKey + 1}</Text>
          </Col>
          <Col>
              {/* Note: removeDevice function is passed down or handled differently if needed here */}
              {/* We'll keep the remove button in the main map for simplicity */}
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
        {/* Conditional Fields based on the watched deviceType */}
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
  const [form] = Form.useForm(); // Get form instance
  const [currentStep, setCurrentStep] = useState(0);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false); // Track if localStorage is loaded
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [createdClientData, setCreatedClientData] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  // --- Load from LocalStorage on Mount (Raw Form Structure) ---
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    let loadedFormValues = {};
    if (savedData) {
      try {
        loadedFormValues = JSON.parse(savedData);
        console.log('Loaded RAW form data from localStorage:', loadedFormValues);
      } catch (error) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
    // Merge loaded data with defaults
    const merged = {
      clientName: '',
      clientType: null,
      clientPhoneNumber: '',
      clientEmail: '',
      clientAddress: '',
      additionalEmails: [],
      mainUsername: '',
      mainFirstName: '',
      mainLastName: '',
      mainEmail: '',
      mainPhoneNumber: '',
      mainPassword: '',
      branches: [initialBranchForm],
      additionalUsers: [],
      ...loadedFormValues, // loaded values override defaults
    };
    // Ensure each branch has at least one device
    merged.branches.forEach(branch => {
      if (!Array.isArray(branch.devices) || branch.devices.length === 0) {
        branch.devices = [initialDeviceForm];
      }
    });
    form.setFieldsValue(merged);
    setInitialDataLoaded(true);
  }, [form]);

  // --- Save RAW FORM DATA to LocalStorage on Change ---
  const handleValuesChange = (changedValues, allValues) => {
     if (!initialDataLoaded) {
        return;
     }
    try {
        // Save the raw form values directly
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allValues));
    } catch (error) {
        console.error("Failed to save to localStorage:", error);
        message.warning("Could not save form progress. LocalStorage might be full.")
    }
  };

  // --- Helper for Notifications ---
  const openNotification = ({ type, message, description }) => {
    notification[type]({
      message,
      description,
      placement: 'topRight',
      duration: 5,
    });
  };

  // --- API Payload Transformation and Submission ---
  const handleFinalSubmit = async (values) => {
    setIsSubmitting(true);
    const apiPayload = transformFormToApi(values);
    console.log('Transformed API Payload for Submission:', apiPayload);
    message.loading({ content: 'Creating client...', key: 'createClient', duration: 0 });
    try {
      const response = await APIService.post('/api/v1/accounts/create_client_with_details/', apiPayload);
      console.log('API Success Response:', response.data);
      if (response.data && response.data.status === true) {
        const created = response.data.data || {};
        message.success({ content: 'Client created successfully!', key: 'createClient', duration: 2 });
        openNotification({
          type: 'success',
          message: `Client "${created.client_name || 'N/A'}" Created`,
          description: `Client ID: ${created.client_id || 'N/A'} | Branches: ${created.branches_count || 0} | Users: ${created.users_count || 0}`
        });
        setCreatedClientData(created);
        setSuccessModalVisible(true);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        form.resetFields();
        setInitialDataLoaded(false);
        setCurrentStep(0);
        form.setFieldsValue({ branches: [initialBranchForm], additionalUsers: [], additionalEmails: [] });
        setInitialDataLoaded(true);
        navigate('/clients');
      } else {
        throw new Error(response.data?.message || 'API indicated failure but provided no message.');
      }
    } catch (error) {
      console.error('API Error:', error);
      let errorMessage = 'Failed to create client. Please check your connection and try again.';
      let errorFields = [];
      let errorDetails = '';
      // Helper to flatten nested error objects
      const flattenErrors = (errors, parentKey = '') => {
        let messages = [];
        Object.entries(errors).forEach(([key, value]) => {
          const fullKey = parentKey ? `${parentKey}.${key}` : key;
          if (Array.isArray(value)) {
            value.forEach(msg => messages.push(`${msg}`));
          } else if (typeof value === 'object' && value !== null) {
            messages = messages.concat(flattenErrors(value, fullKey));
          } else {
            messages.push(`${value}`);
          }
        });
        return messages;
      };
      // Try to extract backend error details
      if (error.response) {
        if (typeof error.response.data === 'string' && error.response.data.includes('duplicate key value')) {
          errorMessage = 'Username already exists. Please choose a different username.';
        } else if (error.response.data && typeof error.response.data.message === 'string') {
          errorMessage = error.response.data.message;
        } 
        if (error.response.data && typeof error.response.data.errors === 'object') {
          errorMessage = 'Please fix the validation errors highlighted below.';
          errorFields = Object.entries(error.response.data.errors).map(([key, value]) => ({
            name: mapApiErrorToFormField(key),
            errors: Array.isArray(value) ? value : [String(value)],
          }));
          // Use the recursive flattenErrors function
          errorDetails = flattenErrors(error.response.data.errors).join('\n');
          form.setFields(errorFields);
        }
        openNotification({
          type: 'error',
          message: 'Error Creating Client',
          description: errorDetails || errorMessage // Show detailed errors if available
        });
      } else if (error.request) {
        errorMessage = 'No response received from the server. Check network connection.';
        openNotification({
          type: 'error',
          message: 'Network Error',
          description: errorMessage
        });
      } else {
        errorMessage = `Request setup error: ${error.message}`;
        openNotification({
          type: 'error',
          message: 'Error Creating Client',
          description: errorMessage
        });
      }
      message.error({ content: errorMessage, key: 'createClient', duration: 5 });
      if (errorFields.length > 0) {
        const firstErrorPath = errorFields[0].name;
        const errorStepIndex = steps.findIndex(step => step.fieldsToValidate.some(vf => Array.isArray(vf) ? JSON.stringify(firstErrorPath).startsWith(JSON.stringify(vf)) : vf === firstErrorPath[0]));
        if (errorStepIndex !== -1 && errorStepIndex !== currentStep) { setCurrentStep(errorStepIndex); }
      }
    } finally {
      setIsSubmitting(false);
      message.destroy('createClient');
    }
  };

  // --- onFinish ---
  const onFinish = (values) => {
    console.log('Form Values:', values); // <-- Debug: See what the form actually returns
    // Early return if required fields are missing
    if (!values.clientName || !values.clientType || !values.clientPhoneNumber || !values.mainUsername || !values.mainFirstName || !values.mainLastName || !values.mainEmail || !values.mainPhoneNumber || !values.mainPassword) {
      message.error('Please fill in all required fields.');
      return;
    }
    handleFinalSubmit(values);
  };

  // --- onFinishFailed ---
  const onFinishFailed = (errorInfo) => {
    console.log('Validation Failed:', errorInfo);
    const firstErrorStep = steps.findIndex(step =>
        errorInfo.errorFields.some(errorField =>
            step.fieldsToValidate.some(vf =>
                JSON.stringify(errorField.name).startsWith(JSON.stringify(vf)) ||
                step.fieldsToValidate.includes(errorField.name[0])
            )
        )
    );
    if (firstErrorStep !== -1 && firstErrorStep !== currentStep) {
        setCurrentStep(firstErrorStep);
         message.error(`Please fix the errors in the '${steps[firstErrorStep].title}' step.`);
    } else {
        message.error('Please fill in all required fields correctly.');
    }
  };

  // --- Steps Definition ---
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
            <Col xs={24} sm={12} md={16}>
              <Form.Item label="Address" name="clientAddress">
                <Input.TextArea rows={1} placeholder="Enter client address" />
              </Form.Item>
            </Col>
          </Row>
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
                  <Row gutter={16} align="middle"> <Col flex="auto"><Title level={5}>Branch {branchKey + 1}</Title></Col> <Col><MinusCircleOutlined style={{ fontSize: '18px', color: 'red' }} onClick={() => removeBranch(branchName)} /></Col> </Row>
                  <Row gutter={16}> <Col xs={24} md={8}><Form.Item {...branchRestField} label="Branch Name" name={[branchName, 'name']} rules={[{ required: true, message: '${label} is required!' }]}><Input placeholder="Branch Name" /></Form.Item></Col> <Col xs={24} md={8}><Form.Item {...branchRestField} label="Branch Email" name={[branchName, 'email']} rules={[{ type: 'email', message: 'Invalid ${label}!' }]}><Input placeholder="Branch Email" /></Form.Item></Col> <Col xs={24} md={8}><Form.Item {...branchRestField} label="Branch Address" name={[branchName, 'address']}><Input placeholder="Branch Address" /></Form.Item></Col> </Row>
                  <Divider style={{ margin: '12px 0' }}>Devices</Divider>
                  <Form.List {...branchRestField} name={[branchName, 'devices']}>
                    {(deviceFields, { add: addDevice, remove: removeDevice }) => (
                      <div style={{ marginLeft: '20px', marginBottom: '15px' }}> {deviceFields.map(({ key: deviceKey, name: deviceName, ...deviceRestField }) => (
                        <Row key={deviceKey} gutter={8} align="top" style={{ marginBottom: '5px' }}> <Col flex="auto"><DeviceFields deviceKey={deviceKey} deviceName={deviceName} branchName={branchName} deviceRestField={deviceRestField} form={form} /></Col> <Col style={{ paddingTop: '8px' }}><MinusCircleOutlined style={{ color: 'red', fontSize: '16px' }} onClick={() => removeDevice(deviceName)} /></Col> </Row>
                      ))} <Button type="dashed" onClick={() => addDevice(initialDeviceForm)} block icon={<PlusOutlined />} style={{marginTop: '10px'}}>Add Device</Button> </div>
                    )}
                  </Form.List>
                </Card>
              ))} <Button type="dashed" onClick={() => addBranch(initialBranchForm)} block icon={<PlusOutlined />}>Add Branch</Button> </>
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
                    <Row gutter={16} align="middle"> <Col flex="auto"><Text strong>User {userKey + 1}</Text></Col> <Col><MinusCircleOutlined style={{ color: 'red' }} onClick={() => removeUser(userName)} /></Col> </Row>
                   <Row gutter={16}> <Col xs={24} sm={12} md={6}><Form.Item {...userRestField} label="Username" name={[userName, 'username']} rules={[{ required: true, message: '${label} is required!' }]}><Input placeholder="Username" /></Form.Item></Col> <Col xs={24} sm={12} md={6}><Form.Item {...userRestField} label="First Name" name={[userName, 'firstName']}><Input placeholder="First Name" /></Form.Item></Col> <Col xs={24} sm={12} md={6}><Form.Item {...userRestField} label="Last Name" name={[userName, 'lastName']}><Input placeholder="Last Name" /></Form.Item></Col> <Col xs={24} sm={12} md={6}><Form.Item {...userRestField} label="Email" name={[userName, 'email']} rules={[{ type: 'email', required: true, message: 'Valid ${label} is required!' }]}><Input placeholder="Email" /></Form.Item></Col> <Col xs={24} sm={12} md={6}><Form.Item {...userRestField} label="Phone Number" name={[userName, 'phoneNumber']}><Input placeholder="Phone Number" /></Form.Item></Col> <Col xs={24} sm={12} md={6}><Form.Item {...userRestField} label="Password" name={[userName, 'password']} rules={[{ required: true, message: '${label} is required!' }]}><Input.Password placeholder="Password" /></Form.Item></Col> <Col xs={24} sm={12} md={6}><Form.Item {...userRestField} label="Role" name={[userName, 'role']} rules={[{ required: true, message: 'Please select a ${label}!' }]}><Select placeholder="Select Role">{USER_ROLES.map(role => <Option key={role.id} value={role.id}>{role.name}</Option>)}</Select></Form.Item></Col> </Row>
                 </Card>
              ))} <Button type="dashed" onClick={() => addUser(initialUserForm)} block icon={<PlusOutlined />}>Add Additional User</Button> </>
            )}
          </Form.List>
        </>
      ),
       fieldsToValidate: ['additionalUsers'],
    },
  ];

  // --- Navigation Logic ---
  const handleNext = () => {
    let fieldsToValidatePaths = steps[currentStep].fieldsToValidate;
     if (currentStep === 2) { /* ... granular branch/device validation ... */
        const branches = form.getFieldValue('branches') || [];
        fieldsToValidatePaths = branches.flatMap((branch, branchIndex) => {
            if (!branch) return [];
            return [
                ['branches', branchIndex, 'name'],
                ...(branch.devices || []).flatMap((device, deviceIndex) => {
                    if (!device) return [];
                     const basePaths = [ /* ... device paths ... */
                         ['branches', branchIndex, 'devices', deviceIndex, 'name'], ['branches', branchIndex, 'devices', deviceIndex, 'type'],
                         ['branches', branchIndex, 'devices', deviceIndex, 'provider'], ['branches', branchIndex, 'devices', deviceIndex, 'deviceId'],
                     ];
                     if (device.type === 1) { /* ... generator paths ... */
                         basePaths.push( ['branches', branchIndex, 'devices', deviceIndex, 'genSize'], ['branches', branchIndex, 'devices', deviceIndex, 'fuelType'] );
                     } return basePaths; })]; });
     } else if (currentStep === 3) { /* ... granular user validation ... */
          const users = form.getFieldValue('additionalUsers') || [];
          fieldsToValidatePaths = users.flatMap((user, userIndex) => {
              if (!user) return [];
              return [ /* ... user paths ... */
                    ['additionalUsers', userIndex, 'username'], ['additionalUsers', userIndex, 'email'],
                    ['additionalUsers', userIndex, 'password'], ['additionalUsers', userIndex, 'role'],
              ]; });
     }
    form.validateFields(fieldsToValidatePaths)
      .then(() => { setCurrentStep(currentStep + 1); })
      .catch(info => {
        console.log('Validate Failed:', info);
        const firstErrorField = info.errorFields?.[0]?.name?.join('.') || 'fields';
        message.warning(`Please complete the required ${firstErrorField} for this step.`);
      });
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  // --- Modal Close Handler ---
  const handleSuccessModalClose = () => {
    setSuccessModalVisible(false); setCreatedClientData(null);
    form.resetFields(); setInitialDataLoaded(false); setCurrentStep(0);
    form.setFieldsValue({ branches: [initialBranchForm], additionalUsers: [], additionalEmails: [] });
    setInitialDataLoaded(true); navigate('/clients');
  };

  // --- Map API Errors ---
  const mapApiErrorToFormField = (apiKey) => {
    const parts = apiKey.split('.');
    if (apiKey.startsWith('main_user.')) return [apiKey.replace('main_user.', 'main')];
    if (apiKey.startsWith('additional_users.')) {
        const [, index, field] = parts;
        const formField = field === 'roles' ? 'role' : field;
        return ['additionalUsers', parseInt(index, 10), formField];
    }
    if (apiKey.startsWith('branches.')) {
        const [, branchIndex, keyOrDevices, deviceIndex, deviceField] = parts;
        if (keyOrDevices === 'devices') {
            const formDeviceField = deviceField === 'device_id' ? 'deviceId' : deviceField === 'is_load' ? 'isLoad' : deviceField === 'is_source' ? 'isSource' : deviceField === 'fuel_type' ? 'fuelType' : deviceField === 'gen_size' ? 'genSize' : deviceField;
            return ['branches', parseInt(branchIndex, 10), 'devices', parseInt(deviceIndex, 10), formDeviceField];
        } else {
            return ['branches', parseInt(branchIndex, 10), keyOrDevices];
        }
    }
    const formKey = apiKey === 'name' ? 'clientName' : apiKey === 'client_type' ? 'clientType' : apiKey === 'phone_number' ? 'clientPhoneNumber' : apiKey === 'email' ? 'clientEmail' : apiKey === 'address' ? 'clientAddress' : apiKey;
    return [formKey];
  };

  // Render null until initial data is loaded to prevent flicker/errors
  if (!initialDataLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <div style={{ margin: '30px' }}>
      <Title level={2} style={{ marginBottom: '30px' }}>Create New Client</Title>
      <Form
        form={form}
        name="create_client_wizard"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
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
            <Button type="primary" onClick={handleNext} style={{ minWidth: 120 }}>
              Next
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button type="primary" htmlType="submit" loading={isSubmitting} style={{ minWidth: 140 }}>
              Create Client
            </Button>
          )}
        </div>
      </Form>
      {/* Success Modal */}
      <Modal title="Client Creation Successful" visible={successModalVisible} onOk={handleSuccessModalClose} onCancel={handleSuccessModalClose} footer={[ <Button key="ok" type="primary" onClick={handleSuccessModalClose}> OK </Button>, ]}>
        {createdClientData && ( <Result status="success" title={`Successfully Created Client: ${createdClientData.client_name || 'N/A'}`} subTitle={`Client ID: ${createdClientData.client_id || 'N/A'}. Branches: ${createdClientData.branches_count || 0}, Users: ${createdClientData.users_count || 0}.`} /> )}
      </Modal>
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