import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Divider,
  Dropdown,
  Form,
  Segmented,
  Space,
  InputNumber,
  Modal,
  Select,
  Spin,
  Table,
  Tabs,
  Tag,
  Typography,
  Input,
  message,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  DollarOutlined,
  UserAddOutlined,
  ProjectOutlined,
  FundOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import authHelper from "../../helpers/authHelper";
import {
  createAdminInvestorUser,
  deleteAdminInvestorUser,
  fetchAdminInvestorUserDetail,
  fetchAdminInvestorUsersList,
  clearInvestorUserDetail,
} from "../../redux/actions/adminInvestorUser/adminInvestorUser.action";
import {
  createAdminInvestorProject,
  deleteAdminInvestorProject,
  fetchAdminInvestorProjectDetail,
  fetchAdminInvestorProjectsList,
  clearInvestorProjectDetail,
} from "../../redux/actions/adminInvestorProject/adminInvestorProject.action";
import {
  createAdminInvestorInvestment,
  deleteAdminInvestorInvestment,
  fetchAdminInvestorInvestmentDetail,
  fetchAdminInvestorInvestmentsList,
  clearInvestorInvestmentDetail,
} from "../../redux/actions/adminInvestorInvestment/adminInvestorInvestment.action";
import {
  createAdminCustomerPayment,
  deleteAdminCustomerPayment,
  fetchAdminCustomerPaymentDetail,
  fetchAdminCustomerPaymentsList,
  clearCustomerPaymentDetail,
} from "../../redux/actions/adminCustomerPayment/adminCustomerPayment.action";
import {
  createAdminInvestorPayout,
  deleteAdminInvestorPayout,
  fetchAdminInvestorPayoutDetail,
  fetchAdminInvestorPayoutsList,
  clearInvestorPayoutDetail,
  fetchInvestorPaymentSchedules,
} from "../../redux/actions/adminInvestorPayout/adminInvestorPayout.action";

const { Title, Text } = Typography;
const { Search } = Input;

const MODAL = {
  NONE: null,
  CREATE_INVESTOR: "createInvestor",
  CREATE_PROJECT: "createProject",
  CREATE_INVESTMENT: "createInvestment",
  RECORD_PAYMENT: "recordPayment",
  POST_PAYOUT: "postPayout",
};

const KYC_TIER_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "tier_1", label: "Tier 1" },
  { value: "tier_2", label: "Tier 2" },
];

const KYC_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
];

const kycStatusTagColor = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "verified") return "green";
  if (s === "pending") return "gold";
  return "default";
};

const PROJECT_TYPE_OPTIONS = [
  { value: "solar", label: "Solar" },
  { value: "diesel", label: "Diesel" },
  { value: "hybrid", label: "Hybrid" },
];

const PROJECT_STATUS_OPTIONS = [
  { value: "planning", label: "Planning" },
  { value: "funding", label: "Funding" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
];

const projectStatusTagColor = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "active") return "green";
  if (s === "funding") return "gold";
  if (s === "planning") return "blue";
  return "default";
};

const INVESTMENT_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "closed", label: "Closed" },
];

const REPAYMENT_PLAN_TYPE_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "bullet", label: "Bullet" },
];

const REPAYMENT_INTEREST_BASIS_OPTIONS = [
  { value: "total", label: "Total" },
  { value: "annual", label: "Annual (per year)" },
];

const CUSTOMER_PAYMENT_METHOD_OPTIONS = [
  { value: "Transfer", label: "Transfer" },
  { value: "Cash", label: "Cash" },
  { value: "POS", label: "POS" },
];

const ngn = (n) => `₦${Number(n).toLocaleString("en-NG")}`;
const ngnCompact = (n) => {
  const num = Number(n);
  if (Number.isNaN(num)) return "—";
  if (num >= 1e9) return `₦${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `₦${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `₦${(num / 1e3).toFixed(0)}k`;
  return ngn(num);
};

/** UI state label aligned with investor-admin project mock (Open / Financed / …). */
const mapAdminProjectProgrammeState = (apiStatus) => {
  const s = String(apiStatus || "").toLowerCase();
  if (s === "active") return "Financed";
  if (s === "funding") return "Open";
  if (s === "planning") return "Planning";
  if (s === "paused") return "Paused";
  return apiStatus ? String(apiStatus) : "—";
};

const projectProgrammeStateTagColor = (label) => {
  const u = String(label || "");
  if (u === "Financed") return "green";
  if (u === "Open") return "blue";
  if (u === "Watch") return "gold";
  return "default";
};

function MetricCard({ icon, label, value, sub, variant = "default" }) {
  return (
    <Card
      bordered={false}
      className={`admin-investor-metric admin-investor-metric--${variant}`}
    >
      <div className="admin-investor-metric-top">
        <div className="admin-investor-metric-icon">{icon}</div>
        <div className="admin-investor-metric-meta">
          <div className="admin-investor-metric-label">{label}</div>
          <div className="admin-investor-metric-value">{value}</div>
          {sub ? <div className="admin-investor-metric-sub">{sub}</div> : null}
        </div>
      </div>
    </Card>
  );
}

function InvestorAdministration() {
  const decoded = authHelper();
  const isSuperAdmin = String(decoded?.role_text || "").toUpperCase() === "SUPERADMIN";
  const dispatch = useDispatch();
  const investorUsersList = useSelector((s) => s.adminInvestorUsersPage?.list);
  const listLoading = useSelector((s) => s.adminInvestorUsersPage?.listLoading);
  const createLoading = useSelector((s) => s.adminInvestorUsersPage?.createLoading);
  const investorUserDetail = useSelector((s) => s.adminInvestorUsersPage?.detail);
  const detailLoading = useSelector((s) => s.adminInvestorUsersPage?.detailLoading);
  const deleteLoading = useSelector((s) => s.adminInvestorUsersPage?.deleteLoading);

  const adminProjectsList = useSelector((s) => s.adminInvestorProjectsPage?.list);
  const projectsListLoading = useSelector((s) => s.adminInvestorProjectsPage?.listLoading);
  const projectCreateLoading = useSelector((s) => s.adminInvestorProjectsPage?.createLoading);
  const projectDetail = useSelector((s) => s.adminInvestorProjectsPage?.detail);
  const projectDetailLoading = useSelector((s) => s.adminInvestorProjectsPage?.detailLoading);
  const projectDeleteLoading = useSelector((s) => s.adminInvestorProjectsPage?.deleteLoading);

  const adminInvestmentsList = useSelector((s) => s.adminInvestorInvestmentsPage?.list);
  const investmentsListLoading = useSelector((s) => s.adminInvestorInvestmentsPage?.listLoading);
  const investmentCreateLoading = useSelector((s) => s.adminInvestorInvestmentsPage?.createLoading);
  const investmentDetail = useSelector((s) => s.adminInvestorInvestmentsPage?.detail);
  const investmentDetailLoading = useSelector((s) => s.adminInvestorInvestmentsPage?.detailLoading);
  const investmentDeleteLoading = useSelector((s) => s.adminInvestorInvestmentsPage?.deleteLoading);

  const adminCustomerPaymentsList = useSelector((s) => s.adminCustomerPaymentsPage?.list);
  const customerPaymentsListLoading = useSelector((s) => s.adminCustomerPaymentsPage?.listLoading);
  const customerPaymentCreateLoading = useSelector((s) => s.adminCustomerPaymentsPage?.createLoading);
  const customerPaymentDetail = useSelector((s) => s.adminCustomerPaymentsPage?.detail);
  const customerPaymentDetailLoading = useSelector((s) => s.adminCustomerPaymentsPage?.detailLoading);
  const customerPaymentDeleteLoading = useSelector((s) => s.adminCustomerPaymentsPage?.deleteLoading);

  const adminInvestorPayoutsList = useSelector((s) => s.adminInvestorPayoutsPage?.list);
  const payoutsListLoading = useSelector((s) => s.adminInvestorPayoutsPage?.listLoading);
  const payoutCreateLoading = useSelector((s) => s.adminInvestorPayoutsPage?.createLoading);
  const payoutDetail = useSelector((s) => s.adminInvestorPayoutsPage?.detail);
  const payoutDetailLoading = useSelector((s) => s.adminInvestorPayoutsPage?.detailLoading);
  const payoutDeleteLoading = useSelector((s) => s.adminInvestorPayoutsPage?.deleteLoading);

  const [perfMode, setPerfMode] = useState("Top");
  const [activeModal, setActiveModal] = useState(MODAL.NONE);
  const [investorDetailOpen, setInvestorDetailOpen] = useState(false);
  const [projectDetailOpen, setProjectDetailOpen] = useState(false);
  const [investmentDetailOpen, setInvestmentDetailOpen] = useState(false);
  const [customerPaymentDetailOpen, setCustomerPaymentDetailOpen] = useState(false);
  const [investorSearch, setInvestorSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [projectProgrammeStateFilter, setProjectProgrammeStateFilter] = useState("all");
  const [investmentSearch, setInvestmentSearch] = useState("");
  const [customerPaymentSearch, setCustomerPaymentSearch] = useState("");
  const [payoutSearch, setPayoutSearch] = useState("");
  const [payoutDetailOpen, setPayoutDetailOpen] = useState(false);
  const [payoutSchedules, setPayoutSchedules] = useState([]);
  const [payoutSchedulesLoading, setPayoutSchedulesLoading] = useState(false);
  const [ticketsTableMode, setTicketsTableMode] = useState("all");
  const [ticketResponseOpen, setTicketResponseOpen] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [ticketResponseDraft, setTicketResponseDraft] = useState("");
  const [activeTicketMeta, setActiveTicketMeta] = useState(null);
  const [ticketResponses, setTicketResponses] = useState(() => {
    try {
      const raw = sessionStorage.getItem("wyre_admin_investor_ticket_responses_v1");
      const parsed = raw ? JSON.parse(raw) : {};
      // Back-compat: earlier versions stored { [id]: { text } }. Normalize to { [id]: [{...}] }.
      const normalized = {};
      Object.entries(parsed || {}).forEach(([k, v]) => {
        if (Array.isArray(v)) normalized[k] = v;
        else if (v && typeof v === "object" && typeof v.text === "string") {
          normalized[k] = [
            {
              id: `${k}-seed`,
              at: v.updatedAt || new Date().toISOString(),
              by: "admin@wyreenergy.com",
              text: v.text,
            },
          ];
        } else normalized[k] = [];
      });
      return normalized;
    } catch {
      return {};
    }
  });
  const [ticketStatuses, setTicketStatuses] = useState(() => ({}));
  const [customerRepaymentOpen, setCustomerRepaymentOpen] = useState(false);
  const [investorPaymentOpen, setInvestorPaymentOpen] = useState(false);
  const [activePaymentMeta, setActivePaymentMeta] = useState(null);
  const [investorForm] = Form.useForm();
  const [projectForm] = Form.useForm();
  const [investmentForm] = Form.useForm();
  const [recordPaymentForm] = Form.useForm();
  const [payoutForm] = Form.useForm();
  const recordPaymentEntryMode = Form.useWatch("entryMode", recordPaymentForm) ?? "single";
  const payoutInvestmentId = Form.useWatch("investment_id", payoutForm);
  const createInvestmentProjectId = Form.useWatch("project_id", investmentForm);
  const createProjectTotalCost = Form.useWatch("totalProjectCost", projectForm);
  const createProjectClientContribution = Form.useWatch("clientContribution", projectForm);
  const createInvestmentInterestPercent = Form.useWatch("interestPercent", investmentForm);
  const createInvestmentInterestBasis = Form.useWatch("interestBasis", investmentForm);

  const closeModal = () => setActiveModal(MODAL.NONE);

  const refreshInvestorUsers = useCallback(() => {
    if (isSuperAdmin) dispatch(fetchAdminInvestorUsersList());
  }, [dispatch, isSuperAdmin]);

  const refreshAdminProjects = useCallback(() => {
    if (isSuperAdmin) dispatch(fetchAdminInvestorProjectsList());
  }, [dispatch, isSuperAdmin]);

  const refreshAdminInvestments = useCallback(() => {
    if (isSuperAdmin) dispatch(fetchAdminInvestorInvestmentsList());
  }, [dispatch, isSuperAdmin]);

  const refreshCustomerPayments = useCallback(() => {
    if (isSuperAdmin) dispatch(fetchAdminCustomerPaymentsList());
  }, [dispatch, isSuperAdmin]);

  const refreshInvestorPayouts = useCallback(() => {
    if (isSuperAdmin) dispatch(fetchAdminInvestorPayoutsList());
  }, [dispatch, isSuperAdmin]);

  useEffect(() => {
    refreshInvestorUsers();
    refreshAdminProjects();
    refreshAdminInvestments();
  }, [refreshInvestorUsers, refreshAdminProjects, refreshAdminInvestments]);

  // Note: Payments + Tickets tabs are mock-only for now.
  // Backend team is updating endpoints; we'll map real endpoints later.

  const mockCustomerPaymentsReceived = useMemo(
    () => [
      { key: "mcp-1", when: "07 May 2026", branch: "Eko", event: "Customer installment", amount: "₦4.08B", status: "Paid" },
      { key: "mcp-2", when: "06 May 2026", branch: "Eko", event: "Customer installment", amount: "₦1.20B", status: "Paid" },
      { key: "mcp-3", when: "15 Mar 2026", branch: "Maid", event: "Overdue fine", amount: "₦1.72B", status: "Missed" },
      { key: "mcp-4", when: "In 3 days", branch: "Ib", event: "Due soon", amount: "₦1.02B", status: "Pending" },
      { key: "mcp-5", when: "05 May 2026", branch: "Enu", event: "Customer installment", amount: "₦0.89B", status: "Paid" },
      { key: "mcp-6", when: "Yesterday", branch: "Eko", event: "Underpaid", amount: "₦0.65B", status: "Partial" },
      { key: "mcp-7", when: "12 Apr 2026", branch: "Ph", event: "Overdue fine", amount: "₦0.73B", status: "Missed" },
      { key: "mcp-8", when: "01 May 2026", branch: "Abj", event: "Due", amount: "₦0.98B", status: "Pending" },
    ],
    []
  );

  const mockInvestorRepaymentsReceived = useMemo(
    () => [
      { key: "mir-1", when: "07 May 2026", investor: "INV-10042", investment: "#IT-062", amount: "₦0.11B", status: "Paid" },
      { key: "mir-2", when: "06 May 2026", investor: "INV-10088", investment: "#IT-088", amount: "₦0.32B", status: "Paid" },
      { key: "mir-3", when: "15 Mar 2026", investor: "INV-10102", investment: "#IT-091", amount: "₦0.29B", status: "Missed" },
      { key: "mir-4", when: "05 May 2026", investor: "INV-10088", investment: "#IT-088", amount: "₦0.13B", status: "Scheduled" },
      { key: "mir-5", when: "01 May 2026", investor: "INV-10042", investment: "#IT-094", amount: "₦0.26B", status: "Paid" },
      { key: "mir-6", when: "12 Apr 2026", investor: "INV-10102", investment: "#IT-091", amount: "₦0.14B", status: "Missed" },
    ],
    []
  );

  const filteredMockCustomerPaymentsReceived = useMemo(() => {
    const q = String(customerPaymentSearch || "").trim().toLowerCase();
    if (!q) return mockCustomerPaymentsReceived;
    return mockCustomerPaymentsReceived.filter((r) => Object.values(r).some((v) => String(v || "").toLowerCase().includes(q)));
  }, [customerPaymentSearch, mockCustomerPaymentsReceived]);

  const filteredMockInvestorRepaymentsReceived = useMemo(() => {
    const q = String(payoutSearch || "").trim().toLowerCase();
    if (!q) return mockInvestorRepaymentsReceived;
    return mockInvestorRepaymentsReceived.filter((r) => Object.values(r).some((v) => String(v || "").toLowerCase().includes(q)));
  }, [payoutSearch, mockInvestorRepaymentsReceived]);

  useEffect(() => {
    if (activeModal !== MODAL.POST_PAYOUT || payoutInvestmentId == null || payoutInvestmentId === "") {
      setPayoutSchedules([]);
      setPayoutSchedulesLoading(false);
      return undefined;
    }
    let cancelled = false;
    setPayoutSchedulesLoading(true);
    (async () => {
      const res = await dispatch(fetchInvestorPaymentSchedules(payoutInvestmentId));
      if (cancelled) return;
      setPayoutSchedulesLoading(false);
      if (res.fulfilled) {
        setPayoutSchedules(res.data?.results || []);
      } else {
        setPayoutSchedules([]);
        message.warning(res.message || "Could not load payment schedules");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeModal, payoutInvestmentId, dispatch]);

  useEffect(() => {
    try {
      sessionStorage.setItem("wyre_admin_investor_ticket_responses_v1", JSON.stringify(ticketResponses));
    } catch {
      // best-effort only
    }
  }, [ticketResponses]);

  const openTicketResponse = useCallback(
    (ticketId, meta) => {
      setActiveTicketId(ticketId);
      setActiveTicketMeta(meta || null);
      setTicketResponseDraft("");
      setTicketResponseOpen(true);
    },
    []
  );

  const closeTicketResponse = useCallback(() => {
    setTicketResponseOpen(false);
    setActiveTicketId(null);
    setActiveTicketMeta(null);
    setTicketResponseDraft("");
  }, []);

  const saveTicketResponse = useCallback(() => {
    if (!activeTicketId) return;
    const trimmed = String(ticketResponseDraft || "").trim();
    if (!trimmed) return;
    setTicketResponses((prev) => {
      const existing = Array.isArray(prev?.[activeTicketId]) ? prev[activeTicketId] : [];
      return {
        ...(prev || {}),
        [activeTicketId]: [
          ...existing,
          {
            id: `${activeTicketId}-${Date.now()}`,
            at: new Date().toISOString(),
            by: "admin@wyreenergy.com",
            text: trimmed,
          },
        ],
      };
    });
    setTicketResponseOpen(false);
  }, [activeTicketId, ticketResponseDraft]);

  const copyToClipboard = useCallback(async (value) => {
    try {
      await navigator.clipboard.writeText(String(value || ""));
      message.success("Copied");
    } catch {
      message.warning("Could not copy");
    }
  }, []);

  const openCustomerRepayment = useCallback(() => {
    setActivePaymentMeta({
      type: "customer",
      title: "Access Ayobo 2 — customer repayment",
      subtitle: "Access Ayobo 2  •  Branch 2104  •  Northwind Energy LP",
      ref: "CRP-2198",
      cadence: "36 × monthly",
      actionLabel: "Record customer payment",
    });
    setCustomerRepaymentOpen(true);
  }, []);

  const openInvestorPayment = useCallback(() => {
    setActivePaymentMeta({
      type: "investor",
      title: "Lekki Coldroom PV + Battery — investor payment",
      subtitle: "Lekki Coldroom PV + Battery  •  Branch 3188  •  Atlantic Renewables",
      ref: "RP-9012",
      cadence: null,
      actionLabel: "Post investor payout",
    });
    setInvestorPaymentOpen(true);
  }, []);

  const closePaymentModal = useCallback(() => {
    setCustomerRepaymentOpen(false);
    setInvestorPaymentOpen(false);
    setActivePaymentMeta(null);
  }, []);

  const mockCustomerRepaymentSchedule = useMemo(
    () => [
      { key: "9", idx: 9, due: "28 Oct 2025", dueAmount: "₦306.7M", paid: "₦306.7M", left: "NO", status: "Paid" },
      { key: "10", idx: 10, due: "28 Nov 2025", dueAmount: "₦306.7M", paid: "₦306.7M", left: "NO", status: "Paid" },
      { key: "11", idx: 11, due: "28 Apr 2026", dueAmount: "₦306.7M", paid: "NO", left: "₦306.7M", status: "Scheduled" },
      { key: "12", idx: 12, due: "28 May 2026", dueAmount: "₦306.7M", paid: "NO", left: "₦306.7M", status: "Open" },
      { key: "13", idx: 13, due: "28 Jun 2026", dueAmount: "₦306.7M", paid: "NO", left: "₦306.7M", status: "Open" },
      { key: "14", idx: 14, due: "28 Jul 2026", dueAmount: "₦306.7M", paid: "NO", left: "₦306.7M", status: "Open" },
      { key: "15", idx: 15, due: "28 Aug 2026", dueAmount: "₦306.7M", paid: "NO", left: "₦306.7M", status: "Open" },
      { key: "16", idx: 16, due: "28 Sept 2026", dueAmount: "₦306.7M", paid: "NO", left: "₦306.7M", status: "Open" },
      { key: "17", idx: 17, due: "28 Oct 2026", dueAmount: "₦306.7M", paid: "NO", left: "₦306.7M", status: "Open" },
      { key: "18", idx: 18, due: "28 Nov 2026", dueAmount: "₦306.7M", paid: "NO", left: "₦306.7M", status: "Open" },
    ],
    []
  );

  const mockInvestorPaymentSchedule = useMemo(
    () => [
      { key: "1", idx: 1, due: "05 Jan 2026", dueAmount: "₦166.7M", paid: "₦166.7M", left: "NO", status: "Paid" },
      { key: "2", idx: 2, due: "06 Feb 2026", dueAmount: "₦166.7M", paid: "NO", left: "₦166.7M", status: "Scheduled" },
      { key: "3", idx: 3, due: "06 Mar 2026", dueAmount: "₦166.7M", paid: "NO", left: "₦166.7M", status: "Open" },
      { key: "4", idx: 4, due: "05 Apr 2026", dueAmount: "₦166.7M", paid: "NO", left: "₦166.7M", status: "Open" },
    ],
    []
  );

  const handleDeactivateInvestor = useCallback(
    (record) => {
      Modal.confirm({
        title: "Deactivate this investor user?",
        content: `${record.name} (${record.ref}) — the linked user account will be deactivated.`,
        okText: "Deactivate",
        okType: "danger",
        confirmLoading: deleteLoading,
        onOk: async () => {
          const res = await dispatch(deleteAdminInvestorUser(record.id));
          if (res.fulfilled) {
            message.success(res.message || "Deactivated");
            refreshInvestorUsers();
          } else {
            message.error(res.message || "Request failed");
            throw new Error(res.message);
          }
        },
      });
    },
    [dispatch, deleteLoading, refreshInvestorUsers]
  );

  const handleViewInvestor = useCallback(
    async (id) => {
      setInvestorDetailOpen(true);
      dispatch(clearInvestorUserDetail());
      const res = await dispatch(fetchAdminInvestorUserDetail(id));
      if (!res.fulfilled) {
        message.error(res.message || "Failed to load investor");
        setInvestorDetailOpen(false);
      }
    },
    [dispatch]
  );

  const closeInvestorDetail = () => {
    setInvestorDetailOpen(false);
    dispatch(clearInvestorUserDetail());
  };

  const handleDeactivateProject = useCallback(
    (record) => {
      Modal.confirm({
        title: "Deactivate this project?",
        content: `${record.name} — it will be marked deactivated in the system.`,
        okText: "Deactivate",
        okType: "danger",
        confirmLoading: projectDeleteLoading,
        onOk: async () => {
          const res = await dispatch(deleteAdminInvestorProject(record.id));
          if (res.fulfilled) {
            message.success(res.message || "Deactivated");
            refreshAdminProjects();
          } else {
            message.error(res.message || "Request failed");
            throw new Error(res.message);
          }
        },
      });
    },
    [dispatch, projectDeleteLoading, refreshAdminProjects]
  );

  const handleViewProject = useCallback(
    async (id) => {
      setProjectDetailOpen(true);
      dispatch(clearInvestorProjectDetail());
      const res = await dispatch(fetchAdminInvestorProjectDetail(id));
      if (!res.fulfilled) {
        message.error(res.message || "Failed to load project");
        setProjectDetailOpen(false);
      }
    },
    [dispatch]
  );

  const closeProjectDetail = () => {
    setProjectDetailOpen(false);
    dispatch(clearInvestorProjectDetail());
  };

  const handleDeactivateInvestment = useCallback(
    (record) => {
      Modal.confirm({
        title: "Deactivate this investment?",
        content: `ID ${record.id} — ${record.investorName} → ${record.projectName}`,
        okText: "Deactivate",
        okType: "danger",
        confirmLoading: investmentDeleteLoading,
        onOk: async () => {
          const res = await dispatch(deleteAdminInvestorInvestment(record.id));
          if (res.fulfilled) {
            message.success(res.message || "Deactivated");
            refreshAdminInvestments();
          } else {
            message.error(res.message || "Request failed");
            throw new Error(res.message);
          }
        },
      });
    },
    [dispatch, investmentDeleteLoading, refreshAdminInvestments]
  );

  const handleViewInvestment = useCallback(
    async (id) => {
      setInvestmentDetailOpen(true);
      dispatch(clearInvestorInvestmentDetail());
      const res = await dispatch(fetchAdminInvestorInvestmentDetail(id));
      if (!res.fulfilled) {
        message.error(res.message || "Failed to load investment");
        setInvestmentDetailOpen(false);
      }
    },
    [dispatch]
  );

  const closeInvestmentDetail = () => {
    setInvestmentDetailOpen(false);
    dispatch(clearInvestorInvestmentDetail());
  };

  const handleDeactivateCustomerPayment = useCallback(
    (record) => {
      Modal.confirm({
        title: "Deactivate this customer payment record?",
        content: `Payment #${record.id} — ${record.projectName || "Project"}`,
        okText: "Deactivate",
        okType: "danger",
        confirmLoading: customerPaymentDeleteLoading,
        onOk: async () => {
          const res = await dispatch(deleteAdminCustomerPayment(record.id));
          if (res.fulfilled) {
            message.success(res.message || "Deactivated");
            refreshCustomerPayments();
          } else {
            message.error(res.message || "Request failed");
            throw new Error(res.message);
          }
        },
      });
    },
    [dispatch, customerPaymentDeleteLoading, refreshCustomerPayments]
  );

  const handleViewCustomerPayment = useCallback(
    async (id) => {
      setCustomerPaymentDetailOpen(true);
      dispatch(clearCustomerPaymentDetail());
      const res = await dispatch(fetchAdminCustomerPaymentDetail(id));
      if (!res.fulfilled) {
        message.error(res.message || "Failed to load payment");
        setCustomerPaymentDetailOpen(false);
      }
    },
    [dispatch]
  );

  const closeCustomerPaymentDetail = () => {
    setCustomerPaymentDetailOpen(false);
    dispatch(clearCustomerPaymentDetail());
  };

  const submitRecordCustomerPayment = async () => {
    const parseBranch = (raw) => {
      if (raw == null || raw === "") return null;
      const s = String(raw).trim();
      if (!s) return null;
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    };

    try {
      await recordPaymentForm.validateFields([
        "entryMode",
        "project_id",
        "branch_id",
        "payment_method",
        "reference",
        "notes",
      ]);
      const entryMode = recordPaymentForm.getFieldValue("entryMode") ?? "single";
      if (entryMode === "single") {
        await recordPaymentForm.validateFields([
          "customer_schedule_id",
          "amountReceived",
          "paymentDate",
        ]);
      }

      const values = recordPaymentForm.getFieldsValue(true);
      const branch_id = parseBranch(values.branch_id);
      if (values.branch_id != null && String(values.branch_id).trim() !== "" && branch_id === null) {
        message.error("Branch ID must be numeric or empty");
        return;
      }

      let payload;
      if (entryMode === "single") {
        const amt = Number(values.amountReceived);
        if (!Number.isFinite(amt) || amt < 0) {
          message.error("Enter a valid amount received");
          return;
        }
        const sid = Number(values.customer_schedule_id);
        if (!Number.isFinite(sid)) {
          message.error("Customer schedule ID is required");
          return;
        }
        payload = {
          project_id: values.project_id,
          branch_id,
          customer_schedule_id: sid,
          amount_received: amt.toFixed(2),
          payment_date: dayjs(values.paymentDate).format("YYYY-MM-DD"),
          payment_method: values.payment_method,
          reference: values.reference?.trim() || "",
          notes: values.notes?.trim() || "",
        };
      } else {
        const rawLines = values.line_items || [];
        const line_items = rawLines
          .map((li) => {
            if (li?.customer_schedule_id == null || li.customer_schedule_id === "") return null;
            const a = Number(li.amount_received);
            if (!Number.isFinite(a) || a < 0) return null;
            if (!li?.payment_date) return null;
            return {
              customer_schedule_id: Number(li.customer_schedule_id),
              amount_received: a.toFixed(2),
              payment_date: dayjs(li.payment_date).format("YYYY-MM-DD"),
            };
          })
          .filter(Boolean);
        if (!line_items.length) {
          message.error("Add at least one line with schedule ID, amount, and payment date");
          return;
        }
        payload = {
          project_id: values.project_id,
          branch_id,
          payment_method: values.payment_method,
          reference: values.reference?.trim() || "",
          notes: values.notes?.trim() || "",
          line_items,
        };
      }

      const res = await dispatch(createAdminCustomerPayment(payload));
      if (res.fulfilled) {
        message.success(res.message || "Created");
        closeModal();
        recordPaymentForm.resetFields();
        refreshCustomerPayments();
      } else {
        message.error(res.message || "Create failed");
      }
    } catch {
      /* validation */
    }
  };

  const handleDeactivatePayout = useCallback(
    (record) => {
      Modal.confirm({
        title: "Deactivate this investor payout?",
        content: `Payout #${record.id} — ${record.projectName || "Project"}`,
        okText: "Deactivate",
        okType: "danger",
        confirmLoading: payoutDeleteLoading,
        onOk: async () => {
          const res = await dispatch(deleteAdminInvestorPayout(record.id));
          if (res.fulfilled) {
            message.success(res.message || "Deactivated");
            refreshInvestorPayouts();
          } else {
            message.error(res.message || "Request failed");
            throw new Error(res.message);
          }
        },
      });
    },
    [dispatch, payoutDeleteLoading, refreshInvestorPayouts]
  );

  const handleViewPayout = useCallback(
    async (id) => {
      setPayoutDetailOpen(true);
      dispatch(clearInvestorPayoutDetail());
      const res = await dispatch(fetchAdminInvestorPayoutDetail(id));
      if (!res.fulfilled) {
        message.error(res.message || "Failed to load payout");
        setPayoutDetailOpen(false);
      }
    },
    [dispatch]
  );

  const closePayoutDetail = () => {
    setPayoutDetailOpen(false);
    dispatch(clearInvestorPayoutDetail());
  };

  const submitPostPayout = async () => {
    try {
      await payoutForm.validateFields(["investment_id", "payment_method", "reference"]);
      const values = payoutForm.getFieldsValue(true);
      const rawLines = values.line_items || [];
      const line_items = rawLines
        .map((li) => {
          if (li?.schedule_id == null || li.schedule_id === "") return null;
          const ap = Number(li.amount_paid);
          if (!Number.isFinite(ap) || ap < 0) return null;
          if (!li?.paid_date) return null;
          return {
            schedule_id: Number(li.schedule_id),
            amount_paid: ap.toFixed(2),
            paid_date: dayjs(li.paid_date).format("YYYY-MM-DD"),
          };
        })
        .filter(Boolean);
      if (!line_items.length) {
        message.error("Add at least one line with schedule ID, amount paid, and paid date");
        return;
      }
      const payload = {
        investment_id: values.investment_id,
        payment_method: (values.payment_method || "").trim(),
        reference: values.reference?.trim() || "",
        line_items,
      };
      const res = await dispatch(createAdminInvestorPayout(payload));
      if (res.fulfilled) {
        message.success(res.message || "Created");
        closeModal();
        payoutForm.resetFields();
        setPayoutSchedules([]);
        refreshInvestorPayouts();
      } else {
        message.error(res.message || "Create failed");
      }
    } catch {
      /* validation */
    }
  };

  const submitCreateInvestment = async () => {
    try {
      const values = await investmentForm.validateFields();
      const payload = {
        investor_id: values.investor_id,
        project_id: values.project_id,
        contract_start_date: dayjs(values.contractStart).format("YYYY-MM-DD"),
        contract_end_date: dayjs(values.contractEnd).format("YYYY-MM-DD"),
        status: values.status,
        notes: values.notes?.trim() || "",
      };

      payload.repayment_plan = {
        plan_type: values.planType,
        first_due_date: dayjs(values.firstDueDate).format("YYYY-MM-DD"),
        interest_percent: String(values.interestPercent ?? "").trim(),
        interest_basis: values.interestBasis || "total",
        number_of_installments: Number(values.numberOfInstallments),
      };

      const res = await dispatch(createAdminInvestorInvestment(payload));
      if (res.fulfilled) {
        message.success(res.message || "Created");
        closeModal();
        investmentForm.resetFields();
        refreshAdminInvestments();
      } else {
        message.error(res.message || "Create failed");
      }
    } catch {
      /* validation */
    }
  };

  const submitCreateProject = async () => {
    try {
      const values = await projectForm.validateFields();
      const branchRaw =
        values.branchId != null && values.branchId !== "" ? String(values.branchId).trim() : "";
      let branch_id = null;
      if (branchRaw) {
        const n = Number(branchRaw);
        if (!Number.isFinite(n)) {
          message.error("Branch ID must be a number");
          return;
        }
        branch_id = n;
      }
      const total = Number(values.totalProjectCost);
      const client = Number(values.clientContribution ?? 0);
      const kwp = Number(values.systemCapacityKwp ?? 0);
      if (!Number.isFinite(total) || total < 0) {
        message.error("Enter a valid total project cost");
        return;
      }
      const payload = {
        name: values.projectName.trim(),
        branch_id,
        description: values.description?.trim() || "",
        location_label: values.locationLabel?.trim() || "",
        system_capacity_kwp: (Number.isFinite(kwp) ? kwp : 0).toFixed(4),
        project_type: values.projectType,
        status: values.status,
        total_project_cost: total.toFixed(2),
        client_contribution: (Number.isFinite(client) ? client : 0).toFixed(2),
        installation_date: dayjs(values.installationDate).format("YYYY-MM-DD"),
      };

      const rawCostItems = Array.isArray(values.cost_items) ? values.cost_items : [];
      payload.cost_items = rawCostItems
        .map((ci) => {
          const amount = Number(ci?.amount);
          if (!ci?.category || !ci?.label) return null;
          if (!Number.isFinite(amount) || amount < 0) return null;
          return {
            category: String(ci.category).trim(),
            label: String(ci.label).trim(),
            amount: amount.toFixed(2),
            notes: ci?.notes ? String(ci.notes).trim() : "",
          };
        })
        .filter(Boolean);

      payload.customer_repayment_plan = {
        plan_type: values.crPlanType,
        first_due_date: dayjs(values.crFirstDueDate).format("YYYY-MM-DD"),
        interest_rate_pa: String(values.crInterestRatePa ?? "").trim(),
        number_of_installments: Number(values.crNumberOfInstallments),
        grace_period_days: Math.max(0, Math.floor(Number(values.crGracePeriodDays ?? 0))),
        notes: values.crNotes?.trim() || "",
      };
      const res = await dispatch(createAdminInvestorProject(payload));
      if (res.fulfilled) {
        message.success(res.message || "Created");
        closeModal();
        projectForm.resetFields();
        refreshAdminProjects();
      } else {
        message.error(res.message || "Create failed");
      }
    } catch {
      /* validation */
    }
  };

  const submitCreateInvestor = async () => {
    try {
      const values = await investorForm.validateFields();
      const active = values.active === "Yes";
      const countryTrim = values.country?.trim();
      const payload = {
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.tempPassword,
        first_name: values.firstName?.trim() || "",
        last_name: values.lastName?.trim() || "",
        user_is_active: active,
        legal_name: values.legalName.trim(),
        phone: values.phone?.trim() || "",
        country: countryTrim || null,
        kyc_tier: values.kycTier,
        kyc_status: values.kycStatus,
        is_active: active,
      };
      const res = await dispatch(createAdminInvestorUser(payload));
      if (res.fulfilled) {
        message.success(res.message || "Created");
        closeModal();
        investorForm.resetFields();
        refreshInvestorUsers();
      } else {
        message.error(res.message || "Create failed");
      }
    } catch {
      /* validation */
    }
  };

  const submitMock = async (form) => {
    try {
      await form.validateFields();
      message.success("Saved (mock).");
      closeModal();
      form.resetFields();
      return { fulfilled: true };
    } catch {
      return { fulfilled: false };
    }
  };

  const metrics = useMemo(
    () => [
      {
        key: "a",
        icon: <DollarOutlined />,
        label: "Total invested (investors)",
        value: ngnCompact(127_400_000_000),
        sub: `Total repaid: ${ngnCompact(36_800_000_000)}`,
        variant: "purple",
      },
      {
        key: "b",
        icon: <FundOutlined />,
        label: "Customers expected (all-in)",
        value: ngnCompact(152_900_000_000),
        sub: `Paid: ${ngnCompact(64_100_000_000)} · Left: ${ngnCompact(88_800_000_000)}`,
        variant: "blue",
      },
      {
        key: "c",
        icon: <ProjectOutlined />,
        label: "Active projects",
        value: "18",
        sub: "Financed: 14 · Open: 4",
        variant: "teal",
      },
      {
        key: "d",
        icon: <UserAddOutlined />,
        label: "Active investors",
        value: "9",
        sub: "Verified: 7 · Under review: 2",
        variant: "mint",
      },
      {
        key: "e",
        icon: <ThunderboltOutlined />,
        label: "Nearest payments",
        value: "Today",
        sub: "To investor: ₦0.31B (28 Apr) · From customer: ₦2.10B (28 Apr)",
        variant: "amber",
      },
    ],
    []
  );

  const customerRepaymentColumns = useMemo(
    () => [
      { title: "Branch", dataIndex: "branch", key: "branch", width: 90 },
      {
        title: "Event",
        key: "event",
        render: (_, row) => (
          <div className="admin-investor-event">
            <Tag
              color={
                row.status === "Paid"
                  ? "green"
                  : row.status === "Missed"
                    ? "red"
                    : row.status === "Pending"
                      ? "gold"
                      : "default"
              }
              className="admin-investor-pill"
            >
              {row.status}
            </Tag>
            <span className="admin-investor-event-text">{row.event}</span>
          </div>
        ),
      },
      { title: "Amount", dataIndex: "amount", key: "amount", width: 140 },
      { title: "When", dataIndex: "when", key: "when", width: 120 },
      {
        title: "Next payment date",
        key: "next",
        dataIndex: "next",
        width: 140,
        render: (v) =>
          v === "Past due" ? (
            <Tag color="red" className="admin-investor-pill">
              Past due
            </Tag>
          ) : (
            v
          ),
      },
    ],
    []
  );

  const customerRepaymentRows = useMemo(
    () => [
      { key: "r1", branch: "2104", status: "Paid", event: "Customer installment", amount: "₦2.40B", when: "Today", next: "30 Apr" },
      { key: "r2", branch: "2230", status: "Paid", event: "Customer installment", amount: "₦1.20B", when: "Yesterday", next: "05 May" },
      { key: "r3", branch: "2841", status: "Missed", event: "Overdue line", amount: "₦1.72B", when: "15 Mar", next: "Past due" },
      { key: "r4", branch: "1988", status: "Pending", event: "Due soon", amount: "₦1.02B", when: "In 3 days", next: "01 May" },
      { key: "r5", branch: "9001", status: "Partial", event: "Underpaid", amount: "₦0.61B", when: "2 days ago", next: "09 May" },
      { key: "r6", branch: "2170", status: "Pending", event: "Due soon", amount: "₦0.88B", when: "In 1 week", next: "07 May" },
      { key: "r7", branch: "2281", status: "Paid", event: "Customer installment", amount: "₦1.11B", when: "4 days ago", next: "12 May" },
      { key: "r8", branch: "2401", status: "Partial", event: "Underpaid", amount: "₦0.73B", when: "Yesterday", next: "14 May" },
      { key: "r9", branch: "3102", status: "Missed", event: "Overdue line", amount: "₦0.94B", when: "12 Apr", next: "Past due" },
    ],
    []
  );

  const disbursementColumns = useMemo(
    () => [
      { title: "Due", dataIndex: "due", key: "due", width: 110 },
      { title: "Investor", dataIndex: "investor", key: "investor" },
      { title: "Investment", dataIndex: "investment", key: "investment", width: 110 },
      { title: "Due amount", dataIndex: "amount", key: "amount", width: 120 },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 120,
        render: (v) => (
          <Tag
            color={
              v === "Pending" ? "gold" : v === "Scheduled" ? "green" : v === "Missed" ? "red" : "default"
            }
            className="admin-investor-pill"
          >
            {v}
          </Tag>
        ),
      },
    ],
    []
  );

  const disbursementRows = useMemo(
    () => [
      { key: "d1", due: "28 Apr", investor: "INV-10042", investment: "#1042", amount: "₦0.31B", status: "Pending" },
      { key: "d2", due: "30 Apr", investor: "INV-10088", investment: "#1088", amount: "₦0.35B", status: "Pending" },
      { key: "d3", due: "05 May", investor: "INV-10042", investment: "#1091", amount: "₦0.29B", status: "Scheduled" },
      { key: "d4", due: "15 Mar", investor: "INV-10088", investment: "#1088", amount: "₦0.33B", status: "Missed" },
      { key: "d5", due: "01 Mar", investor: "INV-10102", investment: "#1102", amount: "₦0.18B", status: "Missed" },
      { key: "d6", due: "09 May", investor: "INV-10042", investment: "#1094", amount: "₦0.26B", status: "Scheduled" },
      { key: "d7", due: "12 May", investor: "INV-10088", investment: "#1090", amount: "₦0.22B", status: "Pending" },
      { key: "d8", due: "18 May", investor: "INV-10102", investment: "#1102", amount: "₦0.14B", status: "Pending" },
    ],
    []
  );

  const perfColumns = useMemo(
    () => [
      { title: "Project", dataIndex: "project", key: "project" },
      { title: "Capacity (kWp)", dataIndex: "capacityKwp", key: "capacityKwp", width: 120 },
      { title: "Total generation (kWh)", dataIndex: "totalGenKwh", key: "totalGenKwh", width: 160 },
      { title: "Avg daily generation (kWh)", dataIndex: "avgDailyKwh", key: "avgDailyKwh", width: 180 },
      { title: "Solar % of branch energy", dataIndex: "solarPct", key: "solarPct", width: 170 },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
        render: (v) => (
          <Tag
            color={v === "Active" ? "green" : v === "Watch" ? "gold" : "default"}
            className="admin-investor-pill"
          >
            {v}
          </Tag>
        ),
      },
    ],
    []
  );

  const perfRows = useMemo(
    () => [
      { key: "p1", project: "Access Ayobo 2", capacityKwp: "85.5000", totalGenKwh: "418,200", avgDailyKwh: "11,450", solarPct: "41%", status: "Active" },
      { key: "p2", project: "Access Aknaran", capacityKwp: "72.0000", totalGenKwh: "401,800", avgDailyKwh: "11,020", solarPct: "38%", status: "Active" },
      { key: "p3", project: "Access Surulere Retail", capacityKwp: "120.0000", totalGenKwh: "395,400", avgDailyKwh: "10,880", solarPct: "36%", status: "Active" },
      { key: "p4", project: "Kaduna Hospital Retrofit", capacityKwp: "200.0000", totalGenKwh: "388,100", avgDailyKwh: "10,640", solarPct: "29%", status: "Watch" },
      { key: "p5", project: "Lekki Coldroom PV + Battery", capacityKwp: "64.2500", totalGenKwh: "362,900", avgDailyKwh: "9,940", solarPct: "33%", status: "Active" },
      { key: "p6", project: "Access Ekiti 2", capacityKwp: "55.0000", totalGenKwh: "310,200", avgDailyKwh: "8,500", solarPct: "27%", status: "Watch" },
      { key: "p7", project: "Access Abuja Logistics Hub", capacityKwp: "48.0000", totalGenKwh: "298,700", avgDailyKwh: "8,180", solarPct: "31%", status: "Active" },
      { key: "p8", project: "Access Ikoyi Node", capacityKwp: "42.0000", totalGenKwh: "276,500", avgDailyKwh: "7,570", solarPct: "28%", status: "Active" },
    ],
    []
  );

  const filteredInvestorResults = useMemo(() => {
    const results = investorUsersList?.results || [];
    const q = investorSearch.trim().toLowerCase();
    if (!q) return results;
    return results.filter(
      (r) =>
        r.legal_name?.toLowerCase().includes(q) ||
        r.investor_ref?.toLowerCase().includes(q) ||
        r.user?.email?.toLowerCase().includes(q) ||
        r.user?.username?.toLowerCase().includes(q)
    );
  }, [investorUsersList, investorSearch]);

  const investorsTableRows = useMemo(
    () =>
      filteredInvestorResults.map((r) => ({
        key: String(r.id),
        id: r.id,
        name: r.legal_name,
        user: r.user?.email || r.user?.username || "—",
        ref: r.investor_ref,
        kyc: r.kyc_status,
        kycTier: r.kyc_tier,
        count: "—",
        status: r.is_active ? "Active" : "Inactive",
        userActive: r.user?.is_active,
        last: "—",
      })),
    [filteredInvestorResults]
  );

  const investorsColumns = useMemo(
    () => [
      { title: "Legal name", dataIndex: "name", key: "name" },
      { title: "User", dataIndex: "user", key: "user", width: 220 },
      { title: "Ref", dataIndex: "ref", key: "ref", width: 120 },
      {
        title: "KYC",
        key: "kyc",
        width: 140,
        render: (_, row) => (
          <Space size={4} wrap>
            <Tag color={kycStatusTagColor(row.kyc)} className="admin-investor-pill">
              {row.kyc || "—"}
            </Tag>
            {row.kycTier ? (
              <Tag className="admin-investor-pill">{row.kycTier}</Tag>
            ) : null}
          </Space>
        ),
      },
      { title: "# Investments", dataIndex: "count", key: "count", width: 120 },
      {
        title: "Status",
        key: "status",
        width: 120,
        render: (_, row) => {
          const active = row.status === "Active" && row.userActive;
          return (
            <Tag color={active ? "green" : "default"} className="admin-investor-pill">
              {active ? "Active" : "Inactive"}
            </Tag>
          );
        },
      },
      { title: "Last activity", dataIndex: "last", key: "last", width: 140 },
      {
        title: "Actions",
        key: "actions",
        width: 120,
        render: (_, record) => (
          <Dropdown
            menu={{
              items: [
                {
                  key: "view",
                  label: "View",
                  onClick: () => handleViewInvestor(record.id),
                },
                {
                  key: "deactivate",
                  label: "Deactivate",
                  danger: true,
                  onClick: () => handleDeactivateInvestor(record),
                },
              ],
            }}
            trigger={["click"]}
          >
            <Button size="small" className="admin-investor-action-btn">
              Actions ▾
            </Button>
          </Dropdown>
        ),
      },
    ],
    [handleDeactivateInvestor, handleViewInvestor]
  );

  const filteredProjectResults = useMemo(() => {
    const results = adminProjectsList?.results || [];
    const q = projectSearch.trim().toLowerCase();
    let next = results;
    if (q) {
      next = results.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.location_label?.toLowerCase().includes(q) ||
          String(r.branch_id || "").includes(q) ||
          String(r.id) === q ||
          r.description?.toLowerCase().includes(q)
      );
    }
    if (projectProgrammeStateFilter === "all") return next;
    return next.filter((r) => mapAdminProjectProgrammeState(r.status) === projectProgrammeStateFilter);
  }, [adminProjectsList, projectSearch, projectProgrammeStateFilter]);

  const projectsTableRows = useMemo(
    () =>
      filteredProjectResults.map((r) => {
        const typeLabel = r.project_type ? String(r.project_type).replace(/^\w/, (c) => c.toUpperCase()) : "—";
        const stateUi = mapAdminProjectProgrammeState(r.status);
        return {
          key: String(r.id),
          id: r.id,
          project: r.name,
          branch: r.branch_id != null ? String(r.branch_id) : "—",
          typeLabel,
          capacityKwp: r.system_capacity_kwp,
          totalCost: r.total_project_cost,
          clientContr: r.client_contribution,
          investorTarget: r.investor_funding_target,
          stateUi,
          investorName: "—",
        };
      }),
    [filteredProjectResults]
  );

  const projectsProgrammeColumns = useMemo(
    () => [
      { title: "Project", dataIndex: "project", key: "project", ellipsis: true },
      { title: "Branch", dataIndex: "branch", key: "branch", width: 90 },
      {
        title: "Type",
        dataIndex: "typeLabel",
        key: "typeLabel",
        width: 100,
        render: (v) => <Tag className="admin-investor-pill">{v}</Tag>,
      },
      { title: "Capacity (kWp)", dataIndex: "capacityKwp", key: "capacityKwp", width: 120 },
      {
        title: "Total cost",
        dataIndex: "totalCost",
        key: "totalCost",
        width: 120,
        render: (v) => ngnCompact(Number(v)),
      },
      {
        title: "Client contr.",
        dataIndex: "clientContr",
        key: "clientContr",
        width: 120,
        render: (v) => ngnCompact(Number(v)),
      },
      {
        title: "Investor target",
        dataIndex: "investorTarget",
        key: "investorTarget",
        width: 130,
        render: (v) => ngnCompact(Number(v)),
      },
      {
        title: "State",
        dataIndex: "stateUi",
        key: "stateUi",
        width: 110,
        render: (v) => (
          <Tag color={projectProgrammeStateTagColor(v)} className="admin-investor-pill">
            {v}
          </Tag>
        ),
      },
      { title: "Investor", dataIndex: "investorName", key: "investorName", width: 160, ellipsis: true },
      {
        title: "Actions",
        key: "actions",
        width: 120,
        fixed: "right",
        render: (_, record) => (
          <Dropdown
            menu={{
              items: [
                { key: "view", label: "View", onClick: () => handleViewProject(record.id) },
                {
                  key: "deactivate",
                  label: "Deactivate",
                  danger: true,
                  onClick: () => handleDeactivateProject(record),
                },
              ],
            }}
            trigger={["click"]}
          >
            <Button size="small" className="admin-investor-action-btn">
              Actions ▾
            </Button>
          </Dropdown>
        ),
      },
    ],
    [handleDeactivateProject, handleViewProject]
  );

  const projectsTabPanel = useMemo(
    () => (
      <div className="admin-investor-stack">
        <Card bordered={false} className="admin-investor-panel">
          <div className="admin-investor-panel-head admin-investor-panel-head--plain">
            <span>Projects (investor programme)</span>
            <Space wrap>
              <Search
                placeholder="Search project, branch…"
                allowClear
                style={{ width: 260 }}
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
              />
              <Select
                value={projectProgrammeStateFilter}
                onChange={setProjectProgrammeStateFilter}
                style={{ width: 160 }}
                options={[
                  { value: "all", label: "All states" },
                  { value: "Open", label: "Open" },
                  { value: "Financed", label: "Financed" },
                  { value: "Planning", label: "Planning" },
                  { value: "Paused", label: "Paused" },
                ]}
              />
              <Button type="primary" onClick={() => setActiveModal(MODAL.CREATE_PROJECT)}>
                Create project
              </Button>
            </Space>
          </div>
          <Table
            columns={projectsProgrammeColumns}
            dataSource={projectsTableRows}
            loading={projectsListLoading}
            pagination={false}
            size="small"
            rowKey="key"
            scroll={{ x: 1280 }}
          />
          <Text type="secondary" className="admin-investor-footnote">
            Maps to investors.Project: capacity, costs, branch link, investor target, and linked Investor when financed.
          </Text>
        </Card>

        <Card bordered={false} className="admin-investor-panel">
          <div className="admin-investor-panel-head admin-investor-panel-head--plain">
            <span>Project performance</span>
            <Space size={8}>
              <Segmented size="small" options={["Top", "Bottom"]} value={perfMode} onChange={setPerfMode} />
              <Button size="small" className="admin-investor-filter-btn">
                Total generation (kWh) ▾
              </Button>
            </Space>
          </div>
          <Table
            columns={perfColumns}
            dataSource={perfRows}
            pagination={false}
            size="small"
            rowKey="key"
            scroll={{ x: 1100 }}
          />
          <Text type="secondary" className="admin-investor-footnote">
            Branch telemetry blend: total / average daily generation, solar share of branch load, and operational status.
          </Text>
        </Card>
      </div>
    ),
    [
      projectSearch,
      projectProgrammeStateFilter,
      projectsProgrammeColumns,
      projectsTableRows,
      projectsListLoading,
      perfMode,
      perfColumns,
      perfRows,
    ]
  );

  const investorIdSelectOptions = useMemo(
    () =>
      (investorUsersList?.results || []).map((r) => ({
        value: r.id,
        label: `${r.legal_name || "—"} (${r.investor_ref || r.id})`,
      })),
    [investorUsersList]
  );

  const projectIdSelectOptions = useMemo(
    () =>
      (adminProjectsList?.results || []).map((p) => ({
        value: p.id,
        label: p.name || `Project #${p.id}`,
      })),
    [adminProjectsList]
  );

  const createInvestmentCapitalAmount = useMemo(() => {
    const pid = Number(createInvestmentProjectId);
    if (!Number.isFinite(pid)) return null;
    const p = (adminProjectsList?.results || []).find((x) => Number(x.id) === pid);
    if (!p) return null;
    const tgt = Number(p.investor_funding_target ?? 0);
    if (Number.isFinite(tgt) && tgt > 0) return tgt;
    const total = Number(p.total_project_cost ?? 0);
    const client = Number(p.client_contribution ?? 0);
    const computed = total - client;
    return Number.isFinite(computed) && computed > 0 ? computed : null;
  }, [adminProjectsList, createInvestmentProjectId]);

  const createProjectPrincipalAmount = useMemo(() => {
    const total = Number(createProjectTotalCost ?? 0);
    const client = Number(createProjectClientContribution ?? 0);
    const computed = total - client;
    if (!Number.isFinite(computed)) return 0;
    return Math.max(0, computed);
  }, [createProjectTotalCost, createProjectClientContribution]);

  const createInvestmentTotalRepayable = useMemo(() => {
    const cap = Number(createInvestmentCapitalAmount ?? 0);
    const pct = Number(createInvestmentInterestPercent ?? 0);
    if (!Number.isFinite(cap) || cap <= 0) return null;
    if (!Number.isFinite(pct) || pct < 0) return null;
    const basis = String(createInvestmentInterestBasis || "total").toLowerCase();
    if (basis === "total") return cap * (1 + pct / 100);
    // annual basis: keep UI-only; backend will define compounding rules.
    return cap;
  }, [createInvestmentCapitalAmount, createInvestmentInterestPercent, createInvestmentInterestBasis]);

  const investmentIdSelectOptions = useMemo(
    () =>
      (adminInvestmentsList?.results || []).map((inv) => ({
        value: inv.id,
        label: `#${inv.id} ${inv.investor_name} → ${inv.project_name}`,
      })),
    [adminInvestmentsList]
  );

  const payoutScheduleSelectOptions = useMemo(
    () =>
      payoutSchedules.map((s) => ({
        value: s.id,
        label: `${s.label || `ID ${s.id}`} · due ${s.due_date} · rem ${ngnCompact(
          Number(s.amount_remaining ?? s.amount_due_investor_share ?? s.amount_due ?? 0)
        )}`,
      })),
    [payoutSchedules]
  );

  const filteredInvestmentResults = useMemo(() => {
    const results = adminInvestmentsList?.results || [];
    const q = investmentSearch.trim().toLowerCase();
    if (!q) return results;
    return results.filter(
      (r) =>
        String(r.id).includes(q) ||
        r.investor_name?.toLowerCase().includes(q) ||
        r.project_name?.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q)
    );
  }, [adminInvestmentsList, investmentSearch]);

  const investmentsListRows = useMemo(
    () =>
      filteredInvestmentResults.map((r) => ({
        key: String(r.id),
        id: r.id,
        investorName: r.investor_name,
        projectName: r.project_name,
        capital: r.capital_amount,
        scoreMain: "—",
        scoreSub: "—",
        planLabel: r.repayment_plan_id != null ? "36-mo" : "—",
      })),
    [filteredInvestmentResults]
  );

  const investmentsListColumns = useMemo(
    () => [
      { title: "ID", dataIndex: "id", key: "id", width: 90 },
      { title: "Investor", dataIndex: "investorName", key: "investorName", ellipsis: true },
      { title: "Project", dataIndex: "projectName", key: "projectName", ellipsis: true },
      {
        title: "Capital",
        dataIndex: "capital",
        key: "capital",
        width: 140,
        render: (v) => ngnCompact(Number(v)),
      },
      {
        title: "Score",
        key: "score",
        width: 200,
        render: (_, row) => (
          <div className="admin-investor-score-cell">
            <div className="admin-investor-score-main">{row.scoreMain}</div>
            <div className="admin-investor-score-sub">{row.scoreSub}</div>
          </div>
        ),
      },
      {
        title: "Plan",
        dataIndex: "planLabel",
        key: "planLabel",
        width: 110,
        render: (v) => <Tag className="admin-investor-pill">{v}</Tag>,
      },
      {
        title: "Actions",
        key: "actions",
        width: 110,
        render: (_, record) => (
          <Dropdown
            menu={{
              items: [
                { key: "view", label: "View", onClick: () => handleViewInvestment(record.id) },
                {
                  key: "deactivate",
                  label: "Deactivate",
                  danger: true,
                  onClick: () => handleDeactivateInvestment(record),
                },
              ],
            }}
            trigger={["click"]}
          >
            <Button size="small" className="admin-investor-action-btn">
              Actions ▾
            </Button>
          </Dropdown>
        ),
      },
    ],
    [handleDeactivateInvestment, handleViewInvestment]
  );

  const filteredCustomerPaymentResults = useMemo(() => {
    const results = adminCustomerPaymentsList?.results || [];
    const q = customerPaymentSearch.trim().toLowerCase();
    if (!q) return results;
    return results.filter(
      (r) =>
        String(r.id).includes(q) ||
        r.project_name?.toLowerCase().includes(q) ||
        String(r.customer_schedule_id || "").includes(q) ||
        r.reference?.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q)
    );
  }, [adminCustomerPaymentsList, customerPaymentSearch]);

  const customerPaymentsListRows = useMemo(
    () =>
      filteredCustomerPaymentResults.map((r) => ({
        key: String(r.id),
        id: r.id,
        projectName: r.project_name,
        scheduleId: r.customer_schedule_id,
        amount: r.amount_received,
        paymentDate: r.payment_date,
        method: r.payment_method,
        reference: r.reference,
        notes: r.notes,
        createdAt: r.created_at,
      })),
    [filteredCustomerPaymentResults]
  );

  const customerPaymentsListColumns = useMemo(
    () => [
      { title: "ID", dataIndex: "id", width: 72 },
      { title: "Project", dataIndex: "projectName", ellipsis: true },
      { title: "Schedule", dataIndex: "scheduleId", width: 90 },
      {
        title: "Amount",
        dataIndex: "amount",
        width: 120,
        render: (v) => ngnCompact(Number(v)),
      },
      { title: "Date", dataIndex: "paymentDate", width: 110 },
      { title: "Method", dataIndex: "method", width: 100 },
      { title: "Reference", dataIndex: "reference", ellipsis: true, width: 130 },
      {
        title: "Actions",
        key: "actions",
        width: 120,
        fixed: "right",
        render: (_, record) => (
          <Dropdown
            menu={{
              items: [
                { key: "view", label: "View", onClick: () => handleViewCustomerPayment(record.id) },
                {
                  key: "deactivate",
                  label: "Deactivate",
                  danger: true,
                  onClick: () => handleDeactivateCustomerPayment(record),
                },
              ],
            }}
            trigger={["click"]}
          >
            <Button size="small" className="admin-investor-action-btn">
              Actions ▾
            </Button>
          </Dropdown>
        ),
      },
    ],
    [handleDeactivateCustomerPayment, handleViewCustomerPayment]
  );

  const filteredPayoutResults = useMemo(() => {
    const results = adminInvestorPayoutsList?.results || [];
    const q = payoutSearch.trim().toLowerCase();
    if (!q) return results;
    return results.filter(
      (r) =>
        String(r.id).includes(q) ||
        String(r.investment_id || "").includes(q) ||
        String(r.schedule_id || "").includes(q) ||
        r.reference?.toLowerCase().includes(q) ||
        r.project?.name?.toLowerCase().includes(q)
    );
  }, [adminInvestorPayoutsList, payoutSearch]);

  const payoutsListRows = useMemo(
    () =>
      filteredPayoutResults.map((r) => ({
        key: String(r.id),
        id: r.id,
        investmentId: r.investment_id,
        projectName: r.project?.name,
        scheduleId: r.schedule_id,
        amountPaid: r.amount_paid,
        paidDate: r.paid_date,
        paymentMethod: r.payment_method,
        reference: r.reference,
        createdAt: r.created_at,
      })),
    [filteredPayoutResults]
  );

  const payoutsListColumns = useMemo(
    () => [
      { title: "ID", dataIndex: "id", width: 72 },
      { title: "Investment", dataIndex: "investmentId", width: 100 },
      { title: "Project", dataIndex: "projectName", ellipsis: true },
      { title: "Schedule", dataIndex: "scheduleId", width: 90 },
      {
        title: "Amount paid",
        dataIndex: "amountPaid",
        width: 120,
        render: (v) => ngnCompact(Number(v)),
      },
      { title: "Paid date", dataIndex: "paidDate", width: 110 },
      { title: "Method", dataIndex: "paymentMethod", width: 120 },
      { title: "Reference", dataIndex: "reference", ellipsis: true, width: 130 },
      {
        title: "Actions",
        key: "actions",
        width: 120,
        fixed: "right",
        render: (_, record) => (
          <Dropdown
            menu={{
              items: [
                { key: "view", label: "View", onClick: () => handleViewPayout(record.id) },
                {
                  key: "deactivate",
                  label: "Deactivate",
                  danger: true,
                  onClick: () => handleDeactivatePayout(record),
                },
              ],
            }}
            trigger={["click"]}
          >
            <Button size="small" className="admin-investor-action-btn">
              Actions ▾
            </Button>
          </Dropdown>
        ),
      },
    ],
    [handleDeactivatePayout, handleViewPayout]
  );

  const paymentsTabPanel = useMemo(
    () => (
      <div className="admin-investor-stack">
        <Card bordered={false} className="admin-investor-panel">
          <div className="admin-investor-panel-head admin-investor-panel-head--plain">
            <span>Customer payments received</span>
            <Space>
              <Search
                placeholder="Search project, schedule, reference…"
                allowClear
                style={{ width: 280 }}
                value={customerPaymentSearch}
                onChange={(e) => setCustomerPaymentSearch(e.target.value)}
              />
              <Button type="primary" onClick={() => setActiveModal(MODAL.RECORD_PAYMENT)}>
                Record payment
              </Button>
            </Space>
          </div>
          <Table
            columns={[
              { title: "When", dataIndex: "when", key: "when", width: 120 },
              { title: "Branch", dataIndex: "branch", key: "branch", width: 140 },
              { title: "Event", dataIndex: "event", key: "event" },
              { title: "Amount", dataIndex: "amount", key: "amount", width: 120 },
              {
                title: "Status",
                dataIndex: "status",
                key: "status",
                width: 130,
                render: (v) => (
                  <Tag
                    color={
                      String(v).toLowerCase().includes("missed")
                        ? "red"
                        : String(v).toLowerCase().includes("pending") || String(v).toLowerCase().includes("partial")
                          ? "gold"
                          : "green"
                    }
                    className="admin-investor-pill"
                  >
                    {v}
                  </Tag>
                ),
              },
              {
                title: "",
                key: "view",
                width: 170,
                render: () => (
                  <Button size="small" className="admin-investor-action-btn" onClick={openCustomerRepayment}>
                    View schedule
                  </Button>
                ),
              },
            ]}
            dataSource={filteredMockCustomerPaymentsReceived}
            pagination={false}
            size="small"
            rowKey="key"
            scroll={{ x: 980 }}
          />
          <Text type="secondary" className="admin-investor-footnote">
            Mock data only. Backend will provide the proper endpoint(s) for this table.
          </Text>
        </Card>

        <Card bordered={false} className="admin-investor-panel">
          <div className="admin-investor-panel-head admin-investor-panel-head--plain">
            <span>Investor repayments received</span>
            <Space>
              <Search
                placeholder="Search project, investment, reference…"
                allowClear
                style={{ width: 280 }}
                value={payoutSearch}
                onChange={(e) => setPayoutSearch(e.target.value)}
              />
              <Button type="primary" onClick={() => setActiveModal(MODAL.POST_PAYOUT)}>
                Post payout
              </Button>
            </Space>
          </div>
          <Table
            columns={[
              { title: "When", dataIndex: "when", key: "when", width: 120 },
              { title: "Investor", dataIndex: "investor", key: "investor", width: 120 },
              { title: "Investment", dataIndex: "investment", key: "investment", width: 120 },
              { title: "Amount", dataIndex: "amount", key: "amount", width: 120 },
              {
                title: "Status",
                dataIndex: "status",
                key: "status",
                width: 130,
                render: (v) => (
                  <Tag
                    color={
                      String(v).toLowerCase().includes("missed")
                        ? "red"
                        : String(v).toLowerCase().includes("scheduled")
                          ? "blue"
                          : "green"
                    }
                    className="admin-investor-pill"
                  >
                    {v}
                  </Tag>
                ),
              },
              {
                title: "",
                key: "view",
                width: 170,
                render: () => (
                  <Button size="small" className="admin-investor-action-btn" onClick={openInvestorPayment}>
                    View schedule
                  </Button>
                ),
              },
            ]}
            dataSource={filteredMockInvestorRepaymentsReceived}
            pagination={false}
            size="small"
            rowKey="key"
            scroll={{ x: 1100 }}
          />
          <Text type="secondary" className="admin-investor-footnote">
            Mock data only. Backend will provide the proper endpoint(s) for this table.
          </Text>
        </Card>

        <Card bordered={false} className="admin-investor-panel">
          <div className="admin-investor-panel-head admin-investor-panel-head--plain">
            <span>Upcoming customer payments</span>
            <Button size="small" className="admin-investor-filter-btn">
              Scheduled ▾
            </Button>
          </div>
          <Table
            columns={[
              { title: "When", dataIndex: "when", key: "when", width: 120 },
              { title: "Branch", dataIndex: "branch", key: "branch", width: 140 },
              { title: "Event", dataIndex: "event", key: "event" },
              { title: "Amount", dataIndex: "amount", key: "amount", width: 120 },
              {
                title: "Status",
                dataIndex: "status",
                key: "status",
                width: 130,
                render: (v) => (
                  <Tag
                    color={String(v).toLowerCase().includes("overdue") ? "red" : String(v).toLowerCase().includes("due") ? "gold" : "green"}
                    className="admin-investor-pill"
                  >
                    {v}
                  </Tag>
                ),
              },
              {
                title: "Action",
                key: "action",
                width: 150,
                render: () => (
                  <Button size="small" type="primary" className="admin-investor-action-btn" onClick={() => setActiveModal(MODAL.RECORD_PAYMENT)}>
                    Record payment
                  </Button>
                ),
              },
            ]}
            dataSource={[
              { key: "upc-1", when: "Today", branch: "Eko", event: "Customer installment", amount: "₦0.21B", status: "Due soon" },
              { key: "upc-2", when: "In 3 days", branch: "Ib", event: "Due soon", amount: "₦1.02B", status: "Due soon" },
              { key: "upc-3", when: "07 May", branch: "Abj", event: "Customer installment", amount: "₦0.68B", status: "Scheduled" },
              { key: "upc-4", when: "09 May", branch: "Ph", event: "Underpaid follow-up", amount: "₦0.41B", status: "Scheduled" },
              { key: "upc-5", when: "12 May", branch: "Enu", event: "Customer installment", amount: "₦0.54B", status: "Scheduled" },
            ]}
            pagination={false}
            size="small"
            rowKey="key"
            scroll={{ x: 980 }}
          />
          <Text type="secondary" className="admin-investor-footnote">
            Mock data only. Backend will confirm the correct schedule endpoint for upcoming customer payments.
          </Text>
        </Card>

        <Card bordered={false} className="admin-investor-panel">
          <div className="admin-investor-panel-head admin-investor-panel-head--plain">
            <span>Upcoming investor repayments</span>
            <Button size="small" className="admin-investor-filter-btn">
              Scheduled ▾
            </Button>
          </div>
          <Table
            columns={[
              { title: "Due", dataIndex: "due", key: "due", width: 120 },
              { title: "Investor", dataIndex: "investor", key: "investor", width: 120 },
              { title: "Investment", dataIndex: "investment", key: "investment", width: 120 },
              { title: "Due amount", dataIndex: "dueAmount", key: "dueAmount", width: 120 },
              {
                title: "Status",
                dataIndex: "status",
                key: "status",
                width: 130,
                render: (v) => (
                  <Tag color={String(v).toLowerCase().includes("missed") ? "red" : String(v).toLowerCase().includes("pending") ? "gold" : "green"} className="admin-investor-pill">
                    {v}
                  </Tag>
                ),
              },
              {
                title: "Action",
                key: "action",
                width: 140,
                render: () => (
                  <Button size="small" type="primary" className="admin-investor-action-btn" onClick={() => setActiveModal(MODAL.POST_PAYOUT)}>
                    Post payout
                  </Button>
                ),
              },
            ]}
            dataSource={[
              { key: "upi-1", due: "28 Apr", investor: "INV-10042", investment: "#IT-062", dueAmount: "₦0.11B", status: "Pending" },
              { key: "upi-2", due: "30 Apr", investor: "INV-10088", investment: "#IT-088", dueAmount: "₦0.32B", status: "Pending" },
              { key: "upi-3", due: "02 May", investor: "INV-10102", investment: "#IT-091", dueAmount: "₦0.29B", status: "Scheduled" },
              { key: "upi-4", due: "15 May", investor: "INV-10042", investment: "#IT-094", dueAmount: "₦0.26B", status: "Missed" },
              { key: "upi-5", due: "18 May", investor: "INV-10102", investment: "#IT-102", dueAmount: "₦0.14B", status: "Pending" },
            ]}
            pagination={false}
            size="small"
            rowKey="key"
            scroll={{ x: 980 }}
          />
          <Text type="secondary" className="admin-investor-footnote">
            Mock data only. Backend will provide the proper endpoint(s) for upcoming investor repayments.
          </Text>
        </Card>
      </div>
    ),
    [
      customerPaymentSearch,
      payoutSearch,
      filteredMockCustomerPaymentsReceived,
      filteredMockInvestorRepaymentsReceived,
    ]
  );

  const ticketsTabPanel = useMemo(() => {
    const baseTickets = [
      {
        key: "TCK-402118",
        id: "TCK-402118",
        subjectTag: "[INVESTMENT]",
        investor: "Northwind Energy LP",
        ref: "INV-10042",
        investorEmail: "northwind.lp@example.com",
        subject: "Interest in Access Ayobo 2",
        status: "Resolved",
        created: "24 Apr 2026 · 09:14",
        updated: "27 Apr 2026 · 11:02",
      },
      {
        key: "SUP-883201",
        id: "SUP-883201",
        subjectTag: "[SUPPORT]",
        investor: "Lagos Solar Holdings",
        ref: "INV-10088",
        investorEmail: "support@lagossolar.example.com",
        subject: "Account access",
        status: "Closed",
        created: "18 Apr 2026 · 16:40",
        updated: "22 Apr 2026 · 08:55",
      },
      {
        key: "TCK-410902",
        id: "TCK-410902",
        subjectTag: "[INVESTMENT]",
        investor: "Helio Partners",
        ref: "INV-10244",
        investorEmail: "desk@heliopartners.example.com",
        subject: "Wyre Office pilot allocation",
        status: "Reactivated",
        created: "28 Apr 2026 · 07:51",
        updated: "—",
      },
    ];

    const rows = baseTickets
      .map((t) => ({
        ...t,
        status: ticketStatuses?.[t.id] || t.status,
      }))
      .filter((t) => {
        if (ticketsTableMode === "responded") return Boolean((ticketResponses?.[t.id] || []).length);
        if (ticketsTableMode === "open") return !["resolved", "closed"].includes(String(t.status).toLowerCase());
        return true;
      });

    return (
      <div className="admin-investor-stack">
        <Card bordered={false} className="admin-investor-panel">
          <div className="admin-investor-panel-head admin-investor-panel-head--plain">
            <span>Support tickets (investment + general)</span>
            <Space>
              <Select
                size="small"
                value={ticketsTableMode}
                onChange={setTicketsTableMode}
                style={{ width: 160 }}
                options={[
                  { value: "all", label: "All tickets" },
                  { value: "open", label: "Open only" },
                  { value: "responded", label: "Responded" },
                ]}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Responses are stored in this browser session (mock)
              </Text>
            </Space>
          </div>

          <Table
            columns={[
              { title: "ID", dataIndex: "id", key: "id", width: 130 },
              { title: "SUBJECT TAG", dataIndex: "subjectTag", key: "subjectTag", width: 140 },
              {
                title: "INVESTOR",
                dataIndex: "investor",
                key: "investor",
                render: (_, r) => (
                  <div className="admin-investor-ticket-investor">
                    <div className="admin-investor-ticket-investor-name">{r.investor}</div>
                    <div className="admin-investor-ticket-investor-ref">{r.ref}</div>
                  </div>
                ),
              },
              {
                title: "STATUS",
                dataIndex: "status",
                key: "status",
                width: 120,
                render: (v) => (
                  <Tag
                    color={String(v).toLowerCase() === "resolved" ? "green" : String(v).toLowerCase() === "closed" ? "gold" : "blue"}
                    className="admin-investor-pill"
                  >
                    {v}
                  </Tag>
                ),
              },
              { title: "CREATED", dataIndex: "created", key: "created", width: 150 },
              { title: "UPDATED", dataIndex: "updated", key: "updated", width: 150 },
              {
                title: "RESPOND",
                key: "respond",
                width: 170,
                render: (_, r) => {
                  const has = Boolean((ticketResponses?.[r.id] || []).length);
                  return (
                    <Space size={8}>
                      {has ? (
                        <Tag color="green" className="admin-investor-pill">
                          Responded
                        </Tag>
                      ) : (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Not yet
                        </Text>
                      )}
                      <Button
                        size="small"
                        type="primary"
                        className="admin-investor-action-btn"
                        onClick={() =>
                          openTicketResponse(r.id, {
                            ticketId: r.id,
                            subjectTag: r.subjectTag,
                            subject: r.subject,
                            investor: r.investor,
                            investorRef: r.ref,
                            investorEmail: r.investorEmail,
                          })
                        }
                      >
                        {has ? "Add response" : "Respond"}
                      </Button>
                    </Space>
                  );
                },
              },
              {
                title: "ACTIONS",
                key: "actions",
                width: 140,
                render: (_, r) => (
                  <Select
                    size="small"
                    value={String(r.status || "Open")}
                    style={{ width: "100%" }}
                    options={["Open", "Reactivated", "Resolved", "Closed"].map((v) => ({ value: v, label: v }))}
                    onChange={(v) => setTicketStatuses((prev) => ({ ...(prev || {}), [r.id]: v }))}
                  />
                ),
              },
            ]}
            dataSource={rows}
            pagination={false}
            size="small"
            rowKey="key"
            scroll={{ x: 1080 }}
          />

          <Text type="secondary" className="admin-investor-footnote">
            Production maps SupportTicket to the portal user’s email. Respond shows staff notes for this ticket; after the first note, the row shows Responded.
          </Text>
        </Card>
      </div>
    );
  }, [openTicketResponse, ticketResponses, ticketStatuses, ticketsTableMode]);

  if (!isSuperAdmin) {
    return (
      <div style={{ padding: 18 }}>
        <Card bordered={false}>
          <Title level={4} style={{ margin: 0 }}>
            Investor administration
          </Title>
          <Text type="secondary">This page is only available to SUPERADMIN users.</Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="admin-investor-page">
      <div className="admin-investor-topbar">
        <div>
          <Title level={3} className="admin-investor-title">
            Investor administration
          </Title>
        </div>
        <Space wrap>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="admin-investor-cta"
            onClick={() => setActiveModal(MODAL.CREATE_INVESTOR)}
          >
            Create investor user
          </Button>
          <Button className="admin-investor-cta" onClick={() => setActiveModal(MODAL.CREATE_PROJECT)}>
            Create project
          </Button>
          <Button className="admin-investor-cta" onClick={() => setActiveModal(MODAL.CREATE_INVESTMENT)}>
            Create investment
          </Button>
          <Button className="admin-investor-cta" onClick={() => setActiveModal(MODAL.RECORD_PAYMENT)}>
            Record customer payment
          </Button>
          <Button className="admin-investor-cta" onClick={() => setActiveModal(MODAL.POST_PAYOUT)}>
            Post investor payout
          </Button>
        </Space>
      </div>

      <div className="admin-investor-metrics">
        {metrics.map((m) => (
          <MetricCard key={m.key} {...m} />
        ))}
      </div>

      <Card bordered={false} className="admin-investor-tabs-card">
        <Tabs
          defaultActiveKey="overview"
          items={[
            {
              key: "overview",
              label: "Overview",
              children: (
                <div className="admin-investor-overview-grid">
                  <Card
                    bordered={false}
                    className="admin-investor-panel"
                    title={
                      <div className="admin-investor-panel-head">
                        <span>Customers Repayment</span>
                        <Button size="small" className="admin-investor-filter-btn">
                          Recent customer payments ▾
                        </Button>
                      </div>
                    }
                  >
                    <Table
                      columns={customerRepaymentColumns}
                      dataSource={customerRepaymentRows}
                      pagination={false}
                      size="small"
                      rowKey="key"
                    />
                    <Text type="secondary" className="admin-investor-footnote">
                      Based on CustomerPayment + CustomerRepaymentSchedule. Keep customer PII hidden.
                    </Text>
                  </Card>

                  <div className="admin-investor-overview-row-split">
                    <Card
                      bordered={false}
                      className="admin-investor-panel"
                      title={
                        <div className="admin-investor-panel-head">
                          <span>Investors disbursement</span>
                          <Button size="small" className="admin-investor-filter-btn">
                            Upcoming ▾
                          </Button>
                        </div>
                      }
                    >
                      <Table
                        columns={disbursementColumns}
                        dataSource={disbursementRows}
                        pagination={false}
                        size="small"
                        rowKey="key"
                      />
                      <Text type="secondary" className="admin-investor-footnote">
                        Based on PaymentSchedule and linked InvestorDisbursement reconciliation.
                      </Text>
                    </Card>

                    <Card
                      bordered={false}
                      className="admin-investor-panel"
                      title={
                        <div className="admin-investor-panel-head">
                          <span>Project performance</span>
                          <Space size={8}>
                            <Segmented
                              size="small"
                              options={["Top", "Bottom"]}
                              value={perfMode}
                              onChange={setPerfMode}
                            />
                            <Button size="small" className="admin-investor-filter-btn">
                              Total generation (kWh) ▾
                            </Button>
                          </Space>
                        </div>
                      }
                    >
                      <Table
                        columns={perfColumns}
                        dataSource={perfRows}
                        pagination={false}
                        size="small"
                        rowKey="key"
                      />
                      <Text type="secondary" className="admin-investor-footnote">
                        Branch telemetry blend: total / average daily generation, solar share of branch load, and operational status.
                      </Text>
                    </Card>
                  </div>

                  <Card bordered={false} className="admin-investor-panel admin-investor-wide">
                    <div className="admin-investor-panel-head admin-investor-panel-head--plain">
                      <span>Finance overview — by investor</span>
                    </div>
                    <Table
                      columns={[
                        { title: "Investor", dataIndex: "investor", key: "investor" },
                        { title: "Ref", dataIndex: "ref", key: "ref", width: 120 },
                        { title: "Capital deployed", dataIndex: "capital", key: "capital", width: 140 },
                        { title: "Interest (flat %)", dataIndex: "interest", key: "interest", width: 130 },
                        { title: "Paid to investor YTD", dataIndex: "paid", key: "paid", width: 160 },
                        {
                          title: "Health",
                          dataIndex: "health",
                          key: "health",
                          width: 140,
                          render: (v) => (
                            <Tag
                              color={v === "On track" ? "green" : v === "Watch" ? "gold" : "red"}
                              className="admin-investor-pill"
                            >
                              {v}
                            </Tag>
                          ),
                        },
                      ]}
                      dataSource={[
                        { key: "f1", investor: "Northwind Energy LP", ref: "INV-10042", capital: "₦48.20B", interest: "₦3.30B", paid: "₦12.40B", health: "On track" },
                        { key: "f2", investor: "Lagos Solar Holdings", ref: "INV-10088", capital: "₦22.10B", interest: "₦1.80B", paid: "₦6.20B", health: "Watch" },
                        { key: "f3", investor: "GreenGrid Africa", ref: "INV-10102", capital: "₦15.60B", interest: "₦0.90B", paid: "₦4.10B", health: "Overdue link" },
                        { key: "f4", investor: "Atlantic Renewables", ref: "INV-10201", capital: "₦9.30B", interest: "₦0.52B", paid: "₦2.80B", health: "On track" },
                        { key: "f5", investor: "Helio Partners", ref: "INV-10244", capital: "₦8.20B", interest: "₦0.41B", paid: "₦2.10B", health: "Watch" },
                        { key: "f6", investor: "Kaduna Green Fund", ref: "INV-10310", capital: "₦6.70B", interest: "₦0.28B", paid: "₦1.20B", health: "Overdue link" },
                      ]}
                      pagination={false}
                      size="small"
                      rowKey="key"
                    />
                  </Card>
                </div>
              ),
            },
            {
              key: "investors",
              label: "Investments & Investors",
              children: (
                <div className="admin-investor-stack">
                  <Card bordered={false} className="admin-investor-panel">
                    <div className="admin-investor-panel-head admin-investor-panel-head--plain">
                      <span>All investors</span>
                      <Space>
                        <Search
                          placeholder="Search name, ref, email"
                          allowClear
                          style={{ width: 260 }}
                          value={investorSearch}
                          onChange={(e) => setInvestorSearch(e.target.value)}
                        />
                        <Button type="primary" onClick={() => setActiveModal(MODAL.CREATE_INVESTOR)}>
                          Add investor
                        </Button>
                      </Space>
                    </div>
                    <Table
                      columns={investorsColumns}
                      dataSource={investorsTableRows}
                      loading={listLoading}
                      pagination={false}
                      size="small"
                      rowKey="key"
                    />
                  </Card>

                  <Card bordered={false} className="admin-investor-panel">
                    <div className="admin-investor-panel-head admin-investor-panel-head--plain">
                      <span>Investors & financed projects</span>
                      <Button size="small" className="admin-investor-filter-btn">
                        Most capital deployed ▾
                      </Button>
                    </div>
                    <Table
                      columns={[
                        { title: "Investor", dataIndex: "investor", key: "investor" },
                        { title: "Ref", dataIndex: "ref", key: "ref", width: 120 },
                        { title: "Capital deployed", dataIndex: "capital", key: "capital", width: 140 },
                        { title: "Interest (flat %)", dataIndex: "interest", key: "interest", width: 130 },
                        { title: "Paid to investor YTD", dataIndex: "paid", key: "paid", width: 160 },
                        {
                          title: "Health",
                          dataIndex: "health",
                          key: "health",
                          width: 140,
                          render: (v) => (
                            <Tag
                              color={
                                String(v).toLowerCase().includes("overdue")
                                  ? "red"
                                  : String(v).toLowerCase().includes("kyc")
                                    ? "gold"
                                    : "green"
                              }
                              className="admin-investor-pill"
                            >
                              {v}
                            </Tag>
                          ),
                        },
                      ]}
                      dataSource={[
                        { key: "ip1", investor: "Northwind Energy LP", ref: "INV-10042", capital: "₦48.20B", interest: "₦3.30B", paid: "₦12.40B", health: "1 overdue" },
                        { key: "ip2", investor: "Lagos Solar Holdings", ref: "INV-10088", capital: "₦22.10B", interest: "₦1.80B", paid: "₦6.20B", health: "On track" },
                        { key: "ip3", investor: "GreenGrid Africa", ref: "INV-10102", capital: "₦15.60B", interest: "₦0.90B", paid: "₦4.10B", health: "KYC review" },
                        { key: "ip4", investor: "Atlantic Renewables", ref: "INV-10201", capital: "₦9.30B", interest: "₦0.52B", paid: "₦2.80B", health: "On track" },
                        { key: "ip5", investor: "Helio Partners", ref: "INV-10244", capital: "₦8.20B", interest: "₦0.41B", paid: "₦2.10B", health: "Low telemetry" },
                      ]}
                      pagination={false}
                      size="small"
                      rowKey="key"
                    />
                    <Text type="secondary" className="admin-investor-footnote">
                      Same finance columns as Overview; project-level detail stays in the Investments table below.
                    </Text>
                  </Card>

                  <Card bordered={false} className="admin-investor-panel">
                    <div className="admin-investor-panel-head admin-investor-panel-head--plain">
                      <span>Investments</span>
                      <Space>
                        <Search
                          placeholder="Project, investor…"
                          allowClear
                          style={{ width: 280 }}
                          value={investmentSearch}
                          onChange={(e) => setInvestmentSearch(e.target.value)}
                        />
                        <Button type="primary" onClick={() => setActiveModal(MODAL.CREATE_INVESTMENT)}>
                          Create investment
                        </Button>
                      </Space>
                    </div>
                    <Table
                      columns={investmentsListColumns}
                      dataSource={investmentsListRows}
                      loading={investmentsListLoading}
                      pagination={false}
                      size="small"
                      rowKey="key"
                      scroll={{ x: 1100 }}
                    />
                  </Card>
                </div>
              ),
            },
            { key: "projects", label: "Projects", children: projectsTabPanel },
            { key: "payments", label: "Payments", children: paymentsTabPanel },
            { key: "tickets", label: "Tickets", children: ticketsTabPanel },
          ]}
        />
      </Card>

      <Modal
        open={ticketResponseOpen}
        onCancel={closeTicketResponse}
        title="Respond to ticket"
        width={860}
        className="admin-investor-modal"
        destroyOnClose
        footer={[
          <Button key="close" onClick={closeTicketResponse}>
            Close
          </Button>,
          <Button key="save" type="primary" onClick={saveTicketResponse} disabled={!activeTicketId || !String(ticketResponseDraft || "").trim()}>
            Save response
          </Button>,
        ]}
      >
        <Text type="secondary" style={{ display: "block", marginTop: -6 }}>
          {activeTicketMeta?.ticketId || activeTicketId || "—"} {activeTicketMeta?.subjectTag ? `· ${activeTicketMeta.subjectTag}` : ""}{" "}
          {activeTicketMeta?.subject ? `— ${activeTicketMeta.subject}` : ""}
        </Text>
        <Divider className="admin-modal-divider" />

        <Text type="secondary" style={{ display: "block", marginBottom: 10 }}>
          Use the investor&apos;s login email for replies (same address they use on the Wyre investor portal).
        </Text>

        <div className="admin-investor-ticket-email-box">
          <div className="admin-investor-ticket-email-top">
            <Text className="admin-investor-ticket-email-label">INVESTOR EMAIL</Text>
            <Space>
              <Text className="admin-investor-ticket-email">{activeTicketMeta?.investorEmail || "—"}</Text>
              <Button size="small" className="admin-investor-filter-btn" onClick={() => copyToClipboard(activeTicketMeta?.investorEmail)}>
                Copy email
              </Button>
            </Space>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Investor: {activeTicketMeta?.investor || "—"}
          </Text>
        </div>

        <Divider className="admin-modal-divider" />

        <div className="admin-investor-ticket-responses">
          <Text className="admin-investor-ticket-section-label">PREVIOUS RESPONSES</Text>
          <div className="admin-investor-ticket-responses-box">
            {(ticketResponses?.[activeTicketId] || []).length ? (
              (ticketResponses?.[activeTicketId] || []).map((r) => (
                <div key={r.id} className="admin-investor-ticket-response-item">
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs(r.at).format("DD MMM YYYY · HH:mm")} · {r.by}
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

      <Modal
        open={customerRepaymentOpen}
        onCancel={closePaymentModal}
        title={activePaymentMeta?.title || "Customer repayment"}
        width={860}
        className="admin-investor-modal"
        destroyOnClose
        footer={[
          <Button key="action" type="primary" className="admin-investor-cta" onClick={() => setActiveModal(MODAL.RECORD_PAYMENT)}>
            {activePaymentMeta?.actionLabel || "Record customer payment"}
          </Button>,
          <Button key="close" onClick={closePaymentModal}>
            Close
          </Button>,
        ]}
      >
        <Text type="secondary" style={{ display: "block", marginTop: -6 }}>
          {activePaymentMeta?.subtitle || "—"}
        </Text>
        <Divider className="admin-modal-divider" />
        <div className="admin-investor-payment-head">
          <Text style={{ fontWeight: 900 }}>Customer repayment</Text>
          <Space size={10}>
            <Text type="secondary">{activePaymentMeta?.ref}</Text>
            <Text type="secondary">·</Text>
            <Text type="secondary">{activePaymentMeta?.cadence}</Text>
          </Space>
        </div>
        <Table
          size="small"
          rowKey="key"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          dataSource={mockCustomerRepaymentSchedule}
          columns={[
            { title: "#", dataIndex: "idx", width: 60 },
            { title: "DUE", dataIndex: "due", width: 140 },
            { title: "DUE", dataIndex: "dueAmount", width: 140 },
            { title: "PAID", dataIndex: "paid", width: 140 },
            { title: "LEFT", dataIndex: "left", width: 120 },
            {
              title: "STATUS",
              dataIndex: "status",
              width: 140,
              render: (v) => (
                <Tag
                  color={String(v).toLowerCase() === "paid" ? "green" : String(v).toLowerCase() === "scheduled" ? "gold" : "blue"}
                  className="admin-investor-pill"
                >
                  {v}
                </Tag>
              ),
            },
          ]}
        />
        <Text type="secondary" className="admin-investor-footnote">
          Mock excerpt near today. Production loads full CustomerRepaymentSchedule with pagination.
        </Text>
      </Modal>

      <Modal
        open={investorPaymentOpen}
        onCancel={closePaymentModal}
        title={activePaymentMeta?.title || "Investor payment"}
        width={860}
        className="admin-investor-modal"
        destroyOnClose
        footer={[
          <Button key="action" type="primary" className="admin-investor-cta" onClick={() => setActiveModal(MODAL.POST_PAYOUT)}>
            {activePaymentMeta?.actionLabel || "Post investor payout"}
          </Button>,
          <Button key="close" onClick={closePaymentModal}>
            Close
          </Button>,
        ]}
      >
        <Text type="secondary" style={{ display: "block", marginTop: -6 }}>
          {activePaymentMeta?.subtitle || "—"}
        </Text>
        <Divider className="admin-modal-divider" />
        <div className="admin-investor-payment-head">
          <Text style={{ fontWeight: 900 }}>Investor payment</Text>
          <Space size={10}>
            <Text type="secondary">{activePaymentMeta?.ref}</Text>
          </Space>
        </div>
        <Table
          size="small"
          rowKey="key"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          dataSource={mockInvestorPaymentSchedule}
          columns={[
            { title: "#", dataIndex: "idx", width: 60 },
            { title: "DUE", dataIndex: "due", width: 140 },
            { title: "DUE", dataIndex: "dueAmount", width: 140 },
            { title: "PAID", dataIndex: "paid", width: 140 },
            { title: "LEFT", dataIndex: "left", width: 120 },
            {
              title: "STATUS",
              dataIndex: "status",
              width: 140,
              render: (v) => (
                <Tag
                  color={String(v).toLowerCase() === "paid" ? "green" : String(v).toLowerCase() === "scheduled" ? "gold" : "blue"}
                  className="admin-investor-pill"
                >
                  {v}
                </Tag>
              ),
            },
          ]}
        />
        <Text type="secondary" className="admin-investor-footnote">
          Mock excerpt near today. Production loads full PaymentSchedule (investor) with pagination.
        </Text>
      </Modal>

      {/* Create investor user */}
      <Modal
        open={activeModal === MODAL.CREATE_INVESTOR}
        onCancel={closeModal}
        title="Create investor user"
        width={820}
        className="admin-investor-modal"
        destroyOnClose
        footer={[
          <Button key="cancel" onClick={closeModal} disabled={createLoading}>
            Cancel
          </Button>,
          <Button key="save" type="primary" loading={createLoading} onClick={submitCreateInvestor}>
            Save
          </Button>,
        ]}
      >
        <Text type="secondary" className="admin-modal-subtitle">
          Creates an investor profile and linked user via POST <Text code>/api/v1/investors/admin/investor-users/</Text>.
        </Text>
        <Form
          form={investorForm}
          layout="vertical"
          className="admin-modal-form"
          initialValues={{ country: "NG", kycTier: "pending", kycStatus: "pending", active: "Yes" }}
        >
          <div className="admin-modal-grid">
            <Form.Item name="username" label="Username" rules={[{ required: true, message: "Required" }]}>
              <Input placeholder="e.g. northwind.ops" />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Enter a valid email" }]}>
              <Input placeholder="name@company.com" />
            </Form.Item>

            <Form.Item name="firstName" label="First name">
              <Input placeholder="Optional" />
            </Form.Item>
            <Form.Item name="lastName" label="Last name">
              <Input placeholder="Optional" />
            </Form.Item>

            <Form.Item name="tempPassword" label="Temporary password" rules={[{ required: true, message: "Required" }]}>
              <Input.Password placeholder="Set initial password" />
            </Form.Item>
            <Form.Item name="legalName" label="Legal name (investor)" rules={[{ required: true, message: "Required" }]}>
              <Input placeholder="Company / individual legal name" />
            </Form.Item>

            <Form.Item name="phone" label="Phone">
              <Input placeholder="+234…" />
            </Form.Item>
            <Form.Item name="country" label="Country (ISO-2)">
              <Input placeholder="NG" />
            </Form.Item>

            <Form.Item name="kycTier" label="KYC tier">
              <Select options={KYC_TIER_OPTIONS} />
            </Form.Item>
            <Form.Item name="kycStatus" label="KYC status">
              <Select options={KYC_STATUS_OPTIONS} />
            </Form.Item>

            <Form.Item name="active" label="Active">
              <Select options={[{ value: "Yes" }, { value: "No" }].map((o) => ({ value: o.value, label: o.value }))} />
            </Form.Item>
          </div>

          <Divider className="admin-modal-divider" />

          <div className="admin-modal-section-title">
            Banking details <Text type="secondary">(optional now)</Text>
          </div>
          <Text type="secondary" className="admin-modal-section-sub">
            Matches InvestorBankingDetail.
          </Text>

          <div className="admin-modal-grid">
            <Form.Item name="bankAccountName" label="Account name">
              <Input placeholder="Optional" />
            </Form.Item>
            <Form.Item name="bankName" label="Bank name">
              <Input placeholder="Optional" />
            </Form.Item>
            <Form.Item name="bankAccountNumber" label="Account number">
              <Input placeholder="Optional" />
            </Form.Item>
            <Form.Item name="currency" label="Currency">
              <Input placeholder="NGN" />
            </Form.Item>
            <Form.Item name="taxId" label="Tax ID">
              <Input placeholder="Optional" />
            </Form.Item>
            <Form.Item name="primaryAccount" label="Primary account">
              <Select options={[{ value: "Yes" }, { value: "No" }].map((o) => ({ value: o.value, label: o.value }))} />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        open={investorDetailOpen}
        onCancel={closeInvestorDetail}
        title="Investor details"
        width={720}
        className="admin-investor-modal"
        footer={[
          <Button key="close" type="primary" onClick={closeInvestorDetail}>
            Close
          </Button>,
        ]}
        destroyOnClose
      >
        {detailLoading ? (
          <Text type="secondary">Loading…</Text>
        ) : investorUserDetail ? (
          <>
            <Descriptions bordered size="small" column={1} className="admin-investor-detail-desc">
              <Descriptions.Item label="Investor ref">{investorUserDetail.investor_ref}</Descriptions.Item>
              <Descriptions.Item label="Legal name">{investorUserDetail.legal_name}</Descriptions.Item>
              <Descriptions.Item label="Phone">{investorUserDetail.phone || "—"}</Descriptions.Item>
              <Descriptions.Item label="Country">{investorUserDetail.country || "—"}</Descriptions.Item>
              <Descriptions.Item label="KYC tier">{investorUserDetail.kyc_tier}</Descriptions.Item>
              <Descriptions.Item label="KYC status">{investorUserDetail.kyc_status}</Descriptions.Item>
              <Descriptions.Item label="Investor active">{investorUserDetail.is_active ? "Yes" : "No"}</Descriptions.Item>
              <Descriptions.Item label="Username">{investorUserDetail.user?.username}</Descriptions.Item>
              <Descriptions.Item label="Email">{investorUserDetail.user?.email || "—"}</Descriptions.Item>
              <Descriptions.Item label="Name">
                {[investorUserDetail.user?.first_name, investorUserDetail.user?.last_name].filter(Boolean).join(" ") || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="User active">{investorUserDetail.user?.is_active ? "Yes" : "No"}</Descriptions.Item>
              <Descriptions.Item label="Investments (count)">
                {Array.isArray(investorUserDetail.investments) ? investorUserDetail.investments.length : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Financed projects (count)">
                {Array.isArray(investorUserDetail.financed_projects) ? investorUserDetail.financed_projects.length : "—"}
              </Descriptions.Item>
            </Descriptions>
          </>
        ) : (
          <Text type="secondary">No data.</Text>
        )}
      </Modal>

      {/* Create project */}
      <Modal
        open={activeModal === MODAL.CREATE_PROJECT}
        onCancel={closeModal}
        title="Create project"
        width={820}
        className="admin-investor-modal"
        destroyOnClose
        footer={[
          <Button key="cancel" onClick={closeModal} disabled={projectCreateLoading}>
            Cancel
          </Button>,
          <Button key="save" type="primary" loading={projectCreateLoading} onClick={submitCreateProject}>
            Save
          </Button>,
        ]}
      >
        <Text type="secondary" className="admin-modal-subtitle">
          Fill the form below (mock only).
        </Text>
        <Form
          form={projectForm}
          layout="vertical"
          className="admin-modal-form"
          initialValues={{
            projectType: "solar",
            status: "funding",
            systemCapacityKwp: 0,
            clientContribution: 0,
            totalProjectCost: undefined,
            cost_items: [{ category: "materials", label: "", amount: undefined, notes: "" }],
            crPlanType: "monthly",
            crGracePeriodDays: 0,
          }}
        >
          <div className="admin-modal-grid">
            <Form.Item name="projectName" label="Project name" rules={[{ required: true, message: "Required" }]}>
              <Input placeholder="e.g. Access Ayobo 2" />
            </Form.Item>
            <Form.Item name="branchId" label="Branch (optional ID)">
              <Input placeholder="Nullable (link later)" />
            </Form.Item>

            <Form.Item name="projectType" label="Project type">
              <Select options={PROJECT_TYPE_OPTIONS} />
            </Form.Item>
            <Form.Item name="status" label="Status">
              <Select options={PROJECT_STATUS_OPTIONS} />
            </Form.Item>

            <Form.Item name="locationLabel" label="Location label">
              <Input placeholder="e.g. Lagos" />
            </Form.Item>
            <Form.Item name="systemCapacityKwp" label="System capacity (kWp)">
              <InputNumber min={0} step={0.0001} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="totalProjectCost"
              label="Total project cost (₦)"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} placeholder="e.g. 50000000000" />
            </Form.Item>
            <Form.Item name="clientContribution" label="Client contribution (₦)">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="installationDate" label="Installation date">
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="dd/mm/yyyy" />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} placeholder="Optional" />
            </Form.Item>
          </div>

          <Divider className="admin-modal-divider" />
          <div className="admin-modal-section-title">Cost breakdown (optional)</div>
          <Text type="secondary" className="admin-modal-section-sub">
            Amounts are sent as decimal strings.
          </Text>

          <Form.List name="cost_items">
            {(fields, { add, remove }) => (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} align="baseline" wrap style={{ marginBottom: 8 }}>
                    <Form.Item
                      {...restField}
                      name={[name, "category"]}
                      rules={[{ required: true, message: "Category required" }]}
                    >
                      <Select
                        style={{ width: 160 }}
                        placeholder="Category"
                        options={[
                          { value: "materials", label: "materials" },
                          { value: "labor", label: "labor" },
                          { value: "logistics", label: "logistics" },
                          { value: "services", label: "services" },
                          { value: "other", label: "other" },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "label"]}
                      rules={[{ required: true, message: "Label required" }]}
                    >
                      <Input style={{ width: 220 }} placeholder="e.g. PV modules" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "amount"]}
                      rules={[{ required: true, message: "Amount required" }]}
                    >
                      <InputNumber min={0} style={{ width: 180 }} placeholder="Amount ₦" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, "notes"]}>
                      <Input style={{ width: 220 }} placeholder="Notes (optional)" />
                    </Form.Item>
                    {fields.length > 1 ? (
                      <MinusCircleOutlined onClick={() => remove(name)} style={{ color: "#ff4d4f", cursor: "pointer" }} />
                    ) : null}
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add cost item
                </Button>
              </div>
            )}
          </Form.List>

          <Divider className="admin-modal-divider" />
          <div className="admin-modal-section-title">Customer repayment plan</div>
          <Text type="secondary" className="admin-modal-section-sub">
            Principal amount is computed as total project cost − client contribution.
          </Text>

          <div className="admin-modal-grid">
            <Form.Item name="crPlanType" label="Plan type" rules={[{ required: true, message: "Required" }]}>
              <Select options={REPAYMENT_PLAN_TYPE_OPTIONS} />
            </Form.Item>
            <Form.Item name="crFirstDueDate" label="First due date" rules={[{ required: true, message: "Required" }]}>
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="dd/mm/yyyy" />
            </Form.Item>

            <Form.Item label="Principal amount (₦)">
              <InputNumber disabled value={createProjectPrincipalAmount} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="crInterestRatePa" label="Interest rate P.A. (%)" rules={[{ required: true, message: "Required" }]}>
              <InputNumber min={0} max={100} step={0.0001} style={{ width: "100%" }} placeholder="e.g. 12.5" />
            </Form.Item>
            <Form.Item
              name="crNumberOfInstallments"
              label="Number of installments"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber min={1} step={1} style={{ width: "100%" }} placeholder="e.g. 24" />
            </Form.Item>

            <Form.Item name="crGracePeriodDays" label="Grace period (days)">
              <InputNumber min={0} step={1} style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
            <Form.Item name="crNotes" label="Plan notes">
              <Input placeholder="Optional" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        open={projectDetailOpen}
        onCancel={closeProjectDetail}
        title="Project details"
        width={800}
        className="admin-investor-modal"
        footer={[
          <Button key="close" type="primary" onClick={closeProjectDetail}>
            Close
          </Button>,
        ]}
        destroyOnClose
      >
        {projectDetailLoading ? (
          <Text type="secondary">Loading…</Text>
        ) : projectDetail ? (
          <>
            <Descriptions bordered size="small" column={1} className="admin-investor-detail-desc">
              <Descriptions.Item label="Name">{projectDetail.name}</Descriptions.Item>
              <Descriptions.Item label="Branch ID">{projectDetail.branch_id ?? "—"}</Descriptions.Item>
              <Descriptions.Item label="Location">{projectDetail.location_label || "—"}</Descriptions.Item>
              <Descriptions.Item label="Type">{projectDetail.project_type}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={projectStatusTagColor(projectDetail.status)} className="admin-investor-pill">
                  {projectDetail.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="System capacity (kWp)">{projectDetail.system_capacity_kwp}</Descriptions.Item>
              <Descriptions.Item label="Total project cost">{ngnCompact(Number(projectDetail.total_project_cost))}</Descriptions.Item>
              <Descriptions.Item label="Client contribution">{ngnCompact(Number(projectDetail.client_contribution))}</Descriptions.Item>
              <Descriptions.Item label="Investor funding target">
                {ngnCompact(Number(projectDetail.investor_funding_target))}
              </Descriptions.Item>
              <Descriptions.Item label="Installation date">{projectDetail.installation_date || "—"}</Descriptions.Item>
              <Descriptions.Item label="Created">{projectDetail.created_at || "—"}</Descriptions.Item>
              <Descriptions.Item label="Description">{projectDetail.description || "—"}</Descriptions.Item>
            </Descriptions>
            <Divider className="admin-modal-divider" />
            <div className="admin-modal-section-title">Investments</div>
            <Table
              size="small"
              rowKey="id"
              pagination={false}
              dataSource={Array.isArray(projectDetail.investments) ? projectDetail.investments : []}
              columns={[
                { title: "ID", dataIndex: "id", width: 70 },
                { title: "Investor", dataIndex: "investor_name", ellipsis: true },
                { title: "Capital", dataIndex: "capital_amount", render: (v) => ngnCompact(Number(v)) },
                { title: "Share %", dataIndex: "share_percent", width: 90 },
                { title: "Start", dataIndex: "contract_start_date", width: 110 },
                { title: "End", dataIndex: "contract_end_date", width: 110, render: (v) => v || "—" },
                {
                  title: "Status",
                  dataIndex: "status",
                  width: 100,
                  render: (v) => <Tag className="admin-investor-pill">{v}</Tag>,
                },
              ]}
            />
          </>
        ) : (
          <Text type="secondary">No data.</Text>
        )}
      </Modal>

      {/* Create investment */}
      <Modal
        open={activeModal === MODAL.CREATE_INVESTMENT}
        onCancel={closeModal}
        title="Create investment"
        width={860}
        className="admin-investor-modal"
        destroyOnClose
        footer={[
          <Button key="cancel" onClick={closeModal} disabled={investmentCreateLoading}>
            Cancel
          </Button>,
          <Button key="save" type="primary" loading={investmentCreateLoading} onClick={submitCreateInvestment}>
            Save
          </Button>,
        ]}
      >
        <Text type="secondary" className="admin-modal-subtitle">
          Fill the form below (mock only).
        </Text>
        <Text type="secondary" className="admin-modal-section-sub">
          Contract block matches Investment. The section below is the linked RepaymentPlan (Wyre → investor).
        </Text>
        <Form
          form={investmentForm}
          layout="vertical"
          className="admin-modal-form"
          initialValues={{
            status: "active",
            planType: "quarterly",
            interestBasis: "total",
          }}
        >
          <div className="admin-modal-grid">
            <Form.Item name="investor_id" label="Investor" rules={[{ required: true, message: "Required" }]}>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Select investor"
                options={investorIdSelectOptions}
              />
            </Form.Item>
            <Form.Item name="project_id" label="Project" rules={[{ required: true, message: "Required" }]}>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Select project"
                options={projectIdSelectOptions}
              />
            </Form.Item>

            <Form.Item label="Capital amount (₦)">
              <InputNumber disabled value={createInvestmentCapitalAmount ?? 18400000000} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="contractStart" label="Contract start date" rules={[{ required: true, message: "Required" }]}>
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="dd/mm/yyyy" />
            </Form.Item>
            <Form.Item name="contractEnd" label="Contract end date" rules={[{ required: true, message: "Required" }]}>
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="dd/mm/yyyy" />
            </Form.Item>

            <Form.Item name="status" label="Status">
              <Select options={INVESTMENT_STATUS_OPTIONS} />
            </Form.Item>
            <Form.Item name="notes" label="Notes">
              <Input.TextArea rows={3} placeholder="Optional" />
            </Form.Item>
          </div>

          <Divider className="admin-modal-divider" />
          <div className="admin-modal-section-title">
            Investor repayment plan
          </div>
          <Text type="secondary" className="admin-modal-section-sub">
            Fields submit as nested <Text code>repayment_plan</Text>.
          </Text>

          <div className="admin-modal-grid">
            <Form.Item name="planType" label="Plan type" rules={[{ required: true, message: "Required" }]}>
              <Select options={REPAYMENT_PLAN_TYPE_OPTIONS} />
            </Form.Item>
            <Form.Item name="firstDueDate" label="First due date" rules={[{ required: true, message: "Required" }]}>
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="dd/mm/yyyy" />
            </Form.Item>

            <Form.Item name="interestPercent" label="Interest percent" rules={[{ required: true, message: "Required" }]}>
              <InputNumber min={0} max={100} step={0.0001} style={{ width: "100%" }} placeholder="e.g. 20" />
            </Form.Item>
            <Form.Item name="interestBasis" label="Interest basis">
              <Select options={REPAYMENT_INTEREST_BASIS_OPTIONS} />
            </Form.Item>

            <Form.Item label="Total repayable (₦)">
              <InputNumber
                disabled
                value={createInvestmentTotalRepayable ?? (createInvestmentCapitalAmount ?? 18400000000)}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              name="numberOfInstallments"
              label="Number of installments"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber min={1} step={1} style={{ width: "100%" }} placeholder="e.g. 6" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        open={investmentDetailOpen}
        onCancel={closeInvestmentDetail}
        title="Investment details"
        width={720}
        className="admin-investor-modal"
        footer={[
          <Button key="close" type="primary" onClick={closeInvestmentDetail}>
            Close
          </Button>,
        ]}
        destroyOnClose
      >
        {investmentDetailLoading ? (
          <Text type="secondary">Loading…</Text>
        ) : investmentDetail ? (
          <Descriptions bordered size="small" column={1} className="admin-investor-detail-desc">
            <Descriptions.Item label="ID">{investmentDetail.id}</Descriptions.Item>
            <Descriptions.Item label="Investor">{investmentDetail.investor_name}</Descriptions.Item>
            <Descriptions.Item label="Project">{investmentDetail.project_name}</Descriptions.Item>
            <Descriptions.Item label="Capital">{ngnCompact(Number(investmentDetail.capital_amount))}</Descriptions.Item>
            <Descriptions.Item label="Share %">{investmentDetail.share_percent ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="Contract start">{investmentDetail.contract_start_date || "—"}</Descriptions.Item>
            <Descriptions.Item label="Contract end">{investmentDetail.contract_end_date || "—"}</Descriptions.Item>
            <Descriptions.Item label="Status">{investmentDetail.status}</Descriptions.Item>
            <Descriptions.Item label="Repayment plan ID">{investmentDetail.repayment_plan_id ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="Notes">{investmentDetail.notes || "—"}</Descriptions.Item>
            <Descriptions.Item label="Created">{investmentDetail.created_at || "—"}</Descriptions.Item>
          </Descriptions>
        ) : (
          <Text type="secondary">No data.</Text>
        )}
      </Modal>

      {/* Record customer payment */}
      <Modal
        open={activeModal === MODAL.RECORD_PAYMENT}
        onCancel={closeModal}
        title="Record customer payment"
        width={900}
        className="admin-investor-modal"
        destroyOnClose
        footer={[
          <Button key="cancel" onClick={closeModal} disabled={customerPaymentCreateLoading}>
            Cancel
          </Button>,
          <Button key="save" type="primary" loading={customerPaymentCreateLoading} onClick={submitRecordCustomerPayment}>
            Save
          </Button>,
        ]}
      >
        <Text type="secondary" className="admin-modal-subtitle">
          POST <Text code>/api/v1/investors/admin/customer-payments/</Text> — single line (one schedule) or bulk <Text code>line_items</Text>.
        </Text>
        <Form
          form={recordPaymentForm}
          layout="vertical"
          className="admin-modal-form"
          initialValues={{
            entryMode: "single",
            payment_method: "Transfer",
            line_items: [{ customer_schedule_id: undefined, amount_received: undefined, payment_date: undefined }],
          }}
        >
          <Form.Item name="entryMode" label="Entry mode">
            <Segmented
              options={[
                { label: "Single schedule line", value: "single" },
                { label: "Bulk (line items)", value: "bulk" },
              ]}
            />
          </Form.Item>

          <div className="admin-modal-grid">
            <Form.Item name="project_id" label="Project" rules={[{ required: true, message: "Required" }]}>
              <Select showSearch optionFilterProp="label" placeholder="Select project" options={projectIdSelectOptions} />
            </Form.Item>
            <Form.Item name="branch_id" label="Branch ID (optional)">
              <Input placeholder="Numeric or leave empty" />
            </Form.Item>

            <Form.Item name="payment_method" label="Payment method" rules={[{ required: true, message: "Required" }]}>
              <Select options={CUSTOMER_PAYMENT_METHOD_OPTIONS} />
            </Form.Item>
            <Form.Item name="reference" label="Reference">
              <Input placeholder="e.g. TRF-889120" />
            </Form.Item>

            <Form.Item name="notes" label="Notes" className="admin-modal-wide">
              <Input.TextArea rows={2} placeholder="Optional" />
            </Form.Item>
          </div>

          {recordPaymentEntryMode === "single" ? (
            <div className="admin-modal-grid">
              <Form.Item
                name="customer_schedule_id"
                label="Customer schedule ID"
                rules={[{ required: true, message: "Required" }]}
              >
                <InputNumber min={1} step={1} style={{ width: "100%" }} placeholder="e.g. 1" />
              </Form.Item>
              <Form.Item name="amountReceived" label="Amount received (₦)" rules={[{ required: true, message: "Required" }]}>
                <InputNumber min={0} style={{ width: "100%" }} placeholder="e.g. 30000000" />
              </Form.Item>
              <Form.Item name="paymentDate" label="Payment date" rules={[{ required: true, message: "Required" }]}>
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="dd/mm/yyyy" />
              </Form.Item>
            </div>
          ) : (
            <>
              <Divider className="admin-modal-divider" />
              <Text type="secondary" className="admin-modal-section-sub">
                Each line: schedule ID, amount (decimal string on API), and payment date. Shared reference/notes apply to all created rows.
              </Text>
              <Form.List name="line_items">
                {(fields, { add, remove }) => (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key} align="baseline" wrap style={{ marginBottom: 8 }}>
                        <Form.Item {...restField} name={[name, "customer_schedule_id"]}>
                          <InputNumber min={1} step={1} placeholder="Schedule ID" style={{ width: 140 }} />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, "amount_received"]}>
                          <InputNumber min={0} style={{ width: 160 }} placeholder="Amount ₦" />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, "payment_date"]}>
                          <DatePicker format="DD/MM/YYYY" style={{ width: 160 }} placeholder="Date" />
                        </Form.Item>
                        {fields.length > 1 ? (
                          <MinusCircleOutlined onClick={() => remove(name)} style={{ color: "#ff4d4f", cursor: "pointer" }} />
                        ) : null}
                      </Space>
                    ))}
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Add line item
                    </Button>
                  </div>
                )}
              </Form.List>
            </>
          )}
        </Form>
      </Modal>

      <Modal
        open={customerPaymentDetailOpen}
        onCancel={closeCustomerPaymentDetail}
        title="Customer payment details"
        width={640}
        className="admin-investor-modal"
        footer={[
          <Button key="close" type="primary" onClick={closeCustomerPaymentDetail}>
            Close
          </Button>,
        ]}
        destroyOnClose
      >
        {customerPaymentDetailLoading ? (
          <Text type="secondary">Loading…</Text>
        ) : customerPaymentDetail ? (
          <Descriptions bordered size="small" column={1} className="admin-investor-detail-desc">
            <Descriptions.Item label="ID">{customerPaymentDetail.id}</Descriptions.Item>
            <Descriptions.Item label="Project">{customerPaymentDetail.project_name}</Descriptions.Item>
            <Descriptions.Item label="Project ID">{customerPaymentDetail.project_id}</Descriptions.Item>
            <Descriptions.Item label="Branch ID">{customerPaymentDetail.branch_id ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="Customer schedule ID">{customerPaymentDetail.customer_schedule_id}</Descriptions.Item>
            <Descriptions.Item label="Amount received">
              {ngnCompact(Number(customerPaymentDetail.amount_received))}
            </Descriptions.Item>
            <Descriptions.Item label="Payment date">{customerPaymentDetail.payment_date}</Descriptions.Item>
            <Descriptions.Item label="Method">{customerPaymentDetail.payment_method}</Descriptions.Item>
            <Descriptions.Item label="Reference">{customerPaymentDetail.reference || "—"}</Descriptions.Item>
            <Descriptions.Item label="Notes">{customerPaymentDetail.notes || "—"}</Descriptions.Item>
            <Descriptions.Item label="Recorded by">{customerPaymentDetail.recorded_by ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="Created">{customerPaymentDetail.created_at || "—"}</Descriptions.Item>
          </Descriptions>
        ) : (
          <Text type="secondary">No data.</Text>
        )}
      </Modal>

      {/* Post investor payout */}
      <Modal
        open={activeModal === MODAL.POST_PAYOUT}
        onCancel={closeModal}
        title="Post investor payout"
        width={900}
        className="admin-investor-modal"
        destroyOnClose
        footer={[
          <Button key="cancel" onClick={closeModal} disabled={payoutCreateLoading}>
            Cancel
          </Button>,
          <Button key="save" type="primary" loading={payoutCreateLoading} onClick={submitPostPayout}>
            Save
          </Button>,
        ]}
      >
        <Text type="secondary" className="admin-modal-subtitle">
          POST <Text code>/api/v1/investors/admin/investor-payouts/</Text> with <Text code>line_items</Text>. Schedules load from{" "}
          <Text code>investor-payment-schedules?investment_id=…</Text> when you pick an investment.
        </Text>
        <Form
          form={payoutForm}
          layout="vertical"
          className="admin-modal-form"
          initialValues={{
            payment_method: "Bank sweep",
            line_items: [{ schedule_id: undefined, amount_paid: undefined, paid_date: undefined }],
          }}
        >
          <div className="admin-modal-grid">
            <Form.Item name="investment_id" label="Investment" rules={[{ required: true, message: "Required" }]}>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Select investment"
                options={investmentIdSelectOptions}
              />
            </Form.Item>
            <Form.Item name="payment_method" label="Payment method" rules={[{ required: true, message: "Required" }]}>
              <Input placeholder="e.g. Bank sweep" />
            </Form.Item>
            <Form.Item name="reference" label="Reference" rules={[{ required: true, message: "Required" }]}>
              <Input placeholder="e.g. PAYOUT-22020" />
            </Form.Item>
          </div>

          {payoutInvestmentId ? (
            <div style={{ marginBottom: 12 }}>
              {payoutSchedulesLoading ? (
                <Spin size="small" />
              ) : payoutSchedules.length ? (
                <Text type="secondary">
                  {payoutSchedules.length} schedule line(s) — pick <Text code>schedule_id</Text> below or from the list.
                </Text>
              ) : (
                <Text type="secondary">No schedule rows returned for this investment.</Text>
              )}
            </div>
          ) : null}

          <Divider className="admin-modal-divider" />
          <div className="admin-modal-section-title">Line items</div>
          <Form.List name="line_items">
            {(fields, { add, remove }) => (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} align="baseline" wrap>
                    <Form.Item {...restField} name={[name, "schedule_id"]} label={fields.length > 1 ? "Schedule" : undefined}>
                      {payoutScheduleSelectOptions.length ? (
                        <Select
                          allowClear
                          showSearch
                          optionFilterProp="label"
                          placeholder="Schedule"
                          style={{ minWidth: 280 }}
                          options={payoutScheduleSelectOptions}
                        />
                      ) : (
                        <InputNumber min={1} step={1} style={{ width: 160 }} placeholder="Schedule ID" />
                      )}
                    </Form.Item>
                    <Form.Item {...restField} name={[name, "amount_paid"]} label={fields.length > 1 ? "Amount ₦" : undefined}>
                      <InputNumber min={0} style={{ width: 140 }} placeholder="Amount" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, "paid_date"]} label={fields.length > 1 ? "Paid date" : undefined}>
                      <DatePicker format="DD/MM/YYYY" style={{ width: 160 }} placeholder="Date" />
                    </Form.Item>
                    {fields.length > 1 ? (
                      <MinusCircleOutlined onClick={() => remove(name)} style={{ color: "#ff4d4f", cursor: "pointer" }} />
                    ) : null}
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add line item
                </Button>
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>

      <Modal
        open={payoutDetailOpen}
        onCancel={closePayoutDetail}
        title="Investor payout details"
        width={720}
        className="admin-investor-modal"
        footer={[
          <Button key="close" type="primary" onClick={closePayoutDetail}>
            Close
          </Button>,
        ]}
        destroyOnClose
      >
        {payoutDetailLoading ? (
          <Text type="secondary">Loading…</Text>
        ) : payoutDetail ? (
          <Descriptions bordered size="small" column={1} className="admin-investor-detail-desc">
            <Descriptions.Item label="ID">{payoutDetail.id}</Descriptions.Item>
            <Descriptions.Item label="Investment ID">{payoutDetail.investment_id}</Descriptions.Item>
            <Descriptions.Item label="Project">{payoutDetail.project?.name || "—"}</Descriptions.Item>
            <Descriptions.Item label="Schedule ID">{payoutDetail.schedule_id}</Descriptions.Item>
            <Descriptions.Item label="Amount paid">{ngnCompact(Number(payoutDetail.amount_paid))}</Descriptions.Item>
            <Descriptions.Item label="Paid date">{payoutDetail.paid_date}</Descriptions.Item>
            <Descriptions.Item label="Payment method">{payoutDetail.payment_method}</Descriptions.Item>
            <Descriptions.Item label="Reference">{payoutDetail.reference || "—"}</Descriptions.Item>
            <Descriptions.Item label="Disbursed by">{payoutDetail.disbursed_by ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="Created">{payoutDetail.created_at || "—"}</Descriptions.Item>
          </Descriptions>
        ) : (
          <Text type="secondary">No data.</Text>
        )}
      </Modal>
    </div>
  );
}

export default InvestorAdministration;

