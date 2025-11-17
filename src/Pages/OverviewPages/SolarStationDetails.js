import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  notification,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { fetchSolarStationDetails, updateSolarDevice } from '../../redux/actions/solar/solar.action';

const { Title, Text } = Typography;

const statusColors = {
  online: 'green',
  offline: 'orange',
  fault: 'red',
};

const deviceTypeOptions = [
  { label: 'Battery', value: 'BATTERY' },
  { label: 'Inverter', value: 'INVERTER' },
  { label: 'Collector', value: 'COLLECTOR' },
  { label: 'Meter', value: 'METER' },
];

const deviceStatusOptions = [
  { label: 'Online', value: 'online' },
  { label: 'Offline', value: 'offline' },
  { label: 'Fault', value: 'fault' },
];

const SolarStationDetails = ({
  solar: {
    stationDetails: details,
    stationDevices: devices = [],
    stationDetailsLoading: loading,
    stationDetailsRefreshing: refreshing,
    updateDeviceLoading: savingDevice,
  },
  fetchSolarStationDetails: fetchDetailsAction,
  updateSolarDevice: updateDeviceAction,
}) => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [editingDevice, setEditingDevice] = useState(null);
  const [form] = Form.useForm();
  const [deviceFormValues, setDeviceFormValues] = useState(null);

  const deriveFormValues = useCallback((device) => ({
    serial: device?.serial ?? device?.device_sn ?? '',
    model: device?.model ?? '',
    device_type: device?.device_type ?? device?.type ?? undefined,
    capacity_kwp: device?.capacity_kwp ?? device?.capacity ?? 0,
    status: device?.status ?? device?.connect_status ?? undefined,
    is_active: Boolean(device?.is_active ?? (typeof device?.status === 'string' ? device.status.toLowerCase() === 'online' : device?.is_active)),
  }), []);

  const stationSummary = useMemo(() => ({
    branch: details?.branch ?? {},
    station: details?.station ?? {},
    count: details?.count ?? 0,
  }), [details]);

  const fetchDetails = useCallback(async (showLoader = true) => {
    if (!branchId) {
      notification.error({
        message: 'Missing Branch ID',
        description: 'A valid branch identifier is required to load station details.',
      });
      navigate(-1);
      return;
    }

    const result = await fetchDetailsAction(branchId, { silent: !showLoader });
    if (!result?.fulfilled) {
      notification.error({
        message: 'Failed to Load Details',
        description: result?.message || 'Could not fetch the station details. Please try again later.',
      });
      navigate(-1);
    }
  }, [branchId, fetchDetailsAction, navigate]);

  useEffect(() => {
    fetchDetails(true);
  }, [fetchDetails]);

  const handleEditDevice = (device) => {
    setEditingDevice(device);
    const mappedValues = deriveFormValues(device);
    setDeviceFormValues(mappedValues);
    form.setFieldsValue(mappedValues);
  };

  useEffect(() => {
    if (editingDevice) {
      const mappedValues = deriveFormValues(editingDevice);
      setDeviceFormValues(mappedValues);
      form.setFieldsValue(mappedValues);
    } else {
      setDeviceFormValues(null);
      form.resetFields();
    }
  }, [editingDevice, form, deriveFormValues]);

  const closeModal = () => {
    setEditingDevice(null);
  };

  const handleUpdateDevice = async () => {
    try {
      const values = await form.validateFields();
      if (!editingDevice?.id) {
        notification.error({
          message: 'Device Identifier Missing',
          description: 'Unable to determine which device to update.',
        });
        return;
      }

      const payload = {
        ...values,
        capacity_kwp: Number(values.capacity_kwp ?? 0),
      };

      const result = await updateDeviceAction(editingDevice.id, payload);
      if (!result?.fulfilled) {
        notification.error({
          message: 'Update Failed',
        description: result?.message || 'Could not update the device. Please try again.',
        });
        return;
      }

      notification.success({
        message: 'Device Updated',
        description: 'Solar device updated successfully.',
      });

      closeModal();
      fetchDetails(false);
    } catch (error) {
      if (error?.errorFields) {
        return;
      }
      notification.error({
        message: 'Update Failed',
        description: 'Could not update the device. Please try again.',
      });
    }
  };

  const activeDevices = useMemo(
    () => devices.filter((device) => device?.is_active),
    [devices]
  );

  const tableColumns = [
    {
      title: 'Serial Number',
      dataIndex: 'serial',
      key: 'serial',
    },
    {
      title: 'Type',
      dataIndex: 'device_type',
      key: 'device_type',
      render: (value) => value || 'N/A',
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
      render: (value) => value || '—',
    },
    {
      title: 'Capacity (kWp)',
      dataIndex: 'capacity_kwp',
      key: 'capacity_kwp',
      render: (value) => (value !== null && value !== undefined ? value : '—'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value) => (
        <Tag color={statusColors[value] || 'default'} style={{ textTransform: 'capitalize' }}>
          {value || 'unknown'}
        </Tag>
      ),
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (value) => (
        <Tag color={value ? 'green' : 'red'}>{value ? 'Yes' : 'No'}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button icon={<EditOutlined />} type="link" onClick={() => handleEditDevice(record)}>
          Edit
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ margin: 30 }}>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Back
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            {stationSummary.station?.name || 'Solar Station Details'}
          </Title>
          <Button onClick={() => fetchDetails(false)} loading={refreshing}>
            Refresh
          </Button>
        </Space>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Branch Information" style={{ height: '100%' }}>
              <Descriptions column={1} bordered={false} size="small">
                <Descriptions.Item label="Name">{stationSummary.branch?.name || '—'}</Descriptions.Item>
                <Descriptions.Item label="Client">{stationSummary.branch?.client_name || '—'}</Descriptions.Item>
                <Descriptions.Item label="Address">{stationSummary.branch?.address || '—'}</Descriptions.Item>
                <Descriptions.Item label="Active">
                  <Tag color={stationSummary.branch?.is_active ? 'green' : 'red'}>
                    {stationSummary.branch?.is_active ? 'Yes' : 'No'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Station Information" style={{ height: '100%' }}>
              <Descriptions column={1} bordered={false} size="small">
                <Descriptions.Item label="Station ID">{stationSummary.station?.deye_station_id || stationSummary.station?.id || '—'}</Descriptions.Item>
                <Descriptions.Item label="Address">{stationSummary.station?.address || '—'}</Descriptions.Item>
                <Descriptions.Item label="Installed Capacity (kWp)">
                  {stationSummary.station?.installed_capacity_kwp ?? stationSummary.station?.installed_capacity ?? '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Coordinates">
                  {stationSummary.station?.latitude && stationSummary.station?.longitude
                    ? `${stationSummary.station.latitude}, ${stationSummary.station.longitude}`
                    : '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Created At">{stationSummary.station?.created_at ? new Date(stationSummary.station.created_at).toLocaleString() : '—'}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        <Card
          title={<Space><Title level={4} style={{ margin: 0 }}>Devices</Title><Tag color="blue">Active: {activeDevices.length}</Tag></Space>}
          extra={
            <Text type="secondary">
              Total devices: {devices.length} | Active: {activeDevices.length}
            </Text>
          }
        >
          <Table
            dataSource={devices}
            columns={tableColumns}
            rowKey={(record) => record.id || record.serial}
            pagination={{ pageSize: 10 }}
            locale={{
              emptyText: 'No devices found for this branch.',
            }}
          />
        </Card>
      </Space>

      <Modal
        title="Edit Device"
        open={Boolean(editingDevice)}
        onCancel={closeModal}
        onOk={handleUpdateDevice}
        confirmLoading={savingDevice}
        okText="Save"
        destroyOnClose
        forceRender
      >
        <Form
          layout="vertical"
          form={form}
          preserve={false}
          key={editingDevice?.id || 'device-form'}
          initialValues={deviceFormValues}
        >
          <Form.Item
            label="Serial Number"
            name="serial"
            rules={[{ required: true, message: 'Serial number is required.' }]}
          >
            <Input placeholder="Enter serial number" />
          </Form.Item>

          <Form.Item label="Model" name="model">
            <Input placeholder="Enter model" />
          </Form.Item>

          <Form.Item
            label="Device Type"
            name="device_type"
            rules={[{ required: true, message: 'Device type is required.' }]}
          >
            <Select options={deviceTypeOptions} placeholder="Select device type" allowClear showSearch optionFilterProp="label" />
          </Form.Item>

          <Form.Item label="Capacity (kWp)" name="capacity_kwp">
            <InputNumber style={{ width: '100%' }} min={0} step={0.1} placeholder="Enter capacity" />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Status is required.' }]}
          >
            <Select options={deviceStatusOptions} placeholder="Select status" allowClear showSearch optionFilterProp="label" />
          </Form.Item>

          <Form.Item label="Active" name="is_active" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const mapStateToProps = (state) => ({
  solar: state.solar,
});

const mapDispatchToProps = {
  fetchSolarStationDetails,
  updateSolarDevice,
};

export default connect(mapStateToProps, mapDispatchToProps)(SolarStationDetails);

