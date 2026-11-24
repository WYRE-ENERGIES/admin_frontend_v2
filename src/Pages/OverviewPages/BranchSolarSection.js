import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Button,
  Row,
  Col,
  Card,
  Switch,
  Typography,
  Tag,
  Space,
  Spin,
  Alert,
  message,
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { APIService } from '../../config/Api/apiServices';

const { Text } = Typography;

/**
 * Optional solar onboarding fields for branch create/update.
 *
 * Collects Deye station_id, fetches preview, and asks for
 * installed_battery_capacity (kWh) + installed_inverter_capacity (kVA).
 *
 * Form fields live under `solar.*`. The last fetch/preview is reported via
 * `onPreviewChange` so the parent can build the full solar payload.
 */
const BranchSolarSection = ({
  form,
  enabled: enabledProp,
  onEnabledChange,
  initialSolar = null,
  onPreviewChange,
}) => {
  const [enabled, setEnabled] = useState(Boolean(enabledProp ?? initialSolar?.station_id));
  const [fetching, setFetching] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const publishPreview = (next) => {
    setPreview(next);
    onPreviewChange?.(next);
  };

  useEffect(() => {
    if (!initialSolar?.station_id) return;

    setEnabled(true);
    form.setFieldsValue({
      solar: {
        station_id: initialSolar.station_id,
        installed_battery_capacity: initialSolar.installed_battery_capacity ?? null,
        installed_inverter_capacity: initialSolar.installed_inverter_capacity ?? null,
      },
    });

    // Seed a lightweight preview from the existing branch solar object
    // so submit can still work without a re-fetch.
    publishPreview({
      product_name: 'deye',
      station_id: initialSolar.station_id,
      station_info: {
        name: initialSolar.name || '',
        installed_capacity: initialSolar.installed_capacity ?? null,
        installed_battery_capacity: initialSolar.installed_battery_capacity ?? null,
        installed_inverter_capacity: initialSolar.installed_inverter_capacity ?? null,
      },
      devices: [],
      device_count: 0,
      fromExisting: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSolar?.station_id]);

  useEffect(() => {
    if (typeof enabledProp === 'boolean') {
      setEnabled(enabledProp);
      if (!enabledProp) {
        publishPreview(null);
        setFetchError(null);
        form.setFieldsValue({ solar: undefined });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledProp]);

  const handleToggle = (checked) => {
    setEnabled(checked);
    onEnabledChange?.(checked);
    if (!checked) {
      publishPreview(null);
      setFetchError(null);
      form.setFieldsValue({ solar: undefined });
    }
  };

  const handleFetchStation = async () => {
    const stationId = String(form.getFieldValue(['solar', 'station_id']) || '').trim();
    if (!stationId) {
      message.warning('Enter a Deye Station ID first.');
      return;
    }

    setFetching(true);
    setFetchError(null);
    try {
      const response = await APIService.get(`/api/v1/solar/stations/deye/${stationId}/`);
      const data = response?.data || {};

      if (data?.error) {
        setFetchError(data.error);
        publishPreview(null);
        message.error(data.error);
        return;
      }

      const stationInfo = data.station_info || {};
      const nextPreview = {
        ...data,
        station_info: stationInfo,
        devices: Array.isArray(data.devices) ? data.devices : [],
        device_count: data.device_count ?? (Array.isArray(data.devices) ? data.devices.length : 0),
        fromExisting: false,
      };
      publishPreview(nextPreview);

      // Prefill capacities from fetch only when not null (already onboarded).
      const current = form.getFieldValue('solar') || {};
      form.setFieldsValue({
        solar: {
          ...current,
          station_id: data.station_id || stationId,
          installed_battery_capacity:
            stationInfo.installed_battery_capacity != null
              ? stationInfo.installed_battery_capacity
              : current.installed_battery_capacity ?? null,
          installed_inverter_capacity:
            stationInfo.installed_inverter_capacity != null
              ? stationInfo.installed_inverter_capacity
              : current.installed_inverter_capacity ?? null,
        },
      });

      message.success(
        data.branch_id
          ? 'Station found (already onboarded). Capacities prefilled where available.'
          : 'Station preview loaded. Enter battery and inverter capacities below.'
      );
    } catch (error) {
      const errMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to fetch Deye station.';
      setFetchError(errMsg);
      publishPreview(null);
      message.error(errMsg);
    } finally {
      setFetching(false);
    }
  };

  return (
    <Card
      size="small"
      title={
        <Space>
          <span>Solar (optional)</span>
          <Switch
            checked={enabled}
            onChange={handleToggle}
            checkedChildren="On"
            unCheckedChildren="Off"
          />
        </Space>
      }
      style={{ marginTop: 16, background: enabled ? '#faf8ff' : undefined }}
    >
      {!enabled ? (
        <Text type="secondary">
          Turn on to attach a Deye solar station to this branch. PV size comes from Deye;
          battery (kWh) and inverter (kVA) are entered manually.
        </Text>
      ) : (
        <>
          <Row gutter={12} align="bottom">
            <Col xs={24} sm={14} md={12}>
              <Form.Item
                label="Deye Station ID"
                name={['solar', 'station_id']}
                rules={[{ required: true, message: 'Station ID is required when solar is enabled' }]}
                style={{ marginBottom: 12 }}
              >
                <Input placeholder="e.g. 62508474" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={10} md={8} style={{ marginBottom: 12 }}>
              <Button
                type="default"
                icon={preview ? <ReloadOutlined /> : <SearchOutlined />}
                loading={fetching}
                onClick={handleFetchStation}
                block
              >
                {preview ? 'Re-fetch preview' : 'Fetch station'}
              </Button>
            </Col>
          </Row>

          {fetching && (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <Spin tip="Fetching station from Deye…" />
            </div>
          )}

          {fetchError && (
            <Alert
              type="error"
              showIcon
              message="Station fetch failed"
              description={fetchError}
              style={{ marginBottom: 12 }}
            />
          )}

          {preview && !fetching && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 12 }}
              message={
                <Space wrap>
                  <Text strong>{preview.station_info?.name || 'Station'}</Text>
                  {preview.branch_id && <Tag color="orange">Already onboarded</Tag>}
                  {preview.fromExisting && <Tag>Existing on branch</Tag>}
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">
                    PV capacity: {preview.station_info?.installed_capacity ?? '—'} kWp
                    {' · '}
                    Devices: {preview.device_count ?? preview.devices?.length ?? 0}
                  </Text>
                  {preview.station_info?.address && (
                    <Text type="secondary">{preview.station_info.address}</Text>
                  )}
                </Space>
              }
            />
          )}

          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Installed Battery Capacity (kWh)"
                name={['solar', 'installed_battery_capacity']}
                extra="Not from Deye. Used for SOC / capacity alerts."
                style={{ marginBottom: 8 }}
              >
                <InputNumber
                  placeholder="e.g. 120"
                  style={{ width: '100%' }}
                  min={0}
                  step={0.1}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Installed Inverter Capacity (kVA)"
                name={['solar', 'installed_inverter_capacity']}
                extra="Not from Deye. Leave blank to keep load-utilisation alerts off."
                style={{ marginBottom: 8 }}
              >
                <InputNumber
                  placeholder="e.g. 100"
                  style={{ width: '100%' }}
                  min={0}
                  step={0.1}
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}
    </Card>
  );
};

/**
 * Build the `solar` object for branch create/update payloads.
 * Returns null when solar is disabled / no station_id.
 */
export const buildSolarPayload = (solarValues, preview = null) => {
  if (!solarValues || typeof solarValues !== 'object') return null;

  const stationId = String(solarValues.station_id || '').trim();
  if (!stationId) return null;

  const battery =
    solarValues.installed_battery_capacity === undefined ||
    solarValues.installed_battery_capacity === null ||
    solarValues.installed_battery_capacity === ''
      ? 0
      : Number(solarValues.installed_battery_capacity);

  const inverter =
    solarValues.installed_inverter_capacity === undefined ||
    solarValues.installed_inverter_capacity === null ||
    solarValues.installed_inverter_capacity === ''
      ? null
      : Number(solarValues.installed_inverter_capacity);

  const stationInfoFromPreview = preview?.station_info || null;

  const station_info = stationInfoFromPreview
    ? {
        ...stationInfoFromPreview,
        installed_battery_capacity: battery,
        installed_inverter_capacity: inverter,
      }
    : undefined;

  const payload = {
    product_name: preview?.product_name || 'deye',
    station_id: stationId,
    installed_battery_capacity: battery,
    installed_inverter_capacity: inverter,
  };

  if (station_info) {
    payload.station_info = station_info;
  }
  if (Array.isArray(preview?.devices) && preview.devices.length > 0) {
    payload.devices = preview.devices;
    payload.device_count = preview.device_count ?? preview.devices.length;
  }

  return payload;
};

/**
 * Surface solar success/failure from branch create (array) or update (object).
 */
export const notifySolarResult = (solarResult) => {
  if (!solarResult) return;

  const items = Array.isArray(solarResult) ? solarResult : [solarResult];
  items.forEach((entry) => {
    if (!entry) return;
    if (entry.status) {
      message.success(entry.message || 'Solar station saved successfully.');
    } else {
      message.warning(
        entry.message ||
          entry.error ||
          'Branch saved but solar station was not created. You can retry from Solar Onboarding.'
      );
    }
  });
};

export default BranchSolarSection;
