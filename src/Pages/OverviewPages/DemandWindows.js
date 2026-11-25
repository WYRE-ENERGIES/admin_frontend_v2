import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  TimePicker,
  Tooltip,
  Typography,
  notification,
} from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import jwtDecode from 'jwt-decode';
import { APIService } from '../../config/Api/apiServices';

const { Text, Title, Paragraph } = Typography;

const DAY_OPTIONS = [
  { label: 'Mon', value: 0 },
  { label: 'Tue', value: 1 },
  { label: 'Wed', value: 2 },
  { label: 'Thu', value: 3 },
  { label: 'Fri', value: 4 },
  { label: 'Sat', value: 5 },
  { label: 'Sun', value: 6 },
];

const SOURCE_LABELS = {
  solar: 'Solar',
  ems: 'EMS meters',
  both: 'Max of both',
};

const FORM_FIELDS = new Set([
  'label',
  'days_of_week',
  'start_time',
  'end_time',
  'threshold_kw',
  'demand_source',
  'is_enabled',
  'branch',
]);

const EMS_SOURCE_NAMES = new Set(['UTILITY', 'GENERATOR', 'IPP']);
const EMS_SOURCE_IDS = new Set([1, 2, 3]);

export const canManageDemandWindows = () => {
  try {
    const token = JSON.parse(localStorage.getItem('loggedWyreUserAdmin') || 'null');
    const fromToken = token?.access ? jwtDecode(token.access) : null;
    const stored = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const user = fromToken || stored;
    return String(user?.client_type || user?.clientType || '').toUpperCase() === 'WYRE';
  } catch {
    return false;
  }
};

const parseApiError = (error) => {
  const data = error?.response?.data;
  const fields = [];
  if (data?.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
    Object.entries(data.errors).forEach(([name, messages]) => {
      const list = (Array.isArray(messages) ? messages : [messages]).map(String);
      if (FORM_FIELDS.has(name)) {
        fields.push({ name, errors: list });
      }
    });
  }
  const message = (typeof data?.message === 'string' && data.message)
    || (typeof data?.detail === 'string' && data.detail)
    || (typeof data === 'string' && data)
    || error?.message
    || 'Something went wrong.';
  return { message, fields };
};

const normalizeDays = (value) => {
  const source = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];
  return source
    .map((day) => Number(String(day).trim()))
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6);
};

const formatDays = (value) => {
  const days = [...new Set(normalizeDays(value))].sort((a, b) => a - b);
  const key = days.join(',');
  if (!key) return '—';
  if (key === '0,1,2,3,4') return 'Weekdays';
  if (key === '5,6') return 'Weekend';
  if (key === '0,1,2,3,4,5,6') return 'Every day';
  return days.map((day) => DAY_OPTIONS[day].label).join(', ');
};

const clock = (value) => (value ? String(value).slice(0, 5) : '');

const isOvernight = (start, end) => {
  const startClock = clock(start);
  const endClock = clock(end);
  return Boolean(startClock && endClock && startClock > endClock);
};

const formatKw = (value) => (
  value == null || value === '' || Number.isNaN(Number(value)) ? '—' : `${Number(value)} kW`
);

const formatFiredDate = (value) => (value ? dayjs(value).format('D MMM YYYY') : '—');

const parseTime = (value) => (value ? dayjs(value, ['HH:mm:ss', 'HH:mm']) : null);

const deviceIsEmsSource = (device) => {
  const labels = [device?.type_name, device?.device_type_name, device?.type, device?.device_type];
  if (labels.some((label) => typeof label === 'string' && EMS_SOURCE_NAMES.has(label.trim().toUpperCase()))) {
    return true;
  }
  return [device?.type, device?.device_type, device?.type_id].some((id) => {
    if (typeof id === 'number') return EMS_SOURCE_IDS.has(id);
    if (typeof id === 'string' && /^\d+$/.test(id.trim())) return EMS_SOURCE_IDS.has(Number(id));
    return false;
  });
};

const extractStations = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.stations)) return data.stations;
  if (Array.isArray(data?.data?.stations)) return data.data.stations;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const stationBelongsToBranch = (station, branchId) => [
  station?.branch,
  station?.branch_id,
  station?.branchId,
].some((id) => id != null && String(id) === String(branchId));

const ruleToForm = (rule) => ({
  label: rule?.label || 'Demand window',
  days_of_week: normalizeDays(rule?.days_of_week).length
    ? normalizeDays(rule.days_of_week)
    : [0, 1, 2, 3, 4],
  start_time: parseTime(rule?.start_time),
  end_time: parseTime(rule?.end_time),
  threshold_kw: rule?.threshold_kw ?? null,
  demand_source: rule?.demand_source || undefined,
  is_enabled: rule?.is_enabled !== false,
});

const buildPayload = (values) => ({
  label: String(values.label || '').trim() || 'Demand window',
  days_of_week: normalizeDays(values.days_of_week),
  start_time: values.start_time.format('HH:mm'),
  end_time: values.end_time.format('HH:mm'),
  threshold_kw: Number(values.threshold_kw),
  demand_source: values.demand_source,
  is_enabled: values.is_enabled !== false,
});

const pickSource = (solarOff, emsOff) => {
  if (!solarOff && !emsOff) return 'both';
  if (!solarOff) return 'solar';
  if (!emsOff) return 'ems';
  return undefined;
};

function DayChips({ value = [], onChange }) {
  const selected = normalizeDays(value);
  const toggle = (day) => {
    const next = selected.includes(day)
      ? selected.filter((item) => item !== day)
      : [...selected, day];
    onChange?.(normalizeDays(next));
  };
  return (
    <div className="demand-day-chips">
      {DAY_OPTIONS.map((day) => {
        const checked = selected.includes(day.value);
        return (
          <button
            key={day.value}
            type="button"
            className={checked ? 'demand-day-chip is-on' : 'demand-day-chip'}
            aria-pressed={checked}
            onClick={() => toggle(day.value)}
          >
            {day.label}
          </button>
        );
      })}
    </div>
  );
}

function EnabledField({ checked, onChange }) {
  return (
    <div className="demand-enabled-row">
      <Switch checked={Boolean(checked)} onChange={onChange} />
      <div>
        <div className="demand-enabled-title">{checked ? 'On' : 'Off'}</div>
        <div className="demand-enabled-copy">
          {checked
            ? 'This window can send a live alert, and it is included in the Monday compliance mail.'
            : 'The rule stays saved. It does not send a live alert, and it is left out of the Monday mail.'}
        </div>
      </div>
    </div>
  );
}

const winnerLabel = (winner) => {
  if (winner === 'solar') return 'Solar';
  if (winner === 'ems') return 'EMS';
  return winner || '—';
};

function PreviewPanel({ preview, error, loading }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spin />
      </div>
    );
  }
  if (error) {
    return <Alert type="error" showIcon message="Preview failed" description={error} />;
  }
  if (!preview) {
    return (
      <Empty
        description="Preview a live alert or the Monday compliance mail. Nothing is sent."
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  const reading = preview.reading || {};
  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        message="Preview does not send email or push."
        description={`To ${preview.to || '—'} · Cc ${preview.cc || '—'}`}
      />
      <div>
        <Text type="secondary">{preview.kind === 'weekly' ? 'Weekly compliance' : 'Live alert'}</Text>
        <Title level={5} style={{ margin: '4px 0 0' }}>{preview.subject || 'Email preview'}</Title>
      </div>
      {preview.kind === 'weekly' ? (
        <Descriptions size="small" column={1} bordered>
          <Descriptions.Item label="Week">
            {preview.week_start || '—'} – {preview.week_end || '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Failed days">{preview.failed_days ?? '—'}</Descriptions.Item>
        </Descriptions>
      ) : (
        <Descriptions size="small" column={1} bordered>
          <Descriptions.Item label="Applies today">{preview.applies_today ? 'Yes' : 'No'}</Descriptions.Item>
          <Descriptions.Item label="Inside window">{preview.in_window ? 'Yes' : 'No'}</Descriptions.Item>
          <Descriptions.Item label="Would fire">{preview.would_fire ? 'Yes' : 'No'}</Descriptions.Item>
          <Descriptions.Item label="Solar">{formatKw(reading.solar_kw)}</Descriptions.Item>
          <Descriptions.Item label="EMS">{formatKw(reading.ems_kw)}</Descriptions.Item>
          <Descriptions.Item label="Demand used">
            {formatKw(reading.demand_kw)} ({winnerLabel(reading.winner)})
          </Descriptions.Item>
        </Descriptions>
      )}
      {preview.html ? (
        <iframe
          title="Demand window email preview"
          sandbox=""
          srcDoc={preview.html}
          style={{
            width: '100%',
            height: 460,
            border: '1px solid #f0f0f0',
            borderRadius: 8,
            background: '#fff',
          }}
        />
      ) : (
        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{preview.text || 'No email body returned.'}</Paragraph>
      )}
    </Space>
  );
}

const DemandWindows = () => {
  const { clientId, branchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [rules, setRules] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [branchRecord, setBranchRecord] = useState(null);
  const [solarKnown, setSolarKnown] = useState(false);
  const [hasSolar, setHasSolar] = useState(false);
  const [emsKnown, setEmsKnown] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState('');
  const [previewing, setPreviewing] = useState(null);
  const [sendingKind, setSendingKind] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const allowed = canManageDemandWindows();

  const stateDevices = location.state?.devices;
  const devices = branchRecord?.devices || stateDevices || [];
  const hasEms = useMemo(() => devices.some(deviceIsEmsSource), [devices]);
  const solarDisabled = solarKnown && !hasSolar;
  const emsDisabled = emsKnown && !hasEms;
  const noSource = solarDisabled && emsDisabled;
  const branchName = branchRecord?.name
    || location.state?.branchName
    || rules[0]?.branch_name
    || 'Branch';

  const loadRules = useCallback(async () => {
    setListLoading(true);
    try {
      const response = await APIService.get(`/api/v1/admin/demand-windows/?branch_id=${branchId}`);
      const results = response.data?.results;
      setRules(Array.isArray(results) ? results : []);
    } catch (error) {
      notification.error({
        message: 'Could not load demand windows',
        description: parseApiError(error).message,
      });
    } finally {
      setListLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    if (allowed) loadRules();
  }, [allowed, loadRules]);

  useEffect(() => {
    if (!allowed) return undefined;
    let cancelled = false;

    const loadContext = async () => {
      const [branchResult, stationResult] = await Promise.allSettled([
        APIService.get(`/api/v1/accounts/client/${clientId}/branches/`),
        APIService.get('/api/v1/solar/stations/all/'),
      ]);
      if (cancelled) return;

      if (branchResult.status === 'fulfilled') {
        const branches = branchResult.value.data?.branches || [];
        const match = branches.find((item) => String(item.branch_id ?? item.id) === String(branchId));
        setBranchRecord(match || null);
        setEmsKnown(Boolean(match) || Array.isArray(stateDevices));
      } else if (Array.isArray(stateDevices)) {
        setEmsKnown(true);
      }

      if (stationResult.status === 'fulfilled') {
        const stations = extractStations(stationResult.value.data);
        setHasSolar(stations.some((station) => stationBelongsToBranch(station, branchId)));
        setSolarKnown(true);
      }
    };

    loadContext();
    return () => {
      cancelled = true;
    };
  }, [allowed, branchId, clientId, stateDevices]);

  useEffect(() => {
    if (!drawerOpen || editing?.id) return;
    const current = form.getFieldValue('demand_source');
    const currentBlocked = (current === 'solar' && solarDisabled)
      || (current === 'ems' && emsDisabled)
      || (current === 'both' && noSource)
      || !current;
    if (!currentBlocked) return;
    const next = pickSource(solarDisabled, emsDisabled);
    if (next !== current) form.setFieldValue('demand_source', next);
  }, [drawerOpen, editing, emsDisabled, form, noSource, solarDisabled]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditing(null);
    setDirty(false);
    setFormError('');
    setPreview(null);
    setPreviewError('');
  };

  const openCreate = () => {
    setEditing(null);
    setFormError('');
    setPreview(null);
    setPreviewError('');
    form.setFieldsValue({
      ...ruleToForm(null),
      demand_source: pickSource(solarDisabled, emsDisabled),
    });
    setDirty(false);
    setDrawerOpen(true);
  };

  const openEdit = (rule) => {
    setEditing(rule);
    setFormError('');
    setPreview(null);
    setPreviewError('');
    form.setFieldsValue(ruleToForm(rule));
    setDirty(false);
    setDrawerOpen(true);
  };

  const onSave = async (values) => {
    if (noSource) {
      setFormError('This branch has no solar station and no EMS source meters.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload = buildPayload(values);
      const response = editing?.id
        ? await APIService.patch(`/api/v1/admin/demand-windows/${editing.id}/`, payload)
        : await APIService.post('/api/v1/admin/demand-windows/', {
          ...payload,
          branch: Number(branchId),
        });
      const saved = response.data?.result?.id ? response.data.result : null;
      notification.success({
        message: editing?.id ? 'Demand window updated' : 'Demand window created',
      });
      if (saved) setEditing(saved);
      setDirty(false);
      await loadRules();
    } catch (error) {
      const parsed = parseApiError(error);
      if (parsed.fields.length) form.setFields(parsed.fields);
      setFormError(parsed.message);
    } finally {
      setSaving(false);
    }
  };

  const runPreview = async (kind) => {
    setPreviewing(kind);
    setPreviewError('');
    try {
      const useSaved = Boolean(editing?.id) && !dirty;
      let body;
      if (useSaved) {
        body = { rule_id: editing.id, kind };
      } else {
        const values = await form.validateFields([
          'label',
          'days_of_week',
          'start_time',
          'end_time',
          'threshold_kw',
          'demand_source',
        ]);
        body = {
          ...buildPayload({ ...values, is_enabled: form.getFieldValue('is_enabled') }),
          branch: Number(branchId),
          branch_id: Number(branchId),
          kind,
        };
      }
      const response = await APIService.post('/api/v1/admin/demand-windows/preview/', body);
      setPreview(response.data?.preview || null);
      if (!response.data?.preview) {
        setPreviewError('The preview response did not include an email.');
      }
    } catch (error) {
      if (error?.errorFields) return;
      setPreview(null);
      setPreviewError(parseApiError(error).message);
    } finally {
      setPreviewing(null);
    }
  };

  const confirmSend = (kind) => {
    if (!editing?.id || dirty) return;
    Modal.confirm({
      title: kind === 'weekly' ? 'Send the weekly test?' : 'Send the live test?',
      content: 'Email and push go to your WYRE account. The branch does not receive this test.',
      okText: 'Send test',
      onOk: async () => {
        setSendingKind(kind);
        try {
          const response = await APIService.post('/api/v1/admin/demand-windows/send-test/', {
            rule_id: editing.id,
            kind,
          });
          const result = response.data?.result || {};
          notification.success({
            message: 'Test sent',
            description: result.to ? `Sent to ${result.to}` : 'Sent to your account.',
          });
        } catch (error) {
          notification.error({
            message: 'Test was not sent',
            description: parseApiError(error).message,
          });
        } finally {
          setSendingKind(null);
        }
      },
    });
  };

  const toggleEnabled = async (rule, isEnabled) => {
    setTogglingId(rule.id);
    try {
      const response = await APIService.patch(`/api/v1/admin/demand-windows/${rule.id}/`, {
        is_enabled: isEnabled,
      });
      const saved = response.data?.result || { ...rule, is_enabled: isEnabled };
      setRules((current) => current.map((item) => (
        item.id === rule.id ? { ...item, ...saved } : item
      )));
      if (editing?.id === rule.id) {
        setEditing((current) => ({ ...current, ...saved }));
        form.setFieldValue('is_enabled', saved.is_enabled);
      }
    } catch (error) {
      notification.error({
        message: 'Could not update the window',
        description: parseApiError(error).message,
      });
    } finally {
      setTogglingId(null);
    }
  };

  const removeRule = async (rule) => {
    setDeletingId(rule.id);
    try {
      await APIService.delete(`/api/v1/admin/demand-windows/${rule.id}/`);
      notification.success({ message: 'Demand window deleted' });
      if (editing?.id === rule.id) closeDrawer();
      await loadRules();
    } catch (error) {
      notification.error({
        message: 'Could not delete the window',
        description: parseApiError(error).message,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const sourceHelp = [
    solarDisabled ? 'This branch has no solar station.' : null,
    emsDisabled ? 'This branch has no EMS source meters (utility, generator, or IPP).' : null,
  ].filter(Boolean);

  const canSendTest = Boolean(editing?.id) && !dirty;
  const sendTestTitle = editing?.id
    ? (dirty ? 'Save your changes before sending a test.' : 'Sends to your account, not the branch.')
    : 'Save the window before sending a test.';

  const columns = [
    {
      title: 'Label',
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: 'Days',
      dataIndex: 'days_of_week',
      key: 'days_of_week',
      render: (value) => formatDays(value),
    },
    {
      title: 'Time (Lagos)',
      key: 'time',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>{clock(record.start_time)}–{clock(record.end_time)}</span>
          {isOvernight(record.start_time, record.end_time) ? (
            <Text type="secondary">Overnight</Text>
          ) : null}
        </Space>
      ),
    },
    {
      title: 'Limit',
      dataIndex: 'threshold_kw',
      key: 'threshold_kw',
      render: (value) => formatKw(value),
    },
    {
      title: 'Source',
      dataIndex: 'demand_source',
      key: 'demand_source',
      render: (value) => SOURCE_LABELS[value] || value || '—',
    },
    {
      title: (
        <Tooltip title="On: live alerts and the Monday mail. Off: the rule stays saved and does not fire.">
          <span>Enabled</span>
        </Tooltip>
      ),
      dataIndex: 'is_enabled',
      key: 'is_enabled',
      render: (value, record) => (
        <Space size={8}>
          <Switch
            checked={Boolean(value)}
            loading={togglingId === record.id}
            onChange={(checked) => toggleEnabled(record, checked)}
          />
          <Text type="secondary">{value ? 'On' : 'Off'}</Text>
        </Space>
      ),
    },
    {
      title: 'Last fired',
      dataIndex: 'last_fired_window_date',
      key: 'last_fired_window_date',
      render: (value) => formatFiredDate(value),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space wrap>
          <Button size="small" onClick={() => openEdit(record)}>Edit</Button>
          <Button
            size="small"
            danger
            loading={deletingId === record.id}
            onClick={() => {
              Modal.confirm({
                title: `Delete ${record.label || 'this demand window'}?`,
                content: 'This removes the limit. It will stop firing live alerts and drop out of the Monday mail.',
                okText: 'Delete',
                okButtonProps: { danger: true },
                onOk: () => removeRule(record),
              });
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  if (!allowed) {
    return (
      <div className="page-container">
        <Card>
          <Title level={4}>Demand windows</Title>
          <Text type="secondary">This page is only available to WYRE accounts.</Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container demand-windows-page">
      <div className="page-header page-header--wrap">
        <div className="page-header-left">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/client/${clientId}`)}
            style={{ padding: 0, height: 'auto' }}
          />
          <h2 style={{ margin: 0 }}>{branchName} demand windows</h2>
        </div>
        <Button type="primary" className="btn-primary-brand" icon={<PlusOutlined />} onClick={openCreate}>
          Add demand window
        </Button>
      </div>

      <Text type="secondary">
        Wyre-owned kW limits for this branch. A live email and push go out when load is at or above the limit inside a window. On Monday, an HTML compliance mail covers the previous Monday–Sunday.
      </Text>

      <Card className="page-card">
        <div className="table-responsive-wrapper">
          <Table
            dataSource={rules}
            columns={columns}
            rowKey="id"
            loading={listLoading}
            pagination={false}
            scroll={{ x: true }}
            locale={{
              emptyText: (
                <Empty
                  description="No demand windows on this branch yet."
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button type="primary" className="btn-primary-brand" onClick={openCreate}>
                    Add demand window
                  </Button>
                </Empty>
              ),
            }}
          />
        </div>
      </Card>

      <Drawer
        rootClassName="demand-window-drawer"
        title={editing?.id ? `Edit ${editing.label || 'demand window'}` : 'Add demand window'}
        open={drawerOpen}
        onClose={closeDrawer}
        width={Math.min(960, typeof window !== 'undefined' ? window.innerWidth : 960)}
        forceRender
        destroyOnClose={false}
        styles={{
          content: { background: '#ffffff' },
          header: { background: '#ffffff', borderBottom: '1px solid #eeeaf5' },
          body: { background: '#ffffff', color: '#1a1a1a' },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onSave}
          onValuesChange={() => setDirty(true)}
          initialValues={ruleToForm(null)}
        >
          <Row gutter={[24, 8]}>
            <Col xs={24} lg={11}>
              {formError ? (
                <Alert type="error" showIcon message={formError} style={{ marginBottom: 16 }} />
              ) : null}
              {noSource ? (
                <Alert
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                  message="This branch cannot take a demand window yet."
                  description="It has no solar station and no utility, generator, or IPP meter."
                />
              ) : null}
              <Form.Item
                name="label"
                label="Label"
                rules={[{ required: true, message: 'Enter a label' }]}
              >
                <Input placeholder="Demand window" />
              </Form.Item>
              <Form.Item
                name="days_of_week"
                label="Days"
                rules={[{
                  validator: (_, value) => (
                    normalizeDays(value).length
                      ? Promise.resolve()
                      : Promise.reject(new Error('Select at least one day'))
                  ),
                }]}
              >
                <DayChips />
              </Form.Item>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    name="start_time"
                    label="Start (Lagos)"
                    rules={[{ required: true, message: 'Choose a start time' }]}
                  >
                    <TimePicker format="HH:mm" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="end_time"
                    label="End (Lagos)"
                    rules={[{ required: true, message: 'Choose an end time' }]}
                  >
                    <TimePicker format="HH:mm" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item shouldUpdate={(prev, next) => prev.start_time !== next.start_time || prev.end_time !== next.end_time} noStyle>
                {({ getFieldValue }) => {
                  const start = getFieldValue('start_time');
                  const end = getFieldValue('end_time');
                  if (!start || !end || start.format('HH:mm') <= end.format('HH:mm')) return null;
                  return (
                    <Text type="secondary" style={{ display: 'block', marginTop: -8, marginBottom: 16 }}>
                      Overnight window (e.g. 22:00–06:00). It counts as one occurrence on the evening date.
                    </Text>
                  );
                }}
              </Form.Item>
              <Form.Item
                name="threshold_kw"
                label="Limit"
                rules={[
                  { required: true, message: 'Enter a limit above 0' },
                  {
                    validator: (_, value) => (
                      value > 0
                        ? Promise.resolve()
                        : Promise.reject(new Error('Limit must be greater than 0'))
                    ),
                  },
                ]}
              >
                <InputNumber min={0} step={0.1} addonAfter="kW" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="demand_source"
                label="Source"
                extra={sourceHelp.join(' ')}
                rules={[{ required: true, message: 'Choose a source' }]}
              >
                <Select
                  placeholder="Choose what kW is compared"
                  options={[
                    { value: 'solar', label: 'Solar', disabled: solarDisabled },
                    { value: 'ems', label: 'EMS meters', disabled: emsDisabled },
                    { value: 'both', label: 'Max of both', disabled: noSource },
                  ]}
                />
              </Form.Item>
              <Form.Item name="is_enabled" label="Enabled" valuePropName="checked">
                <EnabledField />
              </Form.Item>
              {editing?.id ? (
                <Paragraph type="secondary" style={{ marginBottom: 12 }}>
                  Last fired {formatFiredDate(editing.last_fired_window_date)}
                </Paragraph>
              ) : null}
              <div className="demand-actions">
                <Button type="primary" className="btn-primary-brand" htmlType="submit" loading={saving} disabled={noSource}>
                  Save
                </Button>
                <Button onClick={() => runPreview('live')} loading={previewing === 'live'}>
                  Preview live
                </Button>
                <Button onClick={() => runPreview('weekly')} loading={previewing === 'weekly'}>
                  Preview weekly
                </Button>
              </div>
              <div className="demand-actions demand-actions--test">
                <Tooltip title={sendTestTitle}>
                  <span style={{ display: 'inline-block' }}>
                    <Button
                      onClick={() => confirmSend('live')}
                      disabled={!canSendTest}
                      loading={sendingKind === 'live'}
                    >
                      Send live test
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip title={sendTestTitle}>
                  <span style={{ display: 'inline-block' }}>
                    <Button
                      onClick={() => confirmSend('weekly')}
                      disabled={!canSendTest}
                      loading={sendingKind === 'weekly'}
                    >
                      Send weekly test
                    </Button>
                  </span>
                </Tooltip>
                <Text type="secondary">Sends to your account. The branch does not receive a test.</Text>
              </div>
              {dirty && editing?.id ? (
                <Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0 }}>
                  Weekly preview uses the saved windows on this branch. Send test uses the saved window, so save first.
                </Paragraph>
              ) : null}
            </Col>
            <Col xs={24} lg={13}>
              <div className="demand-preview-card">
                <div className="demand-preview-card__title">Email preview</div>
                <PreviewPanel
                  preview={preview}
                  error={previewError}
                  loading={Boolean(previewing)}
                />
              </div>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </div>
  );
};

export default DemandWindows;
