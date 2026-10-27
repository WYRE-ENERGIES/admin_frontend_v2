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

const getUserId = (user) => user?.id || user?.user_id;

const getUserRole = (user) => user?.roles?.name || user?.role_text || 'User';

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

const OnboardClientModal = ({ open, onClose, client, users = [], branches = [] }) => {
  const [form] = Form.useForm();
  const [step, setStep] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(undefined);
  const [previewing, setPreviewing] = useState(false);
  const [sending, setSending] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [lastPayload, setLastPayload] = useState(null);

  const toEmailWatch = Form.useWatch('to_email', form);
  const includeBranchEmails = Form.useWatch('include_branch_emails', form);
  const bccWatch = Form.useWatch('bcc', form);

  const selectedUser = useMemo(
    () => users.find((item) => getUserId(item) === selectedUserId),
    [users, selectedUserId]
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

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    setStep(0);
    setSelectedBranch(null);
    setSelectedUserId(undefined);
    setPreviewData(null);
    setLastPayload(null);
    setPreviewing(false);
    setSending(false);
    form.setFieldsValue({
      to_email: '',
      include_branch_emails: false,
      bcc: [],
    });
  }, [open, form]);

  const handleSelectBranch = (branchId) => {
    const branch = branches.find((item) => item.branch_id === branchId);
    if (!branch) return;

    setSelectedBranch({
      ...branch,
      branch_name: branch.name,
      client_id: client?.id,
      client_name: client?.name,
    });
    setPreviewData(null);
    setLastPayload(null);
    setStep(0);

    form.setFieldsValue({
      receiver_name: branch.name || '',
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
    if (!selectedBranch) {
      notification.warning({
        message: 'Select a branch',
        description: 'The email is sent in the context of an existing branch.',
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
            This does not create an account. Pick an existing username for the login
            details, then send the mail to any To address, the branch emails, or both.
          </Paragraph>

          <Form
            form={form}
            layout="vertical"
            initialValues={{ include_branch_emails: false, bcc: [], to_email: '' }}
          >
            <Form.Item
              label="Username"
              required
              extra="Username is never typed. These are existing users on this client."
            >
              <Select
                showSearch
                placeholder={users.length ? 'Select a username' : 'No eligible users on this client'}
                optionFilterProp="label"
                value={selectedUserId}
                onChange={handleSelectUser}
                suffixIcon={<UserOutlined />}
                options={users.map((item) => ({
                  value: getUserId(item),
                  label: `${item.username} · ${getUserRole(item)}`,
                }))}
              />
            </Form.Item>

            {selectedUser ? (
              <Alert
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
                message={`Selected username: ${selectedUser.username}`}
                description={`${client?.name || 'Client'} · ${getUserRole(selectedUser)}. Role on the mail is always Admin.`}
              />
            ) : null}

            <Form.Item
              label="Branch"
              required
              extra="Choose the existing branch this mail should be sent for."
            >
              <Select
                showSearch
                placeholder={branches.length ? 'Select a branch' : 'No branches on this client'}
                optionFilterProp="label"
                value={selectedBranch?.branch_id}
                onChange={handleSelectBranch}
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
                message={selectedBranch.name}
                description={`Branch email: ${selectedBranch.email || 'None'}${selectedBranch.copy_email ? ` · Copy: ${selectedBranch.copy_email}` : ''}`}
              />
            ) : null}

            <Form.Item
              name="to_email"
              label="To email"
              rules={[{ type: 'email', message: 'Enter a valid email' }]}
              extra="Required unless you use branch emails. If both are set, this is To and branch emails go to CC."
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
