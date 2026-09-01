import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Card,
  Divider,
  Empty,
  Input,
  Modal,
  Select,
  Spin,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import AdminInvestorResponsiveTable from "./AdminInvestorResponsiveTable";
import {
  clearSupportTicketDetail,
  createAdminSupportTicketResponse,
  fetchAdminSupportTicketDetail,
  fetchAdminSupportTicketsList,
} from "../../redux/actions/adminInvestorSupportTicket/adminInvestorSupportTicket.action";

const { Text } = Typography;
const { Search } = Input;

const TICKET_PAGE_SIZE = 10;

const TICKET_PRESET_OPTIONS = [
  { value: "all", label: "All tickets" },
  { value: "open", label: "Open only" },
  { value: "responded", label: "Responded only" },
];

const TICKET_DATE_OPTIONS = [
  { value: "all", label: "All dates" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "year", label: "This year" },
];

const TICKET_COL = {
  investor: 158,
  status: 96,
  priority: 72,
  response: 136,
  date: 92,
  action: 118,
};

const ticketColSubject = (col) => ({
  ...col,
  onHeaderCell: () => ({ className: "admin-investor-tickets-col-subject" }),
  onCell: () => ({ className: "admin-investor-tickets-col-subject" }),
});

const ticketColInvestor = (col) => ({
  ...col,
  width: TICKET_COL.investor,
  onHeaderCell: () => ({ className: "admin-investor-tickets-col-investor" }),
  onCell: () => ({ className: "admin-investor-tickets-col-investor" }),
});

const ticketColStatus = (col) => ({
  ...col,
  width: TICKET_COL.status,
  onHeaderCell: () => ({ className: "admin-investor-tickets-col-status" }),
  onCell: () => ({ className: "admin-investor-tickets-col-status" }),
});

const ticketColResponse = (col) => ({
  ...col,
  width: TICKET_COL.response,
  onHeaderCell: () => ({ className: "admin-investor-tickets-col-response" }),
  onCell: () => ({ className: "admin-investor-tickets-col-response" }),
});

const ticketColFixed = (width, col) => ({
  ...col,
  width,
  onHeaderCell: () => ({ className: "admin-investor-tickets-col-fixed" }),
  onCell: () => ({ className: "admin-investor-tickets-col-fixed" }),
});

const ticketColAction = (col) => ({
  ...col,
  width: TICKET_COL.action,
  onHeaderCell: () => ({ className: "admin-investor-tickets-col-action" }),
  onCell: () => ({ className: "admin-investor-tickets-col-action" }),
});

function ticketStatusColor(status) {
  const s = String(status || "").toLowerCase();
  if (s === "resolved") return "green";
  if (s === "closed") return "default";
  if (s === "pending") return "gold";
  return "blue";
}

function ticketHasResponse(ticket, localResponses) {
  const localNotes = localResponses[ticket.idStr]?.length ?? 0;
  return ticket.responded || ticket.staffNoteCount > 0 || localNotes > 0;
}

function ticketResponseLabel(ticket, localResponses) {
  return ticketHasResponse(ticket, localResponses) ? "Responded" : "Awaiting response";
}

function TicketResponsePill({ ticket, localResponses }) {
  const responded = ticketHasResponse(ticket, localResponses);
  return (
    <span
      className={
        responded
          ? "admin-investor-tickets-response-pill admin-investor-tickets-response-pill--responded"
          : "admin-investor-tickets-response-pill admin-investor-tickets-response-pill--awaiting"
      }
    >
      {ticketResponseLabel(ticket, localResponses)}
    </span>
  );
}

function mapAdminTicketRow(t) {
  const idStr = String(t.id);
  const tag = t.subject_tag ? String(t.subject_tag).toUpperCase() : null;
  const subjectTagDisplay = tag ? `[${tag}]` : null;
  const subjectFull = subjectTagDisplay ? `${subjectTagDisplay} ${t.subject || ""}`.trim() : t.subject || "—";

  return {
    key: idStr,
    id: t.id,
    idStr,
    subjectTag: tag,
    subjectTagDisplay,
    subject: t.subject,
    subjectFull,
    investor: t.investor_name,
    ref: t.investor_ref,
    investorEmail: t.investor_email,
    status: t.status,
    priority: t.priority,
    created: t.created_at_display || t.created_at,
    updated: t.updated_at_display || t.updated_at,
    createdAtRaw: t.created_at,
    responded: Boolean(t.responded),
    staffNoteCount: t.staff_note_count ?? 0,
  };
}

function AdminInvestorTicketsPanel() {
  const dispatch = useDispatch();
  const supportTicketsList = useSelector((s) => s.adminInvestorSupportTicketsPage?.list);
  const supportTicketsListLoading = useSelector((s) => s.adminInvestorSupportTicketsPage?.listLoading);
  const supportTicketDetail = useSelector((s) => s.adminInvestorSupportTicketsPage?.detail);
  const supportTicketDetailLoading = useSelector((s) => s.adminInvestorSupportTicketsPage?.detailLoading);
  const supportTicketResponseLoading = useSelector((s) => s.adminInvestorSupportTicketsPage?.createResponseLoading);

  const [ticketSearch, setTicketSearch] = useState("");
  const [debouncedTicketSearch, setDebouncedTicketSearch] = useState("");
  const [ticketPresetFilter, setTicketPresetFilter] = useState("all");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("all");
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState("all");
  const [ticketInvestorFilter, setTicketInvestorFilter] = useState("all");
  const [ticketDateFilter, setTicketDateFilter] = useState("all");
  const [ticketPage, setTicketPage] = useState(1);

  const [ticketResponseOpen, setTicketResponseOpen] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [ticketResponseDraft, setTicketResponseDraft] = useState("");
  const [activeTicketMeta, setActiveTicketMeta] = useState(null);
  const [ticketPostResponses, setTicketPostResponses] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTicketSearch(ticketSearch.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(timer);
  }, [ticketSearch]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await dispatch(fetchAdminSupportTicketsList({ page: 1, page_size: 50 }));
      if (cancelled) return;
      if (!res.fulfilled) message.error(res.message || "Could not load support tickets");
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  useEffect(() => {
    setTicketPage(1);
  }, [
    debouncedTicketSearch,
    ticketPresetFilter,
    ticketStatusFilter,
    ticketPriorityFilter,
    ticketInvestorFilter,
    ticketDateFilter,
  ]);

  const allTickets = useMemo(() => {
    const raw = supportTicketsList?.results || [];
    return raw.map(mapAdminTicketRow);
  }, [supportTicketsList]);

  const statusOptions = useMemo(() => {
    const values = [...new Set(allTickets.map((t) => t.status).filter(Boolean))].sort();
    return [{ value: "all", label: "All statuses" }, ...values.map((v) => ({ value: v, label: v }))];
  }, [allTickets]);

  const priorityOptions = useMemo(() => {
    const values = [...new Set(allTickets.map((t) => t.priority).filter(Boolean))].sort();
    return [{ value: "all", label: "All priorities" }, ...values.map((v) => ({ value: v, label: v }))];
  }, [allTickets]);

  const investorOptions = useMemo(() => {
    const seen = new Map();
    allTickets.forEach((t) => {
      if (t.ref && !seen.has(t.ref)) {
        seen.set(t.ref, t.investor || t.ref);
      }
    });
    return [
      { value: "all", label: "All investors" },
      ...Array.from(seen.entries()).map(([value, label]) => ({
        value,
        label: `${label} (${value})`,
      })),
    ];
  }, [allTickets]);

  const hasActiveFilters = useMemo(
    () =>
      Boolean(debouncedTicketSearch) ||
      ticketPresetFilter !== "all" ||
      ticketStatusFilter !== "all" ||
      ticketPriorityFilter !== "all" ||
      ticketInvestorFilter !== "all" ||
      ticketDateFilter !== "all",
    [
      debouncedTicketSearch,
      ticketPresetFilter,
      ticketStatusFilter,
      ticketPriorityFilter,
      ticketInvestorFilter,
      ticketDateFilter,
    ]
  );

  const filteredTickets = useMemo(() => {
    return allTickets.filter((t) => {
      if (ticketPresetFilter === "open") {
        if (["resolved", "closed"].includes(String(t.status || "").toLowerCase())) return false;
      } else if (ticketPresetFilter === "responded") {
        if (!ticketHasResponse(t, ticketPostResponses)) return false;
      }

      if (ticketStatusFilter !== "all") {
        if (String(t.status || "").toLowerCase() !== String(ticketStatusFilter).toLowerCase()) {
          return false;
        }
      }

      if (ticketPriorityFilter !== "all") {
        if (String(t.priority || "").toLowerCase() !== String(ticketPriorityFilter).toLowerCase()) {
          return false;
        }
      }

      if (ticketInvestorFilter !== "all" && t.ref !== ticketInvestorFilter) {
        return false;
      }

      if (ticketDateFilter !== "all") {
        const created = dayjs(t.createdAtRaw);
        if (created.isValid()) {
          const now = dayjs();
          if (ticketDateFilter === "7d" && !created.isAfter(now.subtract(7, "day"))) return false;
          if (ticketDateFilter === "30d" && !created.isAfter(now.subtract(30, "day"))) return false;
          if (ticketDateFilter === "90d" && !created.isAfter(now.subtract(90, "day"))) return false;
          if (ticketDateFilter === "year" && created.year() !== now.year()) return false;
        }
      }

      if (debouncedTicketSearch) {
        const haystack = [
          t.subject,
          t.subjectFull,
          t.subjectTagDisplay,
          t.investor,
          t.ref,
          t.idStr,
          String(t.id),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(debouncedTicketSearch)) return false;
      }

      return true;
    });
  }, [
    allTickets,
    debouncedTicketSearch,
    ticketPresetFilter,
    ticketStatusFilter,
    ticketPriorityFilter,
    ticketInvestorFilter,
    ticketDateFilter,
    ticketPostResponses,
  ]);

  const openTicketDetail = useCallback(
    async (ticket) => {
      const idStr = String(ticket.id);
      setActiveTicketId(idStr);
      setActiveTicketMeta({
        ticketId: `#${ticket.id}`,
        subjectTag: ticket.subjectTagDisplay,
        subject: ticket.subject,
        investor: ticket.investor,
        investorRef: ticket.ref,
        investorEmail: ticket.investorEmail,
      });
      setTicketResponseDraft("");
      dispatch(clearSupportTicketDetail());
      setTicketResponseOpen(true);
      const res = await dispatch(fetchAdminSupportTicketDetail(ticket.id));
      if (!res.fulfilled) {
        message.error(res.message || "Could not load ticket details");
      }
    },
    [dispatch]
  );

  const closeTicketDetail = useCallback(() => {
    setTicketResponseOpen(false);
    setActiveTicketId(null);
    setActiveTicketMeta(null);
    setTicketResponseDraft("");
    dispatch(clearSupportTicketDetail());
  }, [dispatch]);

  const copyToClipboard = useCallback(async (value) => {
    try {
      await navigator.clipboard.writeText(String(value || ""));
      message.success("Copied");
    } catch {
      message.error("Could not copy");
    }
  }, []);

  const saveTicketResponse = useCallback(async () => {
    if (!activeTicketId) return;
    const trimmed = String(ticketResponseDraft || "").trim();
    if (!trimmed) return;
    const res = await dispatch(createAdminSupportTicketResponse(Number(activeTicketId), { body: trimmed }));
    if (res.fulfilled) {
      message.success(res.message || "Created");
      const result = res.data?.result;
      if (result) {
        setTicketPostResponses((prev) => {
          const key = String(activeTicketId);
          const existing = prev[key] || [];
          return {
            ...prev,
            [key]: [
              ...existing,
              {
                id: String(result.id),
                text: result.body,
                by: result.author_display,
                at: result.created_at_display || result.created_at,
              },
            ],
          };
        });
      }
      await dispatch(fetchAdminSupportTicketsList({ page: 1, page_size: 50 }));
      setTicketResponseDraft("");
      setTicketResponseOpen(false);
    } else {
      message.error(res.message || "Failed to post response");
    }
  }, [activeTicketId, dispatch, ticketResponseDraft]);

  const clearTicketFilters = useCallback(() => {
    setTicketSearch("");
    setDebouncedTicketSearch("");
    setTicketPresetFilter("all");
    setTicketStatusFilter("all");
    setTicketPriorityFilter("all");
    setTicketInvestorFilter("all");
    setTicketDateFilter("all");
    setTicketPage(1);
  }, []);

  const ticketColumns = useMemo(
    () => [
      ticketColSubject({
        title: "Subject",
        dataIndex: "subjectFull",
        key: "subject",
        render: (_, r) => (
          <Tooltip title={r.subjectFull} placement="topLeft">
            <span className="admin-investor-ticket-subject">{r.subjectFull}</span>
          </Tooltip>
        ),
      }),
      ticketColInvestor({
        title: "Investor",
        dataIndex: "investor",
        key: "investor",
        render: (_, r) => (
          <Tooltip title={`${r.investor || "—"} · ${r.ref || "—"}`} placement="topLeft">
            <div className="admin-investor-ticket-investor">
              <div className="admin-investor-ticket-investor-name">{r.investor}</div>
              <div className="admin-investor-ticket-investor-ref">{r.ref}</div>
            </div>
          </Tooltip>
        ),
      }),
      ticketColStatus({
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (v) => (
          <Tag color={ticketStatusColor(v)} className="admin-investor-pill admin-investor-tickets-pill">
            {v}
          </Tag>
        ),
      }),
      ticketColFixed(TICKET_COL.priority, {
        title: "Priority",
        dataIndex: "priority",
        key: "priority",
        render: (v) => <span className="admin-investor-ticket-priority">{v || "—"}</span>,
      }),
      ticketColResponse({
        title: "Response",
        key: "response",
        render: (_, r) => <TicketResponsePill ticket={r} localResponses={ticketPostResponses} />,
      }),
      ticketColFixed(TICKET_COL.date, {
        title: "Created",
        dataIndex: "created",
        key: "created",
        render: (v) => <span className="admin-investor-ticket-date">{v}</span>,
      }),
      ticketColFixed(TICKET_COL.date, {
        title: "Updated",
        dataIndex: "updated",
        key: "updated",
        render: (v) => <span className="admin-investor-ticket-date">{v}</span>,
      }),
      ticketColAction({
        title: "Action",
        key: "action",
        render: (_, r) => (
          <Button
            size="small"
            className="admin-investor-action-btn admin-investor-ticket-view-btn"
            onClick={(e) => {
              e.stopPropagation();
              openTicketDetail(r);
            }}
          >
            View ticket
            <RightOutlined className="admin-investor-ticket-view-chevron" />
          </Button>
        ),
      }),
    ],
    [openTicketDetail, ticketPostResponses]
  );

  const emptyNode = (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description="No tickets found"
      className="admin-investor-tickets-empty"
    >
      {hasActiveFilters ? (
        <Button size="small" className="admin-investor-filter-btn" onClick={clearTicketFilters}>
          Clear filters
        </Button>
      ) : null}
    </Empty>
  );

  return (
    <>
      <div className="admin-investor-stack admin-investor-tickets-panel">
        <Card bordered={false} className="admin-investor-panel">
          <div className="admin-investor-panel-head admin-investor-panel-head--plain admin-investor-tickets-head">
            <span>Support tickets (investment + general)</span>
          </div>

          <div className="admin-investor-tickets-toolbar">
            <Search
              allowClear
              placeholder="Search tickets, investors, or ticket ID..."
              value={ticketSearch}
              onChange={(e) => setTicketSearch(e.target.value)}
              className="admin-investor-tickets-search"
            />

            <div className="admin-investor-tickets-filters">
              <Select
                size="small"
                value={ticketPresetFilter}
                onChange={setTicketPresetFilter}
                options={TICKET_PRESET_OPTIONS}
                className="admin-investor-tickets-filter"
              />
              <Select
                size="small"
                value={ticketStatusFilter}
                onChange={setTicketStatusFilter}
                options={statusOptions}
                className="admin-investor-tickets-filter"
              />
              <Select
                size="small"
                value={ticketPriorityFilter}
                onChange={setTicketPriorityFilter}
                options={priorityOptions}
                className="admin-investor-tickets-filter"
              />
              <Select
                size="small"
                value={ticketInvestorFilter}
                onChange={setTicketInvestorFilter}
                options={investorOptions}
                className="admin-investor-tickets-filter"
                showSearch
                optionFilterProp="label"
                popupMatchSelectWidth={false}
              />
              <Select
                size="small"
                value={ticketDateFilter}
                onChange={setTicketDateFilter}
                options={TICKET_DATE_OPTIONS}
                className="admin-investor-tickets-filter"
              />
              {hasActiveFilters ? (
                <Button size="small" type="link" className="admin-investor-tickets-clear" onClick={clearTicketFilters}>
                  Clear filters
                </Button>
              ) : null}
            </div>
          </div>

          <AdminInvestorResponsiveTable
            className="admin-investor-data-table admin-investor-data-table--compact admin-investor-tickets-table"
            tableLayout="fixed"
            size="small"
            rowKey="key"
            columns={ticketColumns}
            dataSource={filteredTickets}
            loading={supportTicketsListLoading}
            mobileTitleKey="subjectFull"
            mobileSubtitleKey="investor"
            pagination={{
              current: ticketPage,
              pageSize: TICKET_PAGE_SIZE,
              showSizeChanger: false,
              onChange: setTicketPage,
            }}
            locale={{ emptyText: emptyNode }}
            onRow={(record) => ({
              onClick: () => openTicketDetail(record),
              className: "admin-investor-tickets-row",
            })}
          />
        </Card>
      </div>

      <Modal
        open={ticketResponseOpen}
        onCancel={closeTicketDetail}
        title="View ticket"
        width={860}
        className="admin-investor-modal"
        destroyOnClose
        footer={[
          <Button key="close" onClick={closeTicketDetail}>
            Close
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={supportTicketResponseLoading}
            onClick={saveTicketResponse}
            disabled={!activeTicketId || !String(ticketResponseDraft || "").trim()}
          >
            Save response
          </Button>,
        ]}
      >
        <Text type="secondary" style={{ display: "block", marginTop: -6 }}>
          {activeTicketMeta?.ticketId || activeTicketId || "—"}{" "}
          {activeTicketMeta?.subjectTag ? `· ${activeTicketMeta.subjectTag}` : ""}{" "}
          {activeTicketMeta?.subject ? `— ${activeTicketMeta.subject}` : ""}
        </Text>
        <Divider className="admin-modal-divider" />

        <Text type="secondary" style={{ display: "block", marginBottom: 10 }}>
          Use the investor&apos;s login email for replies (same address they use on the Wyre investor portal).
        </Text>

        {supportTicketDetailLoading ? (
          <Spin size="small" style={{ display: "block", marginBottom: 12 }} />
        ) : supportTicketDetail?.description ? (
          <>
            <Text className="admin-investor-ticket-section-label">TICKET DESCRIPTION</Text>
            <div className="admin-investor-ticket-responses-box" style={{ marginBottom: 12 }}>
              <Text style={{ whiteSpace: "pre-wrap" }}>{supportTicketDetail.description}</Text>
            </div>
            <Divider className="admin-modal-divider" />
          </>
        ) : null}

        <div className="admin-investor-ticket-email-box">
          <div className="admin-investor-ticket-email-top">
            <Text className="admin-investor-ticket-email-label">INVESTOR EMAIL</Text>
            <div className="admin-investor-ticket-email-actions">
              <Text className="admin-investor-ticket-email">{activeTicketMeta?.investorEmail || "—"}</Text>
              <Button
                size="small"
                className="admin-investor-filter-btn"
                onClick={() => copyToClipboard(activeTicketMeta?.investorEmail)}
              >
                Copy email
              </Button>
            </div>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Investor: {activeTicketMeta?.investor || "—"}
          </Text>
        </div>

        <Divider className="admin-modal-divider" />

        <div className="admin-investor-ticket-responses">
          <Text className="admin-investor-ticket-section-label">PREVIOUS RESPONSES</Text>
          <div className="admin-investor-ticket-responses-box">
            {(ticketPostResponses?.[activeTicketId] || []).length ? (
              (ticketPostResponses?.[activeTicketId] || []).map((r) => (
                <div key={r.id} className="admin-investor-ticket-response-item">
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {r.at} · {r.by}
                  </Text>
                  <div style={{ marginTop: 2 }}>{r.text}</div>
                </div>
              ))
            ) : (
              <Text type="secondary" style={{ fontSize: 12 }}>
                No staff responses yet. Add one below.
              </Text>
            )}
          </div>
        </div>

        <Divider className="admin-modal-divider" />

        <div>
          <Text className="admin-investor-ticket-section-label">ADD A NEW RESPONSE</Text>
          <Input.TextArea
            value={ticketResponseDraft}
            onChange={(e) => setTicketResponseDraft(e.target.value)}
            rows={6}
            placeholder="What you emailed or will send the investor — appended to this thread when you save."
          />
        </div>
      </Modal>
    </>
  );
}

export default AdminInvestorTicketsPanel;
