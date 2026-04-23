import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import authHelper from "../../helpers/authHelper";
import {
  fetchAccessControlOverview,
  updateAccessControlLocal,
} from "../../redux/actions/accessControl/accessControl.action";

const { Title, Text } = Typography;

const roleTagColor = (roleText) => {
  const r = String(roleText || "").toUpperCase();
  if (r === "SUPERADMIN") return "purple";
  if (r === "OPERATOR") return "blue";
  if (r === "SUPPORT") return "gold";
  if (r === "INVESTOR") return "green";
  return "default";
};

function AdminAccessControl() {
  const decoded = authHelper();
  const isSuperAdmin = String(decoded?.role_text || "").toUpperCase() === "SUPERADMIN";

  const dispatch = useDispatch();
  const { loading, error, data } = useSelector((s) => s.accessControl);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("user"); // user | investor
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchAccessControlOverview());
  }, [dispatch]);

  const roleOptions = useMemo(
    () => (data?.roles || []).map((r) => ({ value: r.name, label: r.name })),
    [data?.roles]
  );

  const usersColumns = useMemo(
    () => [
      {
        title: "User",
        key: "user",
        render: (_, row) => (
          <div>
            <div style={{ fontWeight: 600 }}>{row.name}</div>
            <Text type="secondary">{row.email}</Text>
          </div>
        ),
      },
      {
        title: "Role",
        dataIndex: "role_text",
        key: "role_text",
        width: 140,
        render: (r) => <Tag color={roleTagColor(r)}>{String(r || "—")}</Tag>,
      },
      {
        title: "MFA",
        dataIndex: "mfa",
        key: "mfa",
        width: 110,
        render: (v) => (
          <Tag color={String(v).toLowerCase() === "enabled" ? "green" : "default"}>
            {String(v || "—")}
          </Tag>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 130,
        render: (v) => (
          <Tag color={String(v).toLowerCase() === "active" ? "green" : "red"}>
            {String(v || "—")}
          </Tag>
        ),
      },
      { title: "Last login", dataIndex: "last_login", key: "last_login", width: 160 },
    ],
    []
  );

  const investorsColumns = useMemo(
    () => [
      {
        title: "Investor",
        key: "investor",
        render: (_, row) => (
          <div>
            <div style={{ fontWeight: 600 }}>{row.name}</div>
            <Text type="secondary">{row.email}</Text>
          </div>
        ),
      },
      {
        title: "Access",
        dataIndex: "status",
        key: "status",
        width: 140,
        render: (v) => (
          <Tag color={String(v).toLowerCase() === "active" ? "green" : "red"}>
            {String(v || "—")}
          </Tag>
        ),
      },
      { title: "Last login", dataIndex: "last_login", key: "last_login", width: 160 },
    ],
    []
  );

  const rolesColumns = useMemo(
    () => [
      { title: "Role", dataIndex: "name", key: "name", width: 160 },
      { title: "Description", dataIndex: "description", key: "description" },
      {
        title: "Permissions",
        dataIndex: "permissions",
        key: "permissions",
        render: (perms) => (
          <Space wrap size={[6, 6]}>
            {(perms || []).slice(0, 6).map((p) => (
              <Tag key={p}>{p}</Tag>
            ))}
            {(perms || []).length > 6 ? <Tag>+{perms.length - 6}</Tag> : null}
          </Space>
        ),
      },
    ],
    []
  );

  const auditColumns = useMemo(
    () => [
      { title: "At", dataIndex: "at", key: "at", width: 170 },
      { title: "Actor", dataIndex: "actor", key: "actor", width: 220 },
      { title: "Action", dataIndex: "action", key: "action", width: 170, render: (v) => <Tag>{v}</Tag> },
      { title: "Subject", dataIndex: "subject", key: "subject", width: 220 },
      { title: "Detail", dataIndex: "detail", key: "detail" },
    ],
    []
  );

  const openCreateDrawer = (mode) => {
    setDrawerMode(mode);
    form.resetFields();
    form.setFieldsValue({
      role_text: mode === "user" ? "OPERATOR" : "INVESTOR",
      status: "active",
      mfa: "enabled",
    });
    setDrawerOpen(true);
  };

  const submitCreate = async () => {
    const values = await form.validateFields();
    const next = { ...(data || {}) };
    const id = `${drawerMode}_${Date.now()}`;
    if (drawerMode === "user") {
      next.users = [
        ...(next.users || []),
        {
          id,
          name: values.name,
          email: values.email,
          role_text: values.role_text,
          status: values.status,
          mfa: values.mfa,
          last_login: "—",
        },
      ];
      next.audit = [
        {
          id: `a_${Date.now()}`,
          at: new Date().toISOString().slice(0, 16).replace("T", " "),
          actor: decoded?.email || "superadmin",
          action: "CREATED_USER",
          subject: values.email,
          detail: `Role: ${values.role_text}`,
        },
        ...(next.audit || []),
      ];
    } else {
      next.investors = [
        ...(next.investors || []),
        {
          id,
          name: values.name,
          email: values.email,
          role_text: "INVESTOR",
          status: values.status,
          last_login: "—",
        },
      ];
      next.audit = [
        {
          id: `a_${Date.now()}`,
          at: new Date().toISOString().slice(0, 16).replace("T", " "),
          actor: decoded?.email || "superadmin",
          action: "CREATED_INVESTOR_ACCESS",
          subject: values.email,
          detail: `Status: ${values.status}`,
        },
        ...(next.audit || []),
      ];
    }
    dispatch(updateAccessControlLocal(next));
    setDrawerOpen(false);
  };

  if (!isSuperAdmin) {
    return (
      <div style={{ padding: 18 }}>
        <Alert
          type="error"
          showIcon
          message="Access denied"
          description="This page is only available to SUPERADMIN users."
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            Admin access control
          </Title>
          <Text type="secondary">
            Create, authorize, and control access for admin users and investor portal accounts.
          </Text>
        </div>
        <Space>
          <Button icon={<PlusOutlined />} onClick={() => openCreateDrawer("investor")}>
            Add investor access
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreateDrawer("user")}>
            Add admin user
          </Button>
        </Space>
      </div>

      {error ? (
        <Alert style={{ marginTop: 14 }} type="error" showIcon message={error} />
      ) : null}

      <Card style={{ marginTop: 14 }} bordered={false}>
        <Tabs
          defaultActiveKey="users"
          items={[
            {
              key: "users",
              label: "Admin users",
              children: (
                <Table
                  rowKey="id"
                  columns={usersColumns}
                  dataSource={data?.users || []}
                  loading={loading}
                  pagination={false}
                />
              ),
            },
            {
              key: "investors",
              label: "Investors",
              children: (
                <Table
                  rowKey="id"
                  columns={investorsColumns}
                  dataSource={data?.investors || []}
                  loading={loading}
                  pagination={false}
                />
              ),
            },
            {
              key: "roles",
              label: "Roles & permissions",
              children: (
                <Table
                  rowKey="key"
                  columns={rolesColumns}
                  dataSource={data?.roles || []}
                  loading={loading}
                  pagination={false}
                />
              ),
            },
            {
              key: "audit",
              label: "Audit log",
              children: (
                <Table
                  rowKey="id"
                  columns={auditColumns}
                  dataSource={data?.audit || []}
                  loading={loading}
                  pagination={false}
                />
              ),
            },
          ]}
        />
      </Card>

      <Drawer
        title={drawerMode === "user" ? "Create admin user" : "Create investor access"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={440}
        destroyOnClose
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={submitCreate}>
              Create
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Enter a name" }]}
          >
            <Input placeholder="Full name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Enter an email" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input placeholder="name@domain.com" />
          </Form.Item>

          {drawerMode === "user" ? (
            <Form.Item name="role_text" label="Role" rules={[{ required: true }]}>
              <Select options={roleOptions.filter((r) => r.value !== "INVESTOR")} />
            </Form.Item>
          ) : null}

          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "active", label: "Active" },
                { value: "suspended", label: "Suspended" },
              ]}
            />
          </Form.Item>

          {drawerMode === "user" ? (
            <Form.Item name="mfa" label="MFA" rules={[{ required: true }]}>
              <Select
                options={[
                  { value: "enabled", label: "Enabled" },
                  { value: "disabled", label: "Disabled" },
                ]}
              />
            </Form.Item>
          ) : null}

          <Alert
            type="info"
            showIcon
            message="Note"
            description="This UI currently stores changes locally (mock). When the admin endpoints are ready, we’ll wire these actions to the backend and keep the same page."
          />
        </Form>
      </Drawer>
    </div>
  );
}

export default AdminAccessControl;

