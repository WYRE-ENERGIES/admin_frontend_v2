import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import InvestorPageHeader from "../../components/investor/InvestorPageHeader";
import InvestorPillSegmented from "../../components/investor/InvestorPillSegmented";
import InvestorResponsiveDataView from "../../components/investor/InvestorResponsiveDataView";
import { InvestorSupportTicketMobileList } from "../../components/investor/InvestorMobileDataLists";
import {
  SUPPORT_PRIORITY_OPTIONS,
  SUPPORT_TOPIC_OPTIONS,
  formatTicketTime,
  statusPillColor,
} from "../../helpers/investorTicketUi";
import {
  clearInvestorSupportTicketDetail,
  createInvestorSupportTicket,
  fetchInvestorSupportTicketDetail,
  fetchInvestorSupportTickets,
} from "../../redux/actions/investor/investor.action";

const { Text, Title } = Typography;
const { TextArea } = Input;

const TICKET_FILTER_OPTIONS = [
  { value: "all", label: "All tickets" },
  { value: "open", label: "Open only" },
  { value: "support", label: "General support" },
  { value: "investment", label: "Investment" },
];

function InvestorSupport() {
  const dispatch = useDispatch();
  const { supportTickets } = useSelector((s) => s.investorPage);
  const [filter, setFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [form] = Form.useForm();

  const refreshTickets = useCallback(() => {
    dispatch(fetchInvestorSupportTickets({ page: 1, page_size: 50 }));
  }, [dispatch]);

  useEffect(() => {
    refreshTickets();
  }, [refreshTickets]);

  const filteredTickets = useMemo(() => {
    const list = supportTickets.list || [];
    return list.filter((ticket) => {
      const status = String(ticket.status || "").toLowerCase();
      const tag = String(ticket.subjectTag || "").toUpperCase();
      if (filter === "open") {
        return !["resolved", "closed"].includes(status);
      }
      if (filter === "support") return tag === "SUPPORT";
      if (filter === "investment") return tag === "INVESTMENT";
      return true;
    });
  }, [filter, supportTickets.list]);

  const openCreateModal = () => {
    form.resetFields();
    form.setFieldsValue({ topic: "General support", priority: "Normal" });
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    try {
      const values = await form.validateFields();
      const res = await dispatch(createInvestorSupportTicket(values));
      if (!res.fulfilled) {
        message.error(res.message || "Could not create support ticket");
        return;
      }
      message.success(res.message || "Your request has been sent to Wyre support.");
      setCreateOpen(false);
      form.resetFields();
    } catch {
      /* validation */
    }
  };

  const openTicketDetail = useCallback(async (ticketId) => {
    setDetailOpen(true);
    dispatch(clearInvestorSupportTicketDetail());
    const res = await dispatch(fetchInvestorSupportTicketDetail(ticketId));
    if (!res.fulfilled) {
      message.error(res.message || "Could not load ticket details");
    }
  }, [dispatch]);

  const closeDetailModal = () => {
    setDetailOpen(false);
    dispatch(clearInvestorSupportTicketDetail());
  };

  const columns = useMemo(
    () => [
      {
        title: "Subject",
        dataIndex: "subject",
        key: "subject",
        width: 240,
        ellipsis: true,
      },
      {
        title: "Type",
        dataIndex: "subjectTagDisplay",
        key: "subjectTagDisplay",
        width: 120,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 120,
        render: (value) => (
          <Tag color={statusPillColor(value)} className="investor-ticket-pill">
            {value}
          </Tag>
        ),
      },
      {
        title: "Priority",
        dataIndex: "priority",
        key: "priority",
        width: 100,
      },
      {
        title: "Created",
        dataIndex: "createdDisplay",
        key: "createdDisplay",
        width: 190,
        render: (_, record) => (
          <span className="investor-table-nowrap">
            {record.createdDisplay || formatTicketTime(record.createdAt)}
          </span>
        ),
      },
      {
        title: "Updated",
        dataIndex: "updatedDisplay",
        key: "updatedDisplay",
        width: 190,
        render: (_, record) => (
          <span className="investor-table-nowrap">
            {record.updatedDisplay || formatTicketTime(record.updatedAt)}
          </span>
        ),
      },
      {
        title: "",
        key: "action",
        width: 88,
        render: (_, record) => (
          <Button type="link" size="small" onClick={() => openTicketDetail(record.id)}>
            View
          </Button>
        ),
      },
    ],
    [openTicketDetail]
  );

  const detail = supportTickets.detail;

  return (
    <div className="investor-page investor-support-page">
      <InvestorPageHeader title="Support" />

      <Card className="investor-tickets-card investor-support-tickets-card" bordered={false}>
        <div className="investor-tickets-head investor-support-tickets-head">
          <Title level={5} className="investor-tickets-title" style={{ margin: 0 }}>
            My support tickets
          </Title>
          <Space wrap align="center">
            <InvestorPillSegmented
              options={TICKET_FILTER_OPTIONS}
              value={filter}
              onChange={setFilter}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              New ticket
            </Button>
          </Space>
        </div>

        <InvestorResponsiveDataView
          desktop={
            <div className="table-responsive-wrapper investor-table-wrap">
              <Table
                className="investor-support-tickets-table"
                columns={columns}
                dataSource={filteredTickets}
                loading={supportTickets.listLoading}
                rowKey="key"
                tableLayout="fixed"
                pagination={{
                  pageSize: 5,
                  showSizeChanger: true,
                  pageSizeOptions: ["5", "10", "15", "20"],
                  hideOnSinglePage: true,
                }}
                locale={{
                  emptyText: supportTickets.listLoading
                    ? "Loading tickets…"
                    : "No tickets yet. Create one to contact Wyre support.",
                }}
              />
            </div>
          }
          mobile={
            <InvestorSupportTicketMobileList
              tickets={filteredTickets}
              loading={supportTickets.listLoading}
              onView={openTicketDetail}
              emptyText={
                supportTickets.listLoading
                  ? "Loading tickets…"
                  : "No tickets yet. Create one to contact Wyre support."
              }
            />
          }
        />
      </Card>

      <Card className="investor-support-card investor-support-card--peach" bordered={false}>
        <div className="investor-support-inner">
          <div>
            <div className="investor-support-title">Investors contact Wyre only</div>
            <div className="investor-support-sub">
              We coordinate with customers on your behalf. Investment interest tickets are created
              from the Projects page.
            </div>
          </div>
        </div>
      </Card>

      <Modal
        title="Contact Wyre support"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setCreateOpen(false)}>
            Cancel
          </Button>,
          <Button key="create" type="primary" loading={supportTickets.createLoading} onClick={submitCreate}>
            Create support ticket
          </Button>,
        ]}
        destroyOnClose
        width={560}
      >
        <Text type="secondary" className="investor-support-modal-subtitle">
          Creates a general support ticket (separate from investment tickets).
        </Text>

        <Form form={form} layout="vertical" style={{ marginTop: 14 }}>
          <div className="investor-modal-grid">
            <Form.Item
              name="topic"
              label="Topic"
              className="investor-modal-item"
              rules={[{ required: true, message: "Select a topic" }]}
            >
              <Select options={SUPPORT_TOPIC_OPTIONS} />
            </Form.Item>
            <Form.Item
              name="priority"
              label="Priority"
              className="investor-modal-item"
              rules={[{ required: true, message: "Select a priority" }]}
            >
              <Select options={SUPPORT_PRIORITY_OPTIONS} />
            </Form.Item>
          </div>

          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: "Enter a message" }]}
          >
            <TextArea rows={4} placeholder="Write your request to Wyre" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={detail?.subject ? `Ticket #${detail.id}` : "Ticket details"}
        open={detailOpen}
        onCancel={closeDetailModal}
        footer={[
          <Button key="close" type="primary" onClick={closeDetailModal}>
            Close
          </Button>,
        ]}
        destroyOnClose
        width={640}
      >
        <Spin spinning={supportTickets.detailLoading}>
          {detail ? (
            <div className="investor-support-detail">
              <Space wrap size={[8, 8]} style={{ marginBottom: 16 }}>
                <Tag>{detail.subjectTagDisplay}</Tag>
                <Tag color={statusPillColor(detail.status)}>{detail.status}</Tag>
                {detail.priority ? <Tag>{detail.priority}</Tag> : null}
                {detail.responded || detail.staffNoteCount > 0 ? (
                  <Tag color="green">Wyre responded</Tag>
                ) : (
                  <Tag color="default">Awaiting response</Tag>
                )}
              </Space>

              <Title level={5} style={{ marginTop: 0 }}>
                {detail.subject}
              </Title>

              <Text type="secondary" className="investor-support-detail-meta">
                Created {detail.createdDisplay || formatTicketTime(detail.createdAt)}
                {detail.updatedDisplay || detail.updatedAt
                  ? ` · Updated ${detail.updatedDisplay || formatTicketTime(detail.updatedAt)}`
                  : ""}
              </Text>

              {detail.description ? (
                <Card size="small" bordered={false} className="investor-support-detail-body">
                  <Text style={{ whiteSpace: "pre-wrap" }}>{detail.description}</Text>
                </Card>
              ) : (
                <Text type="secondary">No description available for this ticket.</Text>
              )}
            </div>
          ) : !supportTickets.detailLoading ? (
            <Text type="secondary">Select a ticket to view its details.</Text>
          ) : null}
        </Spin>
      </Modal>
    </div>
  );
}

export default InvestorSupport;
