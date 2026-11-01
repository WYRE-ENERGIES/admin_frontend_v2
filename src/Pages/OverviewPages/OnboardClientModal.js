import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Empty,
  Form,
  Input,
  Modal,
  Segmented,
  Select,
  Space,
  Spin,
  Steps,
  Tag,
  Typography,
  notification,
} from 'antd';
import { MailOutlined, UserOutlined } from '@ant-design/icons';
import { APIService } from '../../config/Api/apiServices';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const ONBOARDING_BASE = '/api/v1/accounts/admin/onboarding';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PRIMARY = '#5C12A7';
const BRANCH_DASHBOARD = 'branch_dashboard';
const CLIENT_DASHBOARD = 'client_dashboard';
const BRANCH_ROLES = new Set([4, 5, '4', '5', 'OPERATOR', 'VIEWER']);
const CLIENT_ROLES = new Set([2, 3, '2', '3', 'ADMIN', 'CLIENT_ADMIN']);

const getApiError = (error) => {
  const data = error?.response?.data;
  if (typeof data?.message === 'string' && data.message) {
    return data.message;
  }
  if (error?.response?.status === 403) {
    return 'Only SUPERADMIN can send this onboarding email.';
  }
  if (typeof data?.detail === 'string') return data.detail;
  if (typeof data?.error === 'string') return data.error;
  return error?.message || 'Something went wrong.';
};

const asEmailList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === 'string' ? item : item?.email)).filter(Boolean);
  }
  if (typeof value === 'string') return [value];
  return [];
};

const extractResolved = (data) => data?.resolved || data || {};
const getUserId = (user) => user?.user_id || user?.id;
const getUserRole = (user) => user?.role_text || user?.roles?.name || 'User';
const sameClient = (item, client) => Number(item?.client_id) === Number(client?.id);

const extractTargets = (data) => {
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
};

const userMatchesRoles = (user, roles) => {
  const role = user?.role;
  const roleText = String(user?.role_text || user?.roles?.name || '').toUpperCase();
  return roles.has(role) || roles.has(roleText);
};

const uniqueUsers = (users) => {
  const seen = new Set();
  return (users || []).filter((user) => {
    const id = getUserId(user);
    if (id == null || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

const sortClientUsers = (users) =>
  [...users].sort((a, b) => {
    const aAdmin = String(a?.role_text || '').toUpperCase() === 'CLIENT_ADMIN' || Number(a?.role) === 3;
    const bAdmin = String(b?.role_text || '').toUpperCase() === 'CLIENT_ADMIN' || Number(b?.role) === 3;
    if (aAdmin === bAdmin) return 0;
    return aAdmin ? -1 : 1;
  });

const normalizeTargets = (results, dashboardType) => {
  if (dashboardType === CLIENT_DASHBOARD) {
    const clientShaped = results.filter((item) => item?.client_id != null && item?.branch_id == null);
    const source = clientShaped.length ? clientShaped : results;
    const fromClientEndpoint = clientShaped.length > 0;
    const byClient = new Map();

    source.forEach((item) => {
      const clientId = item?.client_id;
      if (clientId == null) return;

      if (!byClient.has(clientId)) {
        byClient.set(clientId, {
          client_id: clientId,
          client_name: item.client_name,
          email: fromClientEndpoint ? (item.email || '') : '',
          users: [],
        });
      }

      const entry = byClient.get(clientId);
      if (fromClientEndpoint && !entry.email && item.email) entry.email = item.email;
      if (!entry.client_name && item.client_name) entry.client_name = item.client_name;
      entry.users.push(...(item.users || []).filter((user) => userMatchesRoles(user, CLIENT_ROLES)));
    });

    return Array.from(byClient.values())
      .map((item) => ({ ...item, users: sortClientUsers(uniqueUsers(item.users)) }))
      .filter((item) => item.users.length);
  }

  return results
    .filter((item) => item?.branch_id != null)
    .map((item) => ({
      ...item,
      users: uniqueUsers((item.users || []).filter((user) => userMatchesRoles(user, BRANCH_ROLES))),
    }));
};

const buildPayload = ({ dashboardType, branch, client, clientTarget, userId, values }) => {
  const payload = {
    dashboard_type: dashboardType,
    user_id: userId,
  };

  if (dashboardType === CLIENT_DASHBOARD) {
    payload.client_id = clientTarget?.client_id || client?.id;
    payload.include_client_email = Boolean(values.include_client_email);
  } else {
    payload.branch_id = branch.branch_id;
    payload.include_branch_emails = Boolean(values.include_branch_emails);
  }

  const toEmail = (values.to_email || '').trim();
  if (toEmail) payload.to_email = toEmail;

  const receiverName = (values.receiver_name || '').trim();
  if (receiverName) payload.receiver_name = receiverName;

  const password = (values.password || '').trim();
  if (password) payload.password = password;

  const mailBody = (values.mail_body || '').trim();
  if (mailBody) payload.mail_body = mailBody;

  const bcc = (values.bcc || []).map((email) => email.trim()).filter(Boolean);
  if (bcc.length) payload.bcc = bcc;

  return payload;
};

const RecipientTags = ({ label, emails, color }) => (
  <div style={{ marginBottom: 8 }}>
    <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>{label}</Text>
    {emails.length ? (
      <Space wrap size={[4, 4]}>
        {emails.map((email) => (
          <Tag key={`${label}-${email}`} color={color}>{email}</Tag>
        ))}
      </Space>
    ) : (
      <Text type="secondary">None</Text>
    )}
  </div>
);

const OnboardClientModal = ({ open, onClose, client }) => {
  const [form] = Form.useForm();
  const [step, setStep] = useState(0);
  const [dashboardType, setDashboardType] = useState(BRANCH_DASHBOARD);
  const [targets, setTargets] = useState([]);
  const [loadingTargets, setLoadingTargets] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(undefined);
  const [previewing, setPreviewing] = useState(false);
  const [sending, setSending] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [lastPayload, setLastPayload] = useState(null);

  const toEmailWatch = Form.useWatch('to_email', form);
  const includeBranchEmails = Form.useWatch('include_branch_emails', form);
  const includeClientEmail = Form.useWatch('include_client_email', form);
  const bccWatch = Form.useWatch('bcc', form);

  const isClientDashboard = dashboardType === CLIENT_DASHBOARD;

  const clientTarget = useMemo(() => {
    if (!isClientDashboard) return null;
    return targets.find((item) => sameClient(item, client)) || null;
  }, [isClientDashboard, targets, client]);

  const branchOptions = useMemo(
    () => (isClientDashboard ? [] : targets.filter((item) => sameClient(item, client) || !client?.id)),
    [isClientDashboard, targets, client]
  );

  const eligibleUsers = useMemo(() => {
    if (isClientDashboard) return clientTarget?.users || [];
    return selectedBranch?.users || [];
  }, [isClientDashboard, clientTarget, selectedBranch]);

  const selectedUser = useMemo(
    () => eligibleUsers.find((item) => getUserId(item) === selectedUserId),
    [eligibleUsers, selectedUserId]
  );

  const clientEmail = (clientTarget?.email || client?.email || '').trim();
  const hasClientEmail = Boolean(clientEmail);

  const expectedRecipients = useMemo(() => {
    const toEmail = (toEmailWatch || '').trim();

    if (isClientDashboard) {
      if (toEmail && includeClientEmail && hasClientEmail && clientEmail.toLowerCase() !== toEmail.toLowerCase()) {
        return { to: [toEmail], cc: [clientEmail] };
      }
      if (toEmail) return { to: [toEmail], cc: [] };
      if (includeClientEmail && hasClientEmail) return { to: [clientEmail], cc: [] };
      return null;
    }

    if (!selectedBranch) return null;
    const branchEmails = [selectedBranch.email, selectedBranch.copy_email].filter(Boolean);
    if (toEmail && includeBranchEmails) return { to: [toEmail], cc: branchEmails };
    if (includeBranchEmails) {
      return {
        to: selectedBranch.email ? [selectedBranch.email] : [],
        cc: selectedBranch.copy_email ? [selectedBranch.copy_email] : [],
      };
    }
    if (toEmail) return { to: [toEmail], cc: [] };
    return null;
  }, [
    isClientDashboard,
    selectedBranch,
    toEmailWatch,
    includeBranchEmails,
    includeClientEmail,
    clientEmail,
    hasClientEmail,
  ]);

  const resetComposeState = (nextType = dashboardType) => {
    setStep(0);
    setSelectedBranch(null);
    setSelectedUserId(undefined);
    setPreviewData(null);
    setLastPayload(null);
    form.setFieldsValue({
      to_email: '',
      include_branch_emails: false,
      include_client_email: false,
      receiver_name: nextType === CLIENT_DASHBOARD ? (client?.name || '') : '',
      password: '',
      mail_body: '',
      bcc: [],
    });
  };

  useEffect(() => {
    if (!open) {
      setDashboardType(BRANCH_DASHBOARD);
      setTargets([]);
      setSelectedBranch(null);
      setSelectedUserId(undefined);
      setPreviewData(null);
      setLastPayload(null);
      setStep(0);
      return;
    }
    setPreviewing(false);
    setSending(false);
    resetComposeState(BRANCH_DASHBOARD);
    // resetComposeState is local to this render and only needs to run when the modal opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, form]);

  useEffect(() => {
    if (!open || !client) return undefined;

    let cancelled = false;
    const loadTargets = async () => {
      setLoadingTargets(true);
      try {
        const response = await APIService.get(`${ONBOARDING_BASE}/targets/`, {
          params: {
            dashboard_type: dashboardType,
            q: client.name || '',
          },
        });
        if (cancelled) return;

        const nextTargets = normalizeTargets(extractTargets(response.data), dashboardType)
          .filter((item) => sameClient(item, client));
        setTargets(nextTargets);

        if (dashboardType === CLIENT_DASHBOARD) {
          const match = nextTargets[0];
          const users = match?.users || [];
          if (users.length === 1) {
            setSelectedUserId(getUserId(users[0]));
          }
        }
      } catch (error) {
        if (cancelled) return;
        setTargets([]);
        notification.error({
          message: 'Could not load targets',
          description: getApiError(error),
        });
      } finally {
        if (!cancelled) setLoadingTargets(false);
      }
    };

    loadTargets();
    return () => {
      cancelled = true;
    };
  }, [open, dashboardType, client, form]);

  const handleDashboardTypeChange = (nextType) => {
    setDashboardType(nextType);
    resetComposeState(nextType);
    setTargets([]);
  };

  const handleSelectBranch = (branchId) => {
    const branch = branchOptions.find((item) => item.branch_id === branchId);
    if (!branch) return;

    const users = branch.users || [];
    setSelectedBranch(branch);
    setSelectedUserId(users.length === 1 ? getUserId(users[0]) : undefined);
    setPreviewData(null);
    setLastPayload(null);
    setStep(0);
    form.setFieldsValue({
      receiver_name: branch.branch_name || branch.name || '',
    });
  };

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
    setPreviewData(null);
    setLastPayload(null);
  };

  const handlePreview = async () => {
    if (!selectedUserId) {
      notification.warning({
        message: 'Select a username',
        description: 'Choose an existing user. Username is never typed.',
      });
      return;
    }

    if (isClientDashboard && !clientTarget?.client_id) {
      notification.warning({
        message: 'Select a client',
        description: 'client_id is required.',
      });
      return;
    }

    if (!isClientDashboard && !selectedBranch) {
      notification.warning({
        message: 'Select a branch',
        description: 'Pick a branch for Branch Dashboard mail.',
      });
      return;
    }

    try {
      await form.validateFields();
    } catch {
      return;
    }

    const values = form.getFieldsValue();
    const toEmail = (values.to_email || '').trim();
    if (isClientDashboard) {
      if (!toEmail && !values.include_client_email) {
        notification.warning({
          message: 'Choose recipients',
          description: 'Provide to_email or set include_client_email to true.',
        });
        return;
      }
      if (!toEmail && values.include_client_email && !hasClientEmail) {
        notification.warning({
          message: 'Choose recipients',
          description: 'Client has no email. Enter to_email or set a client email first.',
        });
        return;
      }
    } else if (!toEmail && !values.include_branch_emails) {
      notification.warning({
        message: 'Choose recipients',
        description: 'Enter a To email, check “Use branch emails”, or both.',
      });
      return;
    }

    const payload = buildPayload({
      dashboardType,
      branch: selectedBranch,
      client,
      clientTarget,
      userId: selectedUserId,
      values,
    });

    setPreviewing(true);
    try {
      const response = await APIService.post(`${ONBOARDING_BASE}/preview/`, payload);
      if (response.data?.status === false) {
        notification.error({
          message: 'Preview failed',
          description: response.data.message || 'Preview failed.',
        });
        return;
      }
      setPreviewData(response.data);
      setLastPayload(payload);
      setStep(1);
    } catch (error) {
      notification.error({
        message: 'Preview failed',
        description: getApiError(error),
      });
    } finally {
      setPreviewing(false);
    }
  };

  const handleSend = async () => {
    if (!lastPayload) {
      notification.warning({
        message: 'Preview the mail first',
        description: 'Confirm the recipients and email content before sending.',
      });
      return;
    }

    setSending(true);
    try {
      const response = await APIService.post(`${ONBOARDING_BASE}/send/`, lastPayload);
      const data = response.data || {};
      if (data.status === false) {
        notification.error({
          message: 'Send failed',
          description: data.message || 'Send failed.',
        });
        return;
      }
      const toList = asEmailList(data.to).join(', ') || 'the selected recipients';
      const passwordMode = data.password_mode;
      const dashboardLabel = data.dashboard_type === CLIENT_DASHBOARD ? 'Client Dashboard' : 'Branch Dashboard';

      notification.success({
        message: data.message || 'Onboarding email sent successfully.',
        description:
          passwordMode === 'reset_link'
            ? `A 7-day set-password link was emailed to ${toList} for ${dashboardLabel}. Role on the mail: Admin.`
            : `Login details were emailed to ${toList} for ${dashboardLabel}. Role on the mail: Admin.`,
      });
      onClose();
    } catch (error) {
      notification.error({
        message: 'Send failed',
        description: getApiError(error),
      });
    } finally {
      setSending(false);
    }
  };

  const resolved = extractResolved(previewData);
  const htmlPreview = resolved.html_preview || previewData?.html_preview || '';
  const previewTo = asEmailList(resolved.to || previewData?.to);
  const previewCc = asEmailList(resolved.cc || previewData?.cc);
  const previewBcc = asEmailList(resolved.bcc || previewData?.bcc);
  const previewUsername = resolved.username || previewData?.username || selectedUser?.username;
  const previewSubject = resolved.subject || previewData?.subject;
  const previewPasswordMode = resolved.password_mode || previewData?.password_mode;
  const previewDashboardType = resolved.dashboard_type || previewData?.dashboard_type || dashboardType;
  const loginUrl = resolved.login_url || previewData?.login_url;
  const setPasswordLink = resolved.set_password_link || previewData?.set_password_link;
  const recipientReady = Boolean(expectedRecipients);

  return (
    <Modal
      title="Send Onboarding Mail"
      open={open}
      onCancel={onClose}
      width={820}
      destroyOnClose
      maskClosable={!sending && !previewing}
      styles={{ body: { maxHeight: '72vh', overflowY: 'auto' } }}
      footer={
        step === 0
          ? [
              <Button key="cancel" onClick={onClose} disabled={previewing}>
                Cancel
              </Button>,
              <Button
                key="preview"
                type="primary"
                icon={<MailOutlined />}
                loading={previewing}
                onClick={handlePreview}
                style={{ background: PRIMARY }}
              >
                Preview mail
              </Button>,
            ]
          : [
              <Button key="back" onClick={() => setStep(0)} disabled={sending}>
                Back
              </Button>,
              <Button
                key="send"
                type="primary"
                loading={sending}
                onClick={handleSend}
                style={{ background: PRIMARY }}
              >
                Send mail
              </Button>,
            ]
      }
    >
      <Steps
        current={step}
        size="small"
        style={{ marginBottom: 20 }}
        items={[{ title: 'Compose' }, { title: 'Preview' }]}
      />

      {step === 0 ? (
        <>
          <Paragraph type="secondary" style={{ marginTop: 0 }}>
            Send login details for an existing user. Branch Dashboard is for operators and
            viewers. Client Dashboard is for client admins.
          </Paragraph>

          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Dashboard</Text>
            <Segmented
              block
              value={dashboardType}
              onChange={handleDashboardTypeChange}
              options={[
                { label: 'Branch Dashboard', value: BRANCH_DASHBOARD },
                { label: 'Client Dashboard', value: CLIENT_DASHBOARD },
              ]}
            />
          </div>

          <Spin spinning={loadingTargets} tip="Loading eligible users...">
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                include_branch_emails: false,
                include_client_email: false,
                bcc: [],
                to_email: '',
              }}
            >
              {isClientDashboard ? (
                <Alert
                  type={eligibleUsers.length ? 'info' : 'warning'}
                  showIcon
                  style={{ marginBottom: 16 }}
                  message={client?.name || clientTarget?.client_name || 'Client'}
                  description={
                    eligibleUsers.length
                      ? `Client email: ${clientEmail || 'None'}. Pick a CLIENT_ADMIN or ADMIN user for this client.`
                      : `${client?.name || 'This client'} has no CLIENT_ADMIN or ADMIN user on the onboarding targets list. Branch Dashboard users (OPERATOR / VIEWER) cannot be used here.`
                  }
                />
              ) : (
                <Form.Item
                  label="Branch"
                  required
                  extra="OPERATOR and VIEWER users for this branch."
                >
                  <Select
                    showSearch
                    placeholder={branchOptions.length ? 'Select a branch' : 'No eligible branches'}
                    optionFilterProp="label"
                    value={selectedBranch?.branch_id}
                    onChange={handleSelectBranch}
                    options={branchOptions.map((branch) => ({
                      value: branch.branch_id,
                      label: branch.branch_name || branch.name,
                    }))}
                  />
                </Form.Item>
              )}

              {!isClientDashboard && selectedBranch ? (
                <Alert
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                  message={selectedBranch.branch_name || selectedBranch.name}
                  description={`Branch email: ${selectedBranch.email || 'None'}${selectedBranch.copy_email ? ` · Copy: ${selectedBranch.copy_email}` : ''}`}
                />
              ) : null}

              <Form.Item
                label="Username"
                required
                extra="Username is never typed. Role on the mail is always Admin."
              >
                <Select
                  showSearch
                  placeholder={
                    isClientDashboard
                      ? (eligibleUsers.length ? 'Select a client admin' : 'No CLIENT_ADMIN or ADMIN users for this client')
                      : (selectedBranch ? (eligibleUsers.length ? 'Select a username' : 'No OPERATOR or VIEWER users') : 'Select a branch first')
                  }
                  optionFilterProp="label"
                  value={selectedUserId}
                  onChange={handleSelectUser}
                  suffixIcon={<UserOutlined />}
                  disabled={isClientDashboard ? !eligibleUsers.length : !selectedBranch}
                  options={eligibleUsers.map((item) => ({
                    value: getUserId(item),
                    label: `${item.username} · ${getUserRole(item)}`,
                  }))}
                />
              </Form.Item>

              {selectedUser ? (
                <Alert
                  type="success"
                  showIcon
                  style={{ marginBottom: 16 }}
                  message={`Selected username: ${selectedUser.username}`}
                  description="The mail will show Role: Admin, not this user's actual role."
                />
              ) : null}

              <Form.Item
                name="to_email"
                label="To email"
                rules={[{ type: 'email', message: 'Enter a valid email' }]}
                extra={
                  isClientDashboard
                    ? 'Required unless you use the client email. If both are set, this is To and the client email goes to CC.'
                    : 'Required unless you use branch emails. If both are set, this is To and branch emails go to CC.'
                }
              >
                <Input placeholder="name@client.com" />
              </Form.Item>

              {isClientDashboard ? (
                <>
                  <Form.Item name="include_client_email" valuePropName="checked" style={{ marginBottom: 8 }}>
                    <Checkbox disabled={!hasClientEmail}>
                      Use client email{hasClientEmail ? ` (${clientEmail})` : ''}
                    </Checkbox>
                  </Form.Item>
                  <Paragraph type="secondary" style={{ marginTop: 0 }}>
                    {hasClientEmail
                      ? 'Only client email: To = client email. Combined with a To email: your To stays, and the client email goes to CC if it is different.'
                      : 'This client has no email. Enter a To email first, or set a client email.'}
                  </Paragraph>
                </>
              ) : (
                <>
                  <Form.Item name="include_branch_emails" valuePropName="checked" style={{ marginBottom: 8 }}>
                    <Checkbox>Use branch emails</Checkbox>
                  </Form.Item>
                  <Paragraph type="secondary" style={{ marginTop: 0 }}>
                    Only branch emails: To = branch email, copy email → CC. Combined with a To
                    email: your To stays, and branch email + copy email go to CC.
                  </Paragraph>
                </>
              )}

              <Form.Item
                name="receiver_name"
                label="Receiver name"
                extra={
                  isClientDashboard
                    ? 'Optional. Defaults to the client name if left empty.'
                    : 'Optional. Defaults to the branch name if left empty.'
                }
              >
                <Input placeholder="Receiver name on the email" />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                extra="Optional. Leave empty to email a 7-day set-password link instead of a password."
              >
                <Input.Password placeholder="Optional password" />
              </Form.Item>

              <Form.Item
                name="mail_body"
                label="Intro message"
                extra="Optional plain text only. This does not replace the login details box."
              >
                <TextArea rows={3} placeholder="Optional intro for the email" />
              </Form.Item>

              <Form.Item
                name="bcc"
                label="BCC"
                extra="Optional. Nobody is BCC’d unless you add addresses here."
                rules={[
                  {
                    validator: async (_, emails) => {
                      if (!emails?.length) return;
                      const invalid = emails.filter((email) => !EMAIL_RE.test(email));
                      if (invalid.length) {
                        throw new Error(`Invalid email: ${invalid.join(', ')}`);
                      }
                    },
                  },
                ]}
              >
                <Select
                  mode="tags"
                  tokenSeparators={[',', ' ']}
                  placeholder="Add BCC emails"
                  open={false}
                />
              </Form.Item>
            </Form>
          </Spin>

          {recipientReady ? (
            <Alert
              type="success"
              showIcon
              message="Expected recipients"
              description={
                <div>
                  <RecipientTags label="To" emails={expectedRecipients.to} color="purple" />
                  <RecipientTags label="CC" emails={expectedRecipients.cc} color="blue" />
                  <RecipientTags label="BCC" emails={asEmailList(bccWatch)} />
                </div>
              }
            />
          ) : (isClientDashboard && clientTarget) || selectedBranch ? (
            <Alert
              type="warning"
              showIcon
              message={
                isClientDashboard
                  ? 'Enter a To email, check “Use client email”, or both.'
                  : 'Enter a To email, check “Use branch emails”, or both.'
              }
            />
          ) : null}
        </>
      ) : (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div>
            <Text type="secondary">Dashboard</Text>
            <div>
              <Tag color="purple">
                {previewDashboardType === CLIENT_DASHBOARD ? 'Client Dashboard' : 'Branch Dashboard'}
              </Tag>
            </div>
          </div>

          {previewSubject ? (
            <div>
              <Text type="secondary">Subject</Text>
              <div><Text strong>{previewSubject}</Text></div>
            </div>
          ) : null}

          <div>
            <Text type="secondary">Account on this mail</Text>
            <div>
              <Text strong>{previewUsername || '—'}</Text>
              <Tag color="purple" style={{ marginLeft: 8 }}>Admin</Tag>
              {previewPasswordMode ? (
                <Tag color={previewPasswordMode === 'reset_link' ? 'gold' : 'green'}>
                  {previewPasswordMode === 'reset_link' ? 'Set-password link' : 'Includes password'}
                </Tag>
              ) : null}
            </div>
          </div>

          {loginUrl || setPasswordLink ? (
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Links</Text>
              {loginUrl ? (
                <div>
                  <Text type="secondary">Login: </Text>
                  <Text copyable>{loginUrl}</Text>
                </div>
              ) : null}
              {setPasswordLink ? (
                <div>
                  <Text type="secondary">Set password: </Text>
                  <Text copyable>{setPasswordLink}</Text>
                </div>
              ) : null}
            </div>
          ) : null}

          <div>
            <RecipientTags label="To" emails={previewTo} color="purple" />
            <RecipientTags label="CC" emails={previewCc} color="blue" />
            <RecipientTags label="BCC" emails={previewBcc} />
          </div>

          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
              Email preview
            </Text>
            {htmlPreview ? (
              <iframe
                title="Onboarding email preview"
                srcDoc={htmlPreview}
                sandbox=""
                style={{
                  width: '100%',
                  height: 420,
                  border: '1px solid #f0f0f0',
                  borderRadius: 8,
                  background: '#fff',
                }}
              />
            ) : (
              <Empty description="No HTML preview was returned" />
            )}
          </div>
        </Space>
      )}
    </Modal>
  );
};

export default OnboardClientModal;
