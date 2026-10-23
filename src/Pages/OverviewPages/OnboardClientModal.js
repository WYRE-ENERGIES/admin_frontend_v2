import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Empty,
  Form,
  Input,
  Modal,
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

const getApiError = (error) => {
  if (error?.response?.status === 403) {
    return 'Only SUPERADMIN can send this onboarding email.';
  }
  if (error?.response?.status === 404) {
    return 'The send/preview API is not available on this backend yet.';
  }

  const data = error?.response?.data;
  if (!data) {
    return error?.message || 'Something went wrong.';
  }
  if (typeof data.message === 'string') return data.message;
  if (typeof data.detail === 'string') return data.detail;
  if (typeof data.error === 'string') return data.error;

  const collect = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && value[0]) {
      return typeof value[0] === 'string' ? value[0] : collect(value[0]);
    }
    if (typeof value === 'object') return collect(Object.values(value)[0]);
    return null;
  };

  return collect(data.errors) || collect(data) || 'Request failed.';
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

const isSuperAdminAccount = (user) => {
  const roleName = user?.roles?.name || user?.role_text;
  const roleId = user?.roles?.id || user?.role;
  return roleName === 'SUPERADMIN' || roleId === 1;
};

const normalizeUser = (user) => ({
  user_id: user.id || user.user_id,
  username: user.username,
  email: user.email,
  role: user.roles?.id || user.role,
  role_text: user.roles?.name || user.role_text || 'User',
});

const userCanAccessBranch = (user, branchId) => {
  const assigned =
    user.branches ||
    user.branch_ids ||
    user.user_branches ||
    user.permitted_branches;
  if (!assigned) return true;
  return assigned.some((item) => {
    const id = item?.branch_id || item?.id || item;
    return Number(id) === Number(branchId);
  });
};

const buildPayload = (branch, userId, values) => {
  const payload = {
    branch_id: branch.branch_id,
    user_id: userId,
    include_branch_emails: Boolean(values.include_branch_emails),
  };

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

const OnboardClientModal = ({ open, onClose, clients = [], initialClientId }) => {
  const [form] = Form.useForm();
  const [step, setStep] = useState(0);
  const [selectedClientId, setSelectedClientId] = useState(undefined);
  const [branches, setBranches] = useState([]);
  const [clientUsers, setClientUsers] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(undefined);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [sending, setSending] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [lastPayload, setLastPayload] = useState(null);

  const toEmailWatch = Form.useWatch('to_email', form);
  const includeBranchEmails = Form.useWatch('include_branch_emails', form);
  const bccWatch = Form.useWatch('bcc', form);

  const selectedClient = useMemo(
    () => clients.find((client) => client.key === selectedClientId),
    [clients, selectedClientId]
  );

  const branchUsers = useMemo(() => {
    if (!selectedBranch) return [];
    return clientUsers.filter((user) => userCanAccessBranch(user, selectedBranch.branch_id));
  }, [clientUsers, selectedBranch]);

  const selectedUser = useMemo(
    () => branchUsers.find((user) => user.user_id === selectedUserId),
    [branchUsers, selectedUserId]
  );

  const expectedRecipients = useMemo(() => {
    if (!selectedBranch) return null;
    const toEmail = (toEmailWatch || '').trim();
    const branchEmails = [selectedBranch.email, selectedBranch.copy_email].filter(Boolean);

    if (toEmail && includeBranchEmails) {
      return { to: [toEmail], cc: branchEmails };
    }
    if (includeBranchEmails) {
      return {
        to: selectedBranch.email ? [selectedBranch.email] : [],
        cc: selectedBranch.copy_email ? [selectedBranch.copy_email] : [],
      };
    }
    if (toEmail) {
      return { to: [toEmail], cc: [] };
    }
    return null;
  }, [selectedBranch, toEmailWatch, includeBranchEmails]);

  const loadClientDetails = async (clientId) => {
    setLoadingDetails(true);
    setBranches([]);
    setClientUsers([]);
    setSelectedBranch(null);
    setSelectedUserId(undefined);
    setPreviewData(null);
    setLastPayload(null);
    try {
      const [branchRes, mainRes, extraRes] = await Promise.all([
        APIService.get(`/api/v1/accounts/client/${clientId}/branches/`),
        APIService.get(`/api/v1/accounts/client/${clientId}/main-user/`),
        APIService.get(`/api/v1/accounts/client/${clientId}/additional-user/`),
      ]);

      const nextBranches = branchRes.data?.branches || [];
      const mainUser = mainRes.data?.user;
      const extraUsers = extraRes.data?.users || [];
      const nextUsers = [mainUser, ...extraUsers]
        .filter(Boolean)
        .filter((user) => !isSuperAdminAccount(user))
        .map(normalizeUser);

      setBranches(nextBranches);
      setClientUsers(nextUsers);
    } catch (error) {
      notification.error({
        message: 'Could not load branches or users',
        description: getApiError(error),
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    setStep(0);
    setBranches([]);
    setClientUsers([]);
    setSelectedBranch(null);
    setSelectedUserId(undefined);
    setPreviewData(null);
    setLastPayload(null);
    setPreviewing(false);
    setSending(false);

    const nextClientId = initialClientId;
    setSelectedClientId(nextClientId);
    if (nextClientId) {
      loadClientDetails(nextClientId);
    }
  }, [open, form, initialClientId]);

  const handleSelectClient = (clientId) => {
    setSelectedClientId(clientId);
    setStep(0);
    form.setFieldsValue({ to_email: undefined, receiver_name: undefined });
    loadClientDetails(clientId);
  };

  const handleSelectBranch = (branchId) => {
    const branch = branches.find((item) => item.branch_id === branchId);
    if (!branch) return;

    const eligibleUsers = clientUsers.filter((user) => userCanAccessBranch(user, branch.branch_id));
    setSelectedBranch({
      ...branch,
      branch_name: branch.name,
      client_id: selectedClientId,
      client_name: selectedClient?.name,
    });
    setSelectedUserId(eligibleUsers.length === 1 ? eligibleUsers[0].user_id : undefined);
    setPreviewData(null);
    setLastPayload(null);
    setStep(0);

    const currentTo = form.getFieldValue('to_email');
    const currentName = form.getFieldValue('receiver_name');
    form.setFieldsValue({
      receiver_name: currentName && currentName !== selectedBranch?.name ? currentName : (branch.name || ''),
      to_email: currentTo || branch.email || '',
    });
  };

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
    setPreviewData(null);
    setLastPayload(null);
  };

  const handlePreview = async () => {
    if (!selectedBranch) {
      notification.warning({
        message: 'Select a branch',
        description: 'Pick an existing branch first.',
      });
      return;
    }
    if (!selectedUserId) {
      notification.warning({
        message: 'Select a username',
        description: 'Choose an existing user that can access this branch. Username is never typed.',
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
    if (!toEmail && !values.include_branch_emails) {
      notification.warning({
        message: 'Choose recipients',
        description: 'Enter a To email, check “Use branch emails”, or both.',
      });
      return;
    }

    const payload = buildPayload(selectedBranch, selectedUserId, values);
    setPreviewing(true);
    try {
      const response = await APIService.post(`${ONBOARDING_BASE}/preview/`, payload);
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
        message: 'Preview the email first',
        description: 'Confirm the recipients and email content before sending.',
      });
      return;
    }

    setSending(true);
    try {
      const response = await APIService.post(`${ONBOARDING_BASE}/send/`, lastPayload);
      const data = response.data || {};
      const toList = asEmailList(data.to).join(', ') || 'the selected recipients';
      const passwordMode = data.password_mode;

      notification.success({
        message: data.message || 'Onboarding email sent successfully.',
        description:
          passwordMode === 'reset_link'
            ? `A 7-day set-password link was emailed to ${toList}. Role on the email: ${data.role_label || 'Admin'}.`
            : `Login details were emailed to ${toList}. Role on the email: ${data.role_label || 'Admin'}.`,
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
  const previewRole = resolved.role_label || previewData?.role_label || 'Admin';
  const previewSubject = resolved.subject || previewData?.subject;
  const previewPasswordMode = resolved.password_mode || previewData?.password_mode;

  return (
    <Modal
      title="Send Onboarding Email"
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
                Preview email
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
                Send email
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
            This does not create an account. Pick an existing branch, choose a username
            already on that branch, then send the login email to a To address, the branch
            emails, or both.
          </Paragraph>

          <Form
            form={form}
            layout="vertical"
            initialValues={{ include_branch_emails: false, bcc: [] }}
          >
            <Form.Item label="Client" required>
              <Select
                showSearch
                placeholder="Search an existing client"
                optionFilterProp="label"
                value={selectedClientId}
                onChange={handleSelectClient}
                options={clients.map((client) => ({
                  value: client.key,
                  label: client.name,
                }))}
              />
            </Form.Item>

            <Spin spinning={loadingDetails} tip="Loading branches and users...">
              <Form.Item label="Branch" required extra="Accounts on this client already exist. Select the branch to email.">
                <Select
                  showSearch
                  placeholder={selectedClientId ? 'Select a branch' : 'Select a client first'}
                  optionFilterProp="label"
                  value={selectedBranch?.branch_id}
                  onChange={handleSelectBranch}
                  disabled={!selectedClientId || loadingDetails}
                  options={branches.map((branch) => ({
                    value: branch.branch_id,
                    label: branch.name,
                  }))}
                />
              </Form.Item>

              {selectedBranch ? (
                <Alert
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                  message={`${selectedClient?.name || 'Client'} · ${selectedBranch.name}`}
                  description={`Branch email: ${selectedBranch.email || 'None'}${selectedBranch.copy_email ? ` · Copy: ${selectedBranch.copy_email}` : ''}`}
                />
              ) : null}

              <Form.Item
                label="Username"
                required
                extra="Username is never typed. These are existing users that can access the selected branch."
              >
                <Select
                  showSearch
                  placeholder={selectedBranch ? 'Select a username' : 'Select a branch first'}
                  optionFilterProp="label"
                  value={selectedUserId}
                  onChange={handleSelectUser}
                  suffixIcon={<UserOutlined />}
                  disabled={!selectedBranch || loadingDetails}
                  options={branchUsers.map((user) => ({
                    value: user.user_id,
                    label: `${user.username} · ${user.role_text}`,
                  }))}
                  notFoundContent={selectedBranch ? 'No eligible users on this branch' : null}
                />
              </Form.Item>
            </Spin>

            {selectedUser ? (
              <Alert
                type="success"
                showIcon
                style={{ marginBottom: 16 }}
                message={`Selected username: ${selectedUser.username}`}
                description="Role on the email is always Admin, even if this user is an operator."
              />
            ) : null}

            <Form.Item
              name="to_email"
              label="To email"
              rules={[{ type: 'email', message: 'Enter a valid email' }]}
              extra="The address you type here. Required unless you use branch emails. If both are set, this is To and branch emails go to CC."
            >
              <Input placeholder="name@client.com" />
            </Form.Item>

            <Form.Item name="include_branch_emails" valuePropName="checked" style={{ marginBottom: 8 }}>
              <Checkbox>Use branch emails</Checkbox>
            </Form.Item>
            <Paragraph type="secondary" style={{ marginTop: 0 }}>
              Only branch emails: To = branch email, copy email → CC. Combined with a To
              email: your To stays, and branch email + copy email go to CC.
            </Paragraph>

            <Form.Item
              name="receiver_name"
              label="Receiver name"
              extra="Optional. Defaults to the branch name if left empty."
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

          {expectedRecipients ? (
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
          ) : selectedBranch ? (
            <Alert
              type="warning"
              showIcon
              message="Enter a To email, check “Use branch emails”, or both."
            />
          ) : null}
        </>
      ) : (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {previewSubject ? (
            <div>
              <Text type="secondary">Subject</Text>
              <div><Text strong>{previewSubject}</Text></div>
            </div>
          ) : null}

          <div>
            <Text type="secondary">Account on this email</Text>
            <div>
              <Text strong>{previewUsername || '—'}</Text>
              <Tag color="purple" style={{ marginLeft: 8 }}>{previewRole}</Tag>
              {previewPasswordMode ? (
                <Tag color={previewPasswordMode === 'reset_link' ? 'gold' : 'green'}>
                  {previewPasswordMode === 'reset_link' ? 'Set-password link' : 'Includes password'}
                </Tag>
              ) : null}
            </div>
          </div>

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
