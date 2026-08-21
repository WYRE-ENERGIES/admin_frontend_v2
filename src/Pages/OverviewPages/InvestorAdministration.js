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
  Switch,
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
  DownOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import authHelper from "../../helpers/authHelper";
import {
  createAdminInvestorUser,
  deleteAdminInvestorUser,
  fetchAdminInvestorUserDetail,
  fetchAdminInvestorUsersList,
  clearInvestorUserDetail,
  updateAdminInvestorUser,
} from "../../redux/actions/adminInvestorUser/adminInvestorUser.action";
import {
  createAdminInvestorProject,
  deleteAdminInvestorProject,
  fetchAdminInvestorProjectDetail,
  fetchAdminInvestorProjectsList,
  clearInvestorProjectDetail,
  fetchAdminInvestorProjectsPerformance,
  updateAdminInvestorProject,
} from "../../redux/actions/adminInvestorProject/adminInvestorProject.action";
import {
  createAdminInvestorInvestment,
  deleteAdminInvestorInvestment,
  fetchAdminInvestorInvestmentDetail,
  fetchAdminInvestorInvestmentsList,
  clearInvestorInvestmentDetail,
  updateAdminInvestorInvestment,
} from "../../redux/actions/adminInvestorInvestment/adminInvestorInvestment.action";
import {
  createAdminCustomerPayment,
  deleteAdminCustomerPayment,
  fetchAdminCustomerPaymentDetail,
  fetchAdminCustomerPaymentsList,
  fetchAdminCustomerPaymentSchedules,
  updateAdminCustomerPayment,
  clearCustomerPaymentDetail,
} from "../../redux/actions/adminCustomerPayment/adminCustomerPayment.action";
import { fetchAdminInvestorOverview } from "../../redux/actions/adminInvestorOverview/adminInvestorOverview.action";
import { fetchAdminFinanceByInvestor } from "../../redux/actions/adminInvestorDirectory/adminInvestorDirectory.action";
import {
  fetchAdminSupportTicketsList,
  fetchAdminSupportTicketDetail,
  createAdminSupportTicketResponse,
  clearSupportTicketDetail,
} from "../../redux/actions/adminInvestorSupportTicket/adminInvestorSupportTicket.action";

const { Title, Text } = Typography;
const { Search } = Input;

const MODAL = {
  NONE: null,
  CREATE_INVESTOR: "createInvestor",
  CREATE_PROJECT: "createProject",
  CREATE_INVESTMENT: "createInvestment",
  RECORD_PAYMENT: "recordPayment",
};

const KYC_TIER_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "tier_1", label: "Tier 1" },
  { value: "tier_2", label: "Tier 2" },
];

const KYC_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under review" },
  { value: "verified", label: "Verified" },
];

const kycStatusTagColor = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "verified") return "green";
  if (s.includes("review")) return "gold";
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

const REPAYMENT_PLAN_TYPE_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
  { value: "in_full", label: "In full" },
];

function isBeforeToday(current) {
  return current && current < dayjs().startOf("day");
}

/** Picker panel mounts on body so it is not clipped behind modal masks. */
function AdminDatePicker(props) {
  const {
    format = "DD/MM/YYYY",
    placeholder = "dd/mm/yyyy",
    popupClassName,
    disablePast,
    disabledDate: disabledDateProp,
    defaultPickerValue,
    ...rest
  } = props;

  const disabledDate = disablePast
    ? (current) => {
      if (disabledDateProp?.(current)) return true;
      return isBeforeToday(current);
    }
    : disabledDateProp;

  return (
    <DatePicker
      format={format}
      placeholder={placeholder}
      getPopupContainer={() => document.body}
      popupClassName={["investor-admin-picker-dropdown", popupClassName].filter(Boolean).join(" ")}
      disabledDate={disabledDate}
      defaultPickerValue={defaultPickerValue ?? (disablePast ? dayjs() : undefined)}
      {...rest}
    />
  );
}

const REPAYMENT_INTEREST_BASIS_OPTIONS = [
  { value: "total", label: "Total" },
  { value: "annual", label: "Annual (per year)" },
];

const SCHEDULE_LINE_STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partial" },
  { value: "overdue", label: "Overdue" },
];

const INVESTMENT_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const CUSTOMER_PAYMENT_METHOD_OPTIONS = [
  { value: "Transfer", label: "Transfer" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "Cash", label: "Cash" },
  { value: "POS", label: "POS" },
];

const ngn = (n) => `₦${Number(n).toLocaleString("en-NG")}`;
/** Overview tab: show this many rows per highlight table (full lists live on Payments / Projects / Investors). */
const ngnCompact = (n) => {
  const num = Number(n);
  if (Number.isNaN(num)) return "—";
  if (num >= 1e9) return `₦${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `₦${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `₦${(num / 1e3).toFixed(0)}k`;
  return ngn(num);
};

/** API returns kWh; display as MWh in project performance tables. */
const formatMwhFromKwh = (kwh) => {
  const n = Number(kwh);
  if (!Number.isFinite(n)) return "—";
  const mwh = n / 1000;
  if (mwh === 0) return "0";
  if (mwh >= 100) return mwh.toLocaleString("en-NG", { maximumFractionDigits: 1 });
  if (mwh >= 10) return mwh.toFixed(1);
  if (mwh >= 1) return mwh.toFixed(2);
  return mwh.toFixed(3);
};

const formatKwpDisplay = (kwp) => {
  const n = Number(kwp);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-NG", { maximumFractionDigits: 2 });
};

/** Default list pagination for investor admin tables. */
const ADMIN_TABLE_PAGINATION = {
  pageSize: 10,
  showSizeChanger: false,
};

/** Shared Ant Design table props: full-width layout, no horizontal scrollbar. */
const ADMIN_DATA_TABLE_PROPS = {
  className: "admin-investor-data-table",
  tableLayout: "fixed",
  size: "small",
  pagination: ADMIN_TABLE_PAGINATION,
};

/** Percentage width column — keeps table-layout:fixed columns summing to 100%. */
const adminColPct = (pct, col) => ({ ...col, width: `${pct}%` });

/** Action column: enough room for buttons; cells must not clip overflow. */
const adminActionCol = (pct, col) => ({
  ...col,
  width: `${pct}%`,
  onHeaderCell: () => ({ className: "admin-table-col-action" }),
  onCell: () => ({ className: "admin-table-col-action" }),
});

/** Text column that grows within a capped share (use on at most one column per table). */
const adminTableFlexCol = {
  onHeaderCell: () => ({ className: "admin-table-col-flex" }),
  onCell: () => ({ className: "admin-table-col-flex" }),
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

function MetricCard({ icon, label, value, sub, bg, decorationColor, subAsLines }) {
  const parts = sub ? sub.split(" · ") : [];
  return (
    <div className="admin-investor-metric" style={{ background: bg }}>
      <div className="admin-investor-metric-decoration admin-investor-metric-decoration--xl" style={{ background: decorationColor }} />
      <div className="admin-investor-metric-top">
        <div className="admin-investor-metric-icon">{icon}</div>
        <Text className="admin-investor-metric-label">{label}</Text>
      </div>
      <div className="admin-investor-metric-value">{value}</div>
      {parts.length > 0 && (
        subAsLines ? (
          <div className="admin-investor-metric-lines">
            {parts.map((line, i) => (
              <Text key={i} className="admin-investor-metric-line">{line}</Text>
            ))}
          </div>
        ) : (
          <div className="admin-investor-metric-badges">
            {parts.map((b, i) => (
              <span key={i} className="admin-investor-metric-badge">{b}</span>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function nearestPaymentsCardLabel(np) {
  const candidates = [
    np?.to_investor?.due_date,
    np?.from_customer?.due_date,
    np?.headline_relative_label,
  ].filter(Boolean);

  let due = null;
  for (const raw of candidates) {
    const parsed = dayjs(raw, ["YYYY-MM-DD", "DD MMM YYYY"], true);
    if (parsed.isValid()) {
      due = parsed.startOf("day");
      break;
    }
  }

  if (!due) return "Nearest";
  return due.isBefore(dayjs().startOf("day")) ? "Overdue" : "Nearest";
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
  const financeByInvestorList = useSelector((s) => s.adminInvestorDirectoryPage?.financeByInvestor);
  const financeByInvestorLoading = useSelector((s) => s.adminInvestorDirectoryPage?.financeByInvestorLoading);

  const adminProjectsList = useSelector((s) => s.adminInvestorProjectsPage?.list);
  const projectsListLoading = useSelector((s) => s.adminInvestorProjectsPage?.listLoading);
  const projectCreateLoading = useSelector((s) => s.adminInvestorProjectsPage?.createLoading);
  const projectDetail = useSelector((s) => s.adminInvestorProjectsPage?.detail);
  const projectDetailLoading = useSelector((s) => s.adminInvestorProjectsPage?.detailLoading);
  const projectDeleteLoading = useSelector((s) => s.adminInvestorProjectsPage?.deleteLoading);
  const projectUpdateLoading = useSelector((s) => s.adminInvestorProjectsPage?.updateLoading);
  const projectsPerformance = useSelector((s) => s.adminInvestorProjectsPage?.performance);
  const projectsPerformanceLoading = useSelector((s) => s.adminInvestorProjectsPage?.performanceLoading);

  const adminInvestmentsList = useSelector((s) => s.adminInvestorInvestmentsPage?.list);
  const investmentsListLoading = useSelector((s) => s.adminInvestorInvestmentsPage?.listLoading);
  const investmentCreateLoading = useSelector((s) => s.adminInvestorInvestmentsPage?.createLoading);
  const investmentDetail = useSelector((s) => s.adminInvestorInvestmentsPage?.detail);
  const investmentDetailLoading = useSelector((s) => s.adminInvestorInvestmentsPage?.detailLoading);
  const investmentDeleteLoading = useSelector((s) => s.adminInvestorInvestmentsPage?.deleteLoading);
  const investmentUpdateLoading = useSelector((s) => s.adminInvestorInvestmentsPage?.updateLoading);

  const adminCustomerPaymentsList = useSelector((s) => s.adminCustomerPaymentsPage?.list);
  const customerPaymentsListLoading = useSelector((s) => s.adminCustomerPaymentsPage?.listLoading);
  const customerPaymentCreateLoading = useSelector((s) => s.adminCustomerPaymentsPage?.createLoading);
  const customerPaymentDetail = useSelector((s) => s.adminCustomerPaymentsPage?.detail);
  const customerPaymentDetailLoading = useSelector((s) => s.adminCustomerPaymentsPage?.detailLoading);
  const customerPaymentDeleteLoading = useSelector((s) => s.adminCustomerPaymentsPage?.deleteLoading);
  const customerPaymentUpdateLoading = useSelector((s) => s.adminCustomerPaymentsPage?.updateLoading);
  const customerSchedules = useSelector((s) => s.adminCustomerPaymentsPage?.customerSchedules);
  const customerSchedulesLoading = useSelector((s) => s.adminCustomerPaymentsPage?.customerSchedulesLoading);

  const overviewTotalInvested = useSelector((s) => s.adminInvestorOverviewPage?.totalInvested);
  const overviewCustomersExpected = useSelector((s) => s.adminInvestorOverviewPage?.customersExpected);
  const overviewActiveProjects = useSelector((s) => s.adminInvestorOverviewPage?.activeProjects);
  const overviewActiveInvestors = useSelector((s) => s.adminInvestorOverviewPage?.activeInvestors);
  const overviewNearestPayments = useSelector((s) => s.adminInvestorOverviewPage?.nearestPayments);
  const overviewLoading = useSelector((s) => s.adminInvestorOverviewPage?.loading);

  const supportTicketsList = useSelector((s) => s.adminInvestorSupportTicketsPage?.list);
  const supportTicketsListLoading = useSelector((s) => s.adminInvestorSupportTicketsPage?.listLoading);
  const supportTicketDetail = useSelector((s) => s.adminInvestorSupportTicketsPage?.detail);
  const supportTicketDetailLoading = useSelector((s) => s.adminInvestorSupportTicketsPage?.detailLoading);
  const supportTicketResponseLoading = useSelector((s) => s.adminInvestorSupportTicketsPage?.createResponseLoading);

  const [perfMode, setPerfMode] = useState("Top");
  const [activeModal, setActiveModal] = useState(MODAL.NONE);
  const [investorDetailOpen, setInvestorDetailOpen] = useState(false);
  const [investorEditOpen, setInvestorEditOpen] = useState(false);
  const [projectDetailOpen, setProjectDetailOpen] = useState(false);
  const [investmentDetailOpen, setInvestmentDetailOpen] = useState(false);
  const [projectEditOpen, setProjectEditOpen] = useState(false);
  const [investmentEditOpen, setInvestmentEditOpen] = useState(false);
  const [projectCustomerSchedules, setProjectCustomerSchedules] = useState([]);
  const [investmentPaymentSchedules, setInvestmentPaymentSchedules] = useState([]);
  const [showProjectCostBreakdown, setShowProjectCostBreakdown] = useState(true);
  const [showInvestmentContractDetails, setShowInvestmentContractDetails] = useState(true);
  const [showInvestmentRepaymentPlan, setShowInvestmentRepaymentPlan] = useState(true);
  const [customerPaymentDetailOpen, setCustomerPaymentDetailOpen] = useState(false);
  const [investorSearch, setInvestorSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [projectProgrammeStateFilter, setProjectProgrammeStateFilter] = useState("all");
  const [investmentSearch, setInvestmentSearch] = useState("");
  const [customerPaymentSearch, setCustomerPaymentSearch] = useState("");
  const [ticketsTableMode, setTicketsTableMode] = useState("all");
  const [ticketResponseOpen, setTicketResponseOpen] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [ticketResponseDraft, setTicketResponseDraft] = useState("");
  const [activeTicketMeta, setActiveTicketMeta] = useState(null);
  /** Staff responses posted this session (API returns each POST result; list refreshes for `responded`). */
  const [ticketPostResponses, setTicketPostResponses] = useState({});
  const [customerRepaymentOpen, setCustomerRepaymentOpen] = useState(false);
  const [activePaymentMeta, setActivePaymentMeta] = useState(null);
  const [investorForm] = Form.useForm();
  const [investorEditForm] = Form.useForm();
  const [projectForm] = Form.useForm();
  const [projectEditForm] = Form.useForm();
  const [investmentForm] = Form.useForm();
  const [investmentEditForm] = Form.useForm();
  const [recordPaymentForm] = Form.useForm();
  const [customerPaymentEditForm] = Form.useForm();
  const [customerPaymentEditing, setCustomerPaymentEditing] = useState(false);
  const recordPaymentProjectId = Form.useWatch("project_id", recordPaymentForm);
  const createInvestmentProjectId = Form.useWatch("project_id", investmentForm);
  const createInvestmentClientContribution = Form.useWatch("clientContribution", investmentForm);

  const closeModal = () => {
    setShowProjectCostBreakdown(true);
    setActiveModal(MODAL.NONE);
  };

  const openProjectCostBreakdown = () => {
    setShowProjectCostBreakdown(true);
    const existing = projectForm.getFieldValue("cost_items");
    if (!Array.isArray(existing) || existing.length === 0)
    {
      projectForm.setFieldsValue({
        cost_items: [{ category: "materials", label: "", amount: undefined, notes: "" }],
      });
    }
  };

  const hideProjectCostBreakdown = () => {
    setShowProjectCostBreakdown(false);
    projectForm.setFieldsValue({ cost_items: [] });
  };

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

  const refreshPaymentSchedules = useCallback(() => {
    if (!isSuperAdmin) return undefined;
    return dispatch(fetchAdminCustomerPaymentSchedules({ page: 1, page_size: 100 }));
  }, [dispatch, isSuperAdmin]);

  useEffect(() => {
    refreshInvestorUsers();
    refreshAdminProjects();
    refreshAdminInvestments();
    refreshCustomerPayments();
  }, [refreshInvestorUsers, refreshAdminProjects, refreshAdminInvestments, refreshCustomerPayments]);

  useEffect(() => {
    if (!isSuperAdmin) return undefined;
    let cancelled = false;
    (async () => {
      const res = await refreshPaymentSchedules();
      if (cancelled || !res) return;
      if (!res.fulfilled) message.error(res.message || "Could not load customer payment schedules");
    })();
    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin, refreshPaymentSchedules]);

  useEffect(() => {
    if (!isSuperAdmin) return undefined;
    let cancelled = false;
    (async () => {
      const rank_by = perfMode === "Bottom" ? "average_daily_generation_kwh" : "average_daily_generation_kwh";
      const res = await dispatch(fetchAdminInvestorProjectsPerformance({ rank_by }));
      if (cancelled) return;
      if (!res.fulfilled) message.error(res.message || "Could not load project performance");
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch, isSuperAdmin, perfMode]);

  useEffect(() => {
    if (!isSuperAdmin) return undefined;
    let cancelled = false;
    (async () => {
      const res = await dispatch(fetchAdminInvestorOverview());
      if (cancelled) return;
      if (!res.fulfilled) message.error(res.message || "Could not load investor overview");
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch, isSuperAdmin]);

  useEffect(() => {
    if (!isSuperAdmin) return undefined;
    let cancelled = false;
    (async () => {
      const res = await dispatch(fetchAdminFinanceByInvestor());
      if (cancelled) return;
      if (!res.fulfilled) message.error(res.message || "Could not load finance by investor");
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch, isSuperAdmin]);

  const openTicketResponse = useCallback(
    async (ticketId, meta) => {
      const idStr = String(ticketId);
      setActiveTicketId(idStr);
      setActiveTicketMeta(meta || null);
      setTicketResponseDraft("");
      dispatch(clearSupportTicketDetail());
      setTicketResponseOpen(true);
      const res = await dispatch(fetchAdminSupportTicketDetail(ticketId));
      if (!res.fulfilled)
      {
        message.error(res.message || "Could not load ticket details");
      }
    },
    [dispatch]
  );

  const closeTicketResponse = useCallback(() => {
    setTicketResponseOpen(false);
    setActiveTicketId(null);
    setActiveTicketMeta(null);
    setTicketResponseDraft("");
    dispatch(clearSupportTicketDetail());
  }, [dispatch]);

  const saveTicketResponse = useCallback(async () => {
    if (!activeTicketId) return;
    const trimmed = String(ticketResponseDraft || "").trim();
    if (!trimmed) return;
    const res = await dispatch(createAdminSupportTicketResponse(Number(activeTicketId), { body: trimmed }));
    if (res.fulfilled)
    {
      message.success(res.message || "Created");
      const result = res.data?.result;
      if (result)
      {
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
      setTicketResponseOpen(false);
      setTicketResponseDraft("");
    } else
    {
      message.error(res.message || "Failed to post response");
    }
  }, [activeTicketId, dispatch, ticketResponseDraft]);

  useEffect(() => {
    if (!isSuperAdmin) return undefined;
    let cancelled = false;
    (async () => {
      const res = await dispatch(fetchAdminSupportTicketsList({ page: 1, page_size: 50 }));
      if (cancelled) return;
      if (!res.fulfilled) message.error(res.message || "Could not load support tickets");
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch, isSuperAdmin]);

  const copyToClipboard = useCallback(async (value) => {
    try
    {
      await navigator.clipboard.writeText(String(value || ""));
      message.success("Copied");
    } catch {
      message.warning("Could not copy");
    }
  }, []);

  const openCustomerRepayment = useCallback((row) => {
    if (row && typeof row === "object" && row.projectName != null)
    {
      const branchPart = row.branchId != null && row.branchId !== "" ? `Branch ${row.branchId}` : null;
      const schedPart = row.scheduleId != null ? `Schedule line #${row.scheduleId}` : null;
      const progress =
        row.paymentScoreLabel != null
          ? `Progress: ${row.paymentScoreLabel}${row.paymentScorePercent != null ? ` (${row.paymentScorePercent}%)` : ""}`
          : null;
      setActivePaymentMeta({
        type: "customer",
        title: `${row.projectName} — customer repayment`,
        subtitle: [row.projectName, branchPart, schedPart].filter(Boolean).join("  •  "),
        ref: row.reference || (row.id != null ? `Payment #${row.id}` : "—"),
        cadence: progress || "—",
        actionLabel: "Record customer payment",
        customerScheduleLineId: row.scheduleId ?? row.customerScheduleLineId,
      });
    } else
    {
      setActivePaymentMeta({
        type: "customer",
        title: "Customer repayment schedule",
        subtitle: "Select a payment row to anchor the plan",
        ref: "—",
        cadence: "—",
        actionLabel: "Record customer payment",
        customerScheduleLineId: undefined,
      });
    }
    setCustomerRepaymentOpen(true);
  }, []);

  const closePaymentModal = useCallback(() => {
    setCustomerRepaymentOpen(false);
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
          if (res.fulfilled)
          {
            message.success(res.message || "Deactivated");
            refreshInvestorUsers();
          } else
          {
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
      if (!res.fulfilled)
      {
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

  const openInvestorEdit = useCallback(() => {
    if (!investorUserDetail) return;
    investorEditForm.setFieldsValue({
      legal_name: investorUserDetail.legal_name,
      kyc_tier: investorUserDetail.kyc_tier,
      kyc_status: investorUserDetail.kyc_status,
      phone: investorUserDetail.phone,
      is_active: investorUserDetail.is_active,
      user_email: investorUserDetail.user?.email,
      user_first_name: investorUserDetail.user?.first_name,
      user_last_name: investorUserDetail.user?.last_name,
      user_is_active: investorUserDetail.user?.is_active,
    });
    setInvestorEditOpen(true);
  }, [investorEditForm, investorUserDetail]);

  const closeInvestorEdit = useCallback(() => {
    setInvestorEditOpen(false);
    investorEditForm.resetFields();
  }, [investorEditForm]);

  const submitInvestorEdit = useCallback(async () => {
    if (!investorUserDetail?.id) return;
    try
    {
      const values = await investorEditForm.validateFields();
      const payload = {
        legal_name: values.legal_name?.trim() || "",
        kyc_tier: values.kyc_tier,
        kyc_status: values.kyc_status,
        phone: values.phone?.trim() || "",
        is_active: Boolean(values.is_active),
        user: {
          email: values.user_email?.trim() || "",
          first_name: values.user_first_name?.trim() || "",
          last_name: values.user_last_name?.trim() || "",
          is_active: Boolean(values.user_is_active),
        },
      };
      const res = await dispatch(updateAdminInvestorUser(investorUserDetail.id, payload));
      if (res.fulfilled)
      {
        message.success(res.message || "Updated");
        closeInvestorEdit();
        refreshInvestorUsers();
      } else
      {
        message.error(res.message || "Update failed");
      }
    } catch {
      /* validation */
    }
  }, [closeInvestorEdit, dispatch, investorEditForm, investorUserDetail, refreshInvestorUsers]);

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
          if (res.fulfilled)
          {
            message.success(res.message || "Deactivated");
            refreshAdminProjects();
          } else
          {
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
      if (!res.fulfilled)
      {
        message.error(res.message || "Failed to load project");
        setProjectDetailOpen(false);
      }
    },
    [dispatch]
  );

  const closeProjectDetail = () => {
    setProjectDetailOpen(false);
    setProjectEditOpen(false);
    projectEditForm.resetFields();
    setProjectCustomerSchedules([]);
    dispatch(clearInvestorProjectDetail());
  };

  const closeProjectEdit = useCallback(() => {
    setProjectEditOpen(false);
    projectEditForm.resetFields();
    setProjectCustomerSchedules([]);
  }, [projectEditForm]);

  const openProjectEdit = useCallback(() => {
    const d = projectDetail;
    if (!d?.id) return;
    const plan = d.customer_repayment_plan || {};
    const principalFromPlan = Number(plan.principal_amount);
    const totalN = Number(d.total_project_cost ?? 0);
    const clientN = Number(d.client_contribution ?? 0);
    const principalDefault =
      Number.isFinite(principalFromPlan) && principalFromPlan > 0
        ? principalFromPlan
        : Math.max(0, totalN - clientN);
    const schedules = Array.isArray(d.customer_payment_schedules) ? d.customer_payment_schedules : [];
    setProjectCustomerSchedules(
      schedules.map((s) => ({
        ...s,
        due_date: s.due_date ? dayjs(s.due_date) : null,
        paid_date: s.paid_date ? dayjs(s.paid_date) : null,
      }))
    );
    projectEditForm.setFieldsValue({
      projectName: d.name,
      branchId: d.branch_id != null ? String(d.branch_id) : "",
      description: d.description || "",
      locationLabel: d.location_label || "",
      systemCapacityKwp: Number(d.system_capacity_kwp ?? 0),
      projectType: d.project_type || "solar",
      status: d.status || "planning",
      totalProjectCost: Number(d.total_project_cost ?? 0),
      clientContribution: Number(d.client_contribution ?? 0),
      installationDate: d.installation_date ? dayjs(d.installation_date) : null,
      projectDurationMonths: d.project_duration_months ?? 12,
      is_active: d.is_active !== false,
      crPlanType: plan.plan_type || "monthly",
      crPrincipalAmount: principalDefault,
      crFirstDueDate: plan.first_due_date ? dayjs(plan.first_due_date) : null,
      crInterestRatePa: Number(plan.interest_rate_pa ?? 0),
      crGracePeriodDays: plan.grace_period_days ?? 0,
      crNotes: plan.notes || "",
    });
    setProjectEditOpen(true);
  }, [projectDetail, projectEditForm]);

  const submitProjectEdit = useCallback(async () => {
    const d = projectDetail;
    if (!d?.id) return;
    try
    {
      const values = await projectEditForm.validateFields();
      const branchRaw =
        values.branchId != null && values.branchId !== "" ? String(values.branchId).trim() : "";
      let branch_id = null;
      if (branchRaw)
      {
        const n = Number(branchRaw);
        if (!Number.isFinite(n))
        {
          message.error("Branch ID must be a number");
          return;
        }
        branch_id = n;
      }
      const total = Number(values.totalProjectCost);
      const client = Number(values.clientContribution ?? 0);
      const kwp = Number(values.systemCapacityKwp ?? 0);
      if (!Number.isFinite(total) || total < 0)
      {
        message.error("Enter a valid total project cost");
        return;
      }
      const durationMonths = Math.floor(Number(values.projectDurationMonths));
      if (!Number.isFinite(durationMonths) || durationMonths < 1)
      {
        message.error("Enter a valid project duration (months)");
        return;
      }
      if (!values.installationDate)
      {
        message.error("Installation date is required");
        return;
      }
      if (!values.crFirstDueDate && d.customer_repayment_plan?.id)
      {
        message.error("First due date is required for the customer repayment plan");
        return;
      }
      const principal = Number(values.crPrincipalAmount);
      if (d.customer_repayment_plan?.id && (!Number.isFinite(principal) || principal < 0))
      {
        message.error("Enter a valid principal amount");
        return;
      }

      const projectPayload = {
        id: d.id,
        name: String(values.projectName || "").trim(),
        branch_id,
        description: String(values.description || "").trim(),
        location_label: String(values.locationLabel || "").trim(),
        system_capacity_kwp: (Number.isFinite(kwp) ? kwp : 0).toFixed(4),
        project_type: values.projectType,
        status: values.status,
        total_project_cost: total.toFixed(2),
        client_contribution: (Number.isFinite(client) ? client : 0).toFixed(2),
        installation_date: dayjs(values.installationDate).format("YYYY-MM-DD"),
        project_duration_months: durationMonths,
        is_active: Boolean(values.is_active),
      };

      const planId = d.customer_repayment_plan?.id;
      const customer_repayment_plan = planId
        ? {
          id: planId,
          plan_type: values.crPlanType,
          principal_amount: principal.toFixed(2),
          first_due_date: dayjs(values.crFirstDueDate).format("YYYY-MM-DD"),
          interest_rate_pa: Number(values.crInterestRatePa ?? 0).toFixed(4),
          grace_period_days: Math.max(0, Math.floor(Number(values.crGracePeriodDays ?? 0))),
          notes: values.crNotes?.trim() || "",
        }
        : undefined;

      const customer_payment_schedules = projectCustomerSchedules
        .filter((row) => row.id != null)
        .map((row) => {
          const amtDue = Number(row.amount_due);
          const amtPaid = Number(row.amount_paid ?? 0);
          return {
            id: row.id,
            installment_number: Math.floor(Number(row.installment_number)),
            due_date: row.due_date ? dayjs(row.due_date).format("YYYY-MM-DD") : null,
            amount_due: Number.isFinite(amtDue) ? amtDue.toFixed(2) : "0.00",
            amount_paid: Number.isFinite(amtPaid) ? amtPaid.toFixed(2) : "0.00",
            paid_date: row.paid_date ? dayjs(row.paid_date).format("YYYY-MM-DD") : null,
            status: row.status || "scheduled",
          };
        });

      const payload = { project: projectPayload };
      if (customer_repayment_plan)
      {
        payload.customer_repayment_plan = customer_repayment_plan;
        payload.customer_payment_schedules = customer_payment_schedules;
      }

      const res = await dispatch(updateAdminInvestorProject(d.id, payload));
      if (res.fulfilled)
      {
        message.success(res.message || "Updated");
        closeProjectEdit();
        refreshAdminProjects();
        void refreshPaymentSchedules();
      } else
      {
        message.error(res.message || "Update failed");
      }
    } catch {
      /* validation */
    }
  }, [
    closeProjectEdit,
    dispatch,
    projectCustomerSchedules,
    projectDetail,
    projectEditForm,
    refreshAdminProjects,
    refreshPaymentSchedules,
  ]);

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
          if (res.fulfilled)
          {
            message.success(res.message || "Deactivated");
            refreshAdminInvestments();
          } else
          {
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
      if (!res.fulfilled)
      {
        message.error(res.message || "Failed to load investment");
        setInvestmentDetailOpen(false);
      }
    },
    [dispatch]
  );

  const closeInvestmentDetail = () => {
    setInvestmentDetailOpen(false);
    setInvestmentEditOpen(false);
    investmentEditForm.resetFields();
    setInvestmentPaymentSchedules([]);
    dispatch(clearInvestorInvestmentDetail());
  };

  const closeInvestmentEdit = useCallback(() => {
    setInvestmentEditOpen(false);
    investmentEditForm.resetFields();
    setInvestmentPaymentSchedules([]);
  }, [investmentEditForm]);

  const openInvestmentEdit = useCallback(() => {
    const d = investmentDetail;
    if (!d?.id) return;
    const plan = d.repayment_plan || {};
    const schedules = Array.isArray(d.payment_schedules) ? d.payment_schedules : [];
    setInvestmentPaymentSchedules(
      schedules.map((s) => ({
        ...s,
        due_date: s.due_date ? dayjs(s.due_date) : null,
        paid_date: s.paid_date ? dayjs(s.paid_date) : null,
      }))
    );
    investmentEditForm.setFieldsValue({
      capitalAmount: Number(d.capital_amount ?? 0),
      sharePercent: Number(d.share_percent ?? 0),
      contractStart: d.contract_start_date ? dayjs(d.contract_start_date) : null,
      contractEnd: d.contract_end_date ? dayjs(d.contract_end_date) : null,
      invStatus: d.status || "active",
      invNotes: d.notes || "",
      planType: plan.plan_type || "monthly",
      firstDueDate: plan.first_due_date ? dayjs(plan.first_due_date) : null,
      interestPercent: Number(plan.interest_percent ?? 0),
      interestBasis: plan.interest_basis || "annual",
      totalRepayable: Number(plan.total_repayable ?? 0),
    });
    setInvestmentEditOpen(true);
  }, [investmentDetail, investmentEditForm]);

  const submitInvestmentEdit = useCallback(async () => {
    const d = investmentDetail;
    if (!d?.id) return;
    try
    {
      const values = await investmentEditForm.validateFields();
      const cap = Number(values.capitalAmount);
      const share = Number(values.sharePercent);
      if (!Number.isFinite(cap) || cap < 0)
      {
        message.error("Enter a valid capital amount");
        return;
      }
      if (!Number.isFinite(share) || share < 0)
      {
        message.error("Enter a valid share percent");
        return;
      }
      if (!values.contractStart)
      {
        message.error("Contract start date is required");
        return;
      }
      if (!values.firstDueDate && d.repayment_plan?.id)
      {
        message.error("First due date is required for the repayment plan");
        return;
      }
      const totalRep = Number(values.totalRepayable);
      if (d.repayment_plan?.id && (!Number.isFinite(totalRep) || totalRep < 0))
      {
        message.error("Enter a valid total repayable");
        return;
      }

      const investmentPayload = {
        id: d.id,
        investor_id: d.investor_id,
        project_id: d.project_id,
        capital_amount: cap.toFixed(2),
        share_percent: share.toFixed(4),
        contract_start_date: dayjs(values.contractStart).format("YYYY-MM-DD"),
        contract_end_date: values.contractEnd ? dayjs(values.contractEnd).format("YYYY-MM-DD") : null,
        status: values.invStatus,
        notes: values.invNotes?.trim() || "",
      };

      const planId = d.repayment_plan?.id;
      const repayment_plan = planId
        ? {
          id: planId,
          plan_type: values.planType,
          first_due_date: dayjs(values.firstDueDate).format("YYYY-MM-DD"),
          interest_percent: Number(values.interestPercent ?? 0).toFixed(4),
          interest_basis: values.interestBasis || "annual",
          total_repayable: totalRep.toFixed(2),
        }
        : undefined;

      const payment_schedules = investmentPaymentSchedules
        .filter((row) => row.id != null)
        .map((row) => {
          const amtTotal = Number(row.amount_due_total);
          const amtInv = Number(row.amount_due_investor_share);
          const amtPaid = Number(row.amount_paid ?? 0);
          return {
            id: row.id,
            installment_number: Math.floor(Number(row.installment_number)),
            due_date: row.due_date ? dayjs(row.due_date).format("YYYY-MM-DD") : null,
            amount_due_total: Number.isFinite(amtTotal) ? amtTotal.toFixed(2) : "0.00",
            amount_due_investor_share: Number.isFinite(amtInv) ? amtInv.toFixed(2) : "0.00",
            amount_paid: Number.isFinite(amtPaid) ? amtPaid.toFixed(2) : "0.00",
            paid_date: row.paid_date ? dayjs(row.paid_date).format("YYYY-MM-DD") : null,
            status: row.status || "scheduled",
          };
        });

      const payload = { investment: investmentPayload };
      if (repayment_plan)
      {
        payload.repayment_plan = repayment_plan;
        payload.payment_schedules = payment_schedules;
      }

      const res = await dispatch(updateAdminInvestorInvestment(d.id, payload));
      if (res.fulfilled)
      {
        message.success(res.message || "Updated");
        closeInvestmentEdit();
        refreshAdminInvestments();
        void refreshPaymentSchedules();
      } else
      {
        message.error(res.message || "Update failed");
      }
    } catch {
      /* validation */
    }
  }, [
    closeInvestmentEdit,
    dispatch,
    investmentDetail,
    investmentEditForm,
    investmentPaymentSchedules,
    refreshAdminInvestments,
    refreshPaymentSchedules,
  ]);

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
          if (res.fulfilled)
          {
            message.success(res.message || "Deactivated");
            refreshCustomerPayments();
            void refreshPaymentSchedules();
          } else
          {
            message.error(res.message || "Request failed");
            throw new Error(res.message);
          }
        },
      });
    },
    [dispatch, customerPaymentDeleteLoading, refreshCustomerPayments, refreshPaymentSchedules]
  );

  const handleViewCustomerPayment = useCallback(
    async (id) => {
      setCustomerPaymentEditing(false);
      customerPaymentEditForm.resetFields();
      setCustomerPaymentDetailOpen(true);
      dispatch(clearCustomerPaymentDetail());
      const res = await dispatch(fetchAdminCustomerPaymentDetail(id));
      if (!res.fulfilled)
      {
        message.error(res.message || "Failed to load payment");
        setCustomerPaymentDetailOpen(false);
      }
    },
    [customerPaymentEditForm, dispatch]
  );

  const closeCustomerPaymentDetail = () => {
    setCustomerPaymentDetailOpen(false);
    setCustomerPaymentEditing(false);
    customerPaymentEditForm.resetFields();
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

    try
    {
      await recordPaymentForm.validateFields([
        "project_id",
        "branch_id",
        "payment_method",
        "reference",
        "notes",
      ]);

      const values = recordPaymentForm.getFieldsValue(true);
      const selectedScheduleIds = Array.isArray(values.customer_schedule_ids) ? values.customer_schedule_ids : [];
      const branch_id = parseBranch(values.branch_id);
      if (values.branch_id != null && String(values.branch_id).trim() !== "" && branch_id === null)
      {
        message.error("Branch ID must be numeric or empty");
        return;
      }

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
        message.error(
          selectedScheduleIds.length
            ? "Fill amount and payment date for the selected schedule lines"
            : "Add at least one line with schedule ID, amount, and payment date"
        );
        return;
      }
      const payload = {
        project_id: values.project_id,
        branch_id,
        payment_method: values.payment_method,
        reference: values.reference?.trim() || "",
        notes: values.notes?.trim() || "",
        line_items,
      };

      const res = await dispatch(createAdminCustomerPayment(payload));
      if (res.fulfilled)
      {
        message.success(res.message || "Created");
        closeModal();
        recordPaymentForm.resetFields();
        refreshCustomerPayments();
        void refreshPaymentSchedules();
      } else
      {
        message.error(res.message || "Create failed");
      }
    } catch {
      /* validation */
    }
  };

  const submitCustomerPaymentEdit = useCallback(async () => {
    if (!customerPaymentDetail?.id) return;
    try
    {
      const values = await customerPaymentEditForm.validateFields();
      const payload = {
        amount_received: String(Number(values.amount_received)),
        payment_date: dayjs(values.payment_date).format("YYYY-MM-DD"),
        payment_method: values.payment_method,
        reference: values.reference?.trim() || "",
        notes: values.notes?.trim() || "",
      };
      const res = await dispatch(updateAdminCustomerPayment(customerPaymentDetail.id, payload));
      if (res.fulfilled)
      {
        message.success(res.message || "Updated");
        setCustomerPaymentEditing(false);
        refreshCustomerPayments();
        void refreshPaymentSchedules();
      } else
      {
        message.error(res.message || "Update failed");
      }
    } catch {
      /* validation */
    }
  }, [customerPaymentDetail, customerPaymentEditForm, dispatch, refreshCustomerPayments, refreshPaymentSchedules]);

  const submitCreateInvestment = async () => {
    try
    {
      const values = await investmentForm.validateFields();
      const payload = {
        investor_id: values.investor_id,
        project_id: values.project_id,
        expected_commission_date: dayjs(values.expectedCommissionDate).format("YYYY-MM-DD"),
        status: values.status || "active",
        customer_repayment_plan: {
          plan_type: values.planType,
          interest_rate: Number(values.interestRate),
          interest_basis: values.interestBasis || "annual",
        },
      };
      if (values.projectDurationMonths != null && values.projectDurationMonths !== "")
      {
        payload.project_duration_months = Math.floor(Number(values.projectDurationMonths));
      }
      if (values.clientContribution != null && values.clientContribution !== "")
      {
        payload.client_contribution = Number(values.clientContribution);
      }

      const res = await dispatch(createAdminInvestorInvestment(payload));
      if (res.fulfilled)
      {
        message.success(res.message || "Created");
        closeModal();
        investmentForm.resetFields();
        refreshAdminInvestments();
      } else
      {
        message.error(res.message || "Create failed");
      }
    } catch {
      /* validation */
    }
  };

  const submitCreateProject = async () => {
    try
    {
      // Validate required fields only; partial validateFields() omits other form values.
      await projectForm.validateFields(["projectName", "totalProjectCost"]);
      const values = projectForm.getFieldsValue(true);
      const branchRaw =
        values.branchId != null && values.branchId !== "" ? String(values.branchId).trim() : "";
      let branch_id = null;
      if (branchRaw)
      {
        const n = Number(branchRaw);
        if (!Number.isFinite(n))
        {
          message.error("Branch ID must be a number");
          return;
        }
        branch_id = n;
      }
      const total = Number(values.totalProjectCost);
      const kwp = Number(values.systemCapacityKwp ?? 0);
      if (!Number.isFinite(total) || total < 0)
      {
        message.error("Enter a valid total project cost");
        return;
      }

      const formatDecimalField = (n) => String(parseFloat(Number(n).toFixed(4)));

      const rawCostItems =
        showProjectCostBreakdown && Array.isArray(values.cost_items) ? values.cost_items : [];
      const cost_items = [];
      for (const ci of rawCostItems)
      {
        const category = ci?.category ? String(ci.category).trim() : "";
        const label = ci?.label ? String(ci.label).trim() : "";
        const amount = Number(ci?.amount);
        const hasAny = category || label || Number.isFinite(amount);
        if (!hasAny) continue;
        if (!category || !Number.isFinite(amount) || amount < 0)
        {
          message.error("Each cost item needs a category and amount — or remove the row");
          return;
        }
        cost_items.push({
          category,
          amount: amount.toFixed(2),
          ...(label ? { label } : {}),
          ...(ci?.notes ? { notes: String(ci.notes).trim() } : {}),
        });
      }

      const payload = {
        name: values.projectName.trim(),
        branch_id,
        project_type: values.projectType,
        system_capacity_kwp: formatDecimalField(Number.isFinite(kwp) ? kwp : 0),
        description: values.description?.trim() || "",
        total_project_cost: total.toFixed(2),
        cost_items,
      };
      const res = await dispatch(createAdminInvestorProject(payload));
      if (res.fulfilled)
      {
        message.success(res.message || "Created");
        setShowProjectCostBreakdown(true);
        closeModal();
        projectForm.resetFields();
        refreshAdminProjects();
      } else
      {
        message.error(res.message || "Create failed");
      }
    } catch {
      /* validation */
    }
  };

  const createWalletInvestor = Form.useWatch("isWalletInvestor", investorForm);

  const submitCreateInvestor = async () => {
    try
    {
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
        is_wallet_investor: Boolean(values.isWalletInvestor),
      };
      if (
        values.isWalletInvestor &&
        values.totalDeposited != null &&
        values.totalDeposited !== ""
      ) {
        const amt = Number(values.totalDeposited);
        if (Number.isFinite(amt) && amt >= 0) {
          payload.total_deposited = amt.toFixed(2);
        }
      }
      const res = await dispatch(createAdminInvestorUser(payload));
      if (res.fulfilled)
      {
        message.success(res.message || "Created");
        closeModal();
        investorForm.resetFields();
        refreshInvestorUsers();
      } else
      {
        message.error(res.message || "Create failed");
      }
    } catch {
      /* validation */
    }
  };

  const submitMock = async (form) => {
    try
    {
      await form.validateFields();
      message.success("Saved successfully.");
      closeModal();
      form.resetFields();
      return { fulfilled: true };
    } catch {
      return { fulfilled: false };
    }
  };

  const metrics = useMemo(() => {
    const dash = () => (overviewLoading ? "…" : "—");
    const ti = overviewTotalInvested;
    const ce = overviewCustomersExpected;
    const ap = overviewActiveProjects;
    const ai = overviewActiveInvestors;
    const np = overviewNearestPayments;

    const totalInvestedVal =
      ti?.total_invested != null && ti.total_invested !== "" ? ngnCompact(Number(ti.total_invested)) : dash();

    const expectedVal =
      ce?.expected != null && ce.expected !== "" ? ngnCompact(Number(ce.expected)) : dash();
    const expectedSub =
      ce?.paid != null && ce.left != null && ce.paid !== "" && ce.left !== ""
        ? `Paid: ${ngnCompact(Number(ce.paid))} · Left: ${ngnCompact(Number(ce.left))}`
        : undefined;

    const projectsVal =
      ap?.count != null && ap.count !== "" ? String(ap.count) : dash();
    const projectsSub =
      ap?.financed_count != null && ap?.open_for_investment_count != null
        ? `Financed: ${ap.financed_count} · Open: ${ap.open_for_investment_count}`
        : undefined;

    const investorsVal =
      ai?.count != null && ai.count !== "" ? String(ai.count) : dash();
    const investorsSub =
      ai?.verified_count != null && ai?.under_review_count != null
        ? `Verified: ${ai.verified_count} · Under review: ${ai.under_review_count}`
        : undefined;

    const nearestHeadline =
      np?.headline_relative_label || np?.to_investor?.relative_label || dash();
    const fromCust = np?.from_customer;

    const nearestDate = np?.headline_date || np?.to_investor?.date || nearestHeadline;
    const isOverdue = nearestDate && dayjs(nearestDate, ["YYYY-MM-DD", "DD MMM YYYY", "DD MMMM YYYY"]).isValid()
      ? dayjs(nearestDate, ["YYYY-MM-DD", "DD MMM YYYY", "DD MMMM YYYY"]).isBefore(dayjs(), "day")
      : false;
    const nearestLabel = isOverdue ? "Overdue payment" : "Nearest payment";

    const nearestSub = fromCust?.amount != null ? ngnCompact(Number(fromCust.amount)) : undefined;

    return [
      {
        key: "a",
        icon: <DollarOutlined />,
        label: "Total invested (investors)",
        value: totalInvestedVal,
        bg: "linear-gradient(135deg, #5C12A7 100%, #4c1d95 100%)",
        decorationColor: "rgba(255,255,255,0.06)",
      },
      {
        key: "b",
        icon: <FundOutlined />,
        label: "Customers expected (all-in)",
        value: expectedVal,
        sub: expectedSub,
        bg: "linear-gradient(135deg, #5C12A7 100%, #4c1d95 100%)",
        decorationColor: "rgba(255,255,255,0.06)",
      },
      {
        key: "c",
        icon: <ProjectOutlined />,
        label: "Active projects",
        value: projectsVal,
        sub: projectsSub,
        bg: "linear-gradient(135deg, #5C12A7 100%, #4c1d95 100%)",
        decorationColor: "rgba(255,255,255,0.06)",
      },
      {
        key: "d",
        icon: <UserAddOutlined />,
        label: "Active investors",
        value: investorsVal,
        sub: investorsSub,
        bg: "linear-gradient(135deg, #5C12A7 100%, #4c1d95 100%)",
        decorationColor: "rgba(255,255,255,0.06)",
      },
      {
        key: "e",
        icon: <ThunderboltOutlined />,
        label: nearestLabel,
        value: nearestHeadline,
        sub: nearestSub,
        bg: "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)",
        decorationColor: "rgba(255,255,255,0.07)",
      },
    ];
  }, [
    overviewLoading,
    overviewTotalInvested,
    overviewCustomersExpected,
    overviewActiveProjects,
    overviewActiveInvestors,
    overviewNearestPayments,
  ]);

  const customerRepaymentColumns = useMemo(
    () => [
      adminColPct(38, { title: "Project", dataIndex: "project", key: "project", ellipsis: true }),
      adminColPct(12, {
        title: "status",
        key: "status",
        render: (_, row) => (
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
        ),
      }),
      adminColPct(15, {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        align: "right",
        onHeaderCell: () => ({ className: "admin-table-col-gap-r" }),
        onCell: () => ({ className: "admin-table-col-gap-r" }),
      }),
      adminColPct(15, {
        title: "date",
        dataIndex: "when",
        key: "date",
        render: (v) => <span className="admin-table-nowrap">{v}</span>,
        onHeaderCell: () => ({ className: "admin-table-col-gap-l" }),
        onCell: () => ({ className: "admin-table-col-gap-l" }),
      }),
      adminColPct(20, {
        title: "Payment scores",
        key: "next",
        dataIndex: "next",
        render: (v) =>
          v === "Past due" ? (
            <Tag color="red" className="admin-investor-pill">
              Past due
            </Tag>
          ) : (
            v
          ),
      }),
    ],
    []
  );

  const overviewCustomerRepaymentRows = useMemo(() => {
    const results = adminCustomerPaymentsList?.results || [];
    return results.map((r) => {
      const st = String(r.line_status || "").toLowerCase();
      const status =
        st === "paid" ? "Paid" : st.includes("partial") ? "Partial" : st.includes("miss") ? "Missed" : "Pending";
      return {
        key: String(r.id),
        project: r.project_name || "—",
        status,
        amount: ngnCompact(Number(r.amount_received)),
        when: r.payment_date ? dayjs(r.payment_date).format("DD MMM YYYY") : "—",
        next: r.payment_score?.label ?? "—",
      };
    });
  }, [adminCustomerPaymentsList]);

  const perfColumns = useMemo(
    () => [
      adminColPct(36, { title: "Project", dataIndex: "project", key: "project", ellipsis: true }),
      adminColPct(10, {
        title: "kWp",
        dataIndex: "capacityKwp",
        key: "capacityKwp",
        align: "right",
        render: (v) => <span className="admin-table-nowrap">{formatKwpDisplay(v)}</span>,
        onHeaderCell: () => ({ className: "admin-table-col-gap-r" }),
        onCell: () => ({ className: "admin-table-col-gap-r" }),
      }),
      adminColPct(16, {
        title: "Total gen (MWh)",
        dataIndex: "totalGenMwh",
        key: "totalGenMwh",
        align: "right",
        render: (v) => <span className="admin-table-nowrap">{v}</span>,
        onHeaderCell: () => ({ className: "admin-table-col-gap-l admin-table-col-gap-r" }),
        onCell: () => ({ className: "admin-table-col-gap-l admin-table-col-gap-r" }),
      }),
      adminColPct(16, {
        title: "Avg daily (MWh)",
        dataIndex: "avgDailyMwh",
        key: "avgDailyMwh",
        align: "right",
        render: (v) => <span className="admin-table-nowrap">{v}</span>,
        onHeaderCell: () => ({ className: "admin-table-col-gap-l admin-table-col-gap-r" }),
        onCell: () => ({ className: "admin-table-col-gap-l admin-table-col-gap-r" }),
      }),
      adminColPct(10, {
        title: "Solar %",
        dataIndex: "solarPct",
        key: "solarPct",
        align: "right",
        render: (v) => <span className="admin-table-nowrap">{v}</span>,
        onHeaderCell: () => ({ className: "admin-table-col-gap-l" }),
        onCell: () => ({ className: "admin-table-col-gap-l" }),
      }),
      adminColPct(12, {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (v) => (
          <Tag
            color={String(v).toLowerCase() === "active" ? "green" : String(v).toLowerCase().includes("watch") ? "gold" : "default"}
            className="admin-investor-pill"
          >
            {v}
          </Tag>
        ),
      }),
    ],
    []
  );

  const perfRows = useMemo(
    () =>
      (projectsPerformance?.results || []).map((r) => ({
        key: String(r.project_id),
        project: r.project_name,
        capacityKwp: r.system_capacity_kwp,
        totalGenMwh: formatMwhFromKwh(r.total_generation_kwh),
        avgDailyMwh: formatMwhFromKwh(r.average_daily_generation_kwh),
        solarPct: r.solar_percent_of_branch_energy != null ? `${Number(r.solar_percent_of_branch_energy).toFixed(2)}%` : "—",
        status: r.status,
      })),
    [projectsPerformance]
  );

  const overviewPerfRows = useMemo(() => perfRows, [perfRows]);

  const overviewFinanceByInvestorRows = useMemo(
    () =>
      (financeByInvestorList?.results || []).map((r) => ({
        key: String(r.id),
        investor: r.legal_name,
        ref: r.investor_ref,
        capital: ngnCompact(Number(r.capital_deployed)),
        interest: ngnCompact(Number(r.interest_flat_amount)),
        paid: ngnCompact(Number(r.paid_to_investor_ytd)),
        health: r.health,
      })),
    [financeByInvestorList]
  );

  /** Shared by the Overview and Investments & Investors tabs — same finance-by-investor figures. */
  const financeByInvestorColumns = useMemo(
    () => [
      adminColPct(34, { title: "Investor", dataIndex: "investor", key: "investor", ellipsis: true }),
      adminColPct(14, {
        title: "Ref",
        dataIndex: "ref",
        key: "ref",
        ellipsis: true,
        onHeaderCell: () => ({ className: "admin-table-col-gap-r" }),
        onCell: () => ({ className: "admin-table-col-gap-r" }),
      }),
      adminColPct(14, {
        title: "Capital",
        dataIndex: "capital",
        key: "capital",
        align: "right",
        render: (v) => <span className="admin-table-nowrap">{v}</span>,
        onHeaderCell: () => ({ className: "admin-table-col-gap-r" }),
        onCell: () => ({ className: "admin-table-col-gap-r" }),
      }),
      adminColPct(12, {
        title: "Interest %",
        dataIndex: "interest",
        key: "interest",
        align: "right",
        render: (v) => <span className="admin-table-nowrap">{v}</span>,
        onHeaderCell: () => ({ className: "admin-table-col-gap-l admin-table-col-gap-r" }),
        onCell: () => ({ className: "admin-table-col-gap-l admin-table-col-gap-r" }),
      }),
      adminColPct(14, {
        title: "Paid YTD",
        dataIndex: "paid",
        key: "paid",
        align: "right",
        render: (v) => <span className="admin-table-nowrap">{v}</span>,
        onHeaderCell: () => ({ className: "admin-table-col-gap-l" }),
        onCell: () => ({ className: "admin-table-col-gap-l" }),
      }),
      adminColPct(12, {
        title: "Health",
        dataIndex: "health",
        key: "health",
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
      }),
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
        String(r.user_email || "").toLowerCase().includes(q) ||
        String(r.user_username || "").toLowerCase().includes(q)
    );
  }, [investorUsersList, investorSearch]);

  const investorsTableRows = useMemo(
    () =>
      filteredInvestorResults.map((r) => ({
        key: String(r.id),
        id: r.id,
        name: r.legal_name,
        ref: r.investor_ref,
        kycTier: r.kyc_tier,
        count: r.investments_count ?? "—",
        status: r.account_active ? "Active" : "Inactive",
        userActive: r.account_active,
        last: r.last_activity ? dayjs(r.last_activity).format("DD MMM YYYY") : "—",
      })),
    [filteredInvestorResults]
  );

  const investorsColumns = useMemo(
    () => [
      adminColPct(30, { title: "Legal name", dataIndex: "name", key: "name", ellipsis: true }),
      adminColPct(13, {
        title: "Ref",
        dataIndex: "ref",
        key: "ref",
        ellipsis: true,
      }),
      adminColPct(10, {
        title: "KYC",
        key: "kyc",
        render: (_, row) =>
          row.kycTier ? (
            <Tag className="admin-investor-pill">{row.kycTier}</Tag>
          ) : (
            "—"
          ),
      }),
      adminColPct(9, { title: "No. invest.", dataIndex: "count", key: "count" }),
      adminColPct(11, {
        title: "Status",
        key: "status",
        render: (_, row) => {
          const active = row.status === "Active" && row.userActive;
          return (
            <Tag color={active ? "green" : "default"} className="admin-investor-pill">
              {active ? "Active" : "Inactive"}
            </Tag>
          );
        },
      }),
      adminColPct(14, {
        title: "Last activity",
        dataIndex: "last",
        key: "last",
        render: (v) => <span className="admin-table-nowrap">{v}</span>,
      }),
      adminColPct(13, {
        title: "Actions",
        key: "actions",
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
      }),
    ],
    [handleDeactivateInvestor, handleViewInvestor]
  );

  const filteredProjectResults = useMemo(() => {
    const results = adminProjectsList?.results || [];
    const q = projectSearch.trim().toLowerCase();
    let next = results;
    if (q)
    {
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
    return next.filter((r) => mapAdminProjectProgrammeState(r.programme_state || r.status) === projectProgrammeStateFilter);
  }, [adminProjectsList, projectSearch, projectProgrammeStateFilter]);

  const projectsTableRows = useMemo(
    () =>
      filteredProjectResults.map((r) => {
        const typeLabel = r.project_type ? String(r.project_type).replace(/^\w/, (c) => c.toUpperCase()) : "—";
        const stateUi = mapAdminProjectProgrammeState(r.programme_state || r.status);
        return {
          key: String(r.id),
          id: r.id,
          project: r.name,
          typeLabel,
          capacityKwp: r.system_capacity_kwp,
          totalCost: r.total_project_cost,
          clientContr: r.client_contribution,
          stateUi,
          investorName: r.investor_summary || r.primary_investor || (Array.isArray(r.investors) ? r.investors.join(", ") : "—") || "—",
        };
      }),
    [filteredProjectResults]
  );

  const projectsProgrammeColumns = useMemo(
    () => [
      adminColPct(22, { title: "Project", dataIndex: "project", key: "project", ellipsis: true }),
      adminColPct(8, {
        title: "Type",
        dataIndex: "typeLabel",
        key: "typeLabel",
        render: (v) => <Tag className="admin-investor-pill">{v}</Tag>,
      }),
      adminColPct(8, {
        title: "kWp",
        dataIndex: "capacityKwp",
        key: "capacityKwp",
        align: "right",
        render: (v) => <span className="admin-table-nowrap">{formatKwpDisplay(v)}</span>,
        onHeaderCell: () => ({ className: "admin-table-col-gap-r" }),
        onCell: () => ({ className: "admin-table-col-gap-r" }),
      }),
      adminColPct(11, {
        title: "Total cost",
        dataIndex: "totalCost",
        key: "totalCost",
        align: "right",
        render: (v) => <span className="admin-table-nowrap">{ngnCompact(Number(v))}</span>,
        onHeaderCell: () => ({ className: "admin-table-col-gap-l admin-table-col-gap-r" }),
        onCell: () => ({ className: "admin-table-col-gap-l admin-table-col-gap-r" }),
      }),
      adminColPct(12, {
        title: "Client contr.",
        dataIndex: "clientContr",
        key: "clientContr",
        align: "right",
        render: (v) => <span className="admin-table-nowrap">{ngnCompact(Number(v))}</span>,
        onHeaderCell: () => ({ className: "admin-table-col-gap-l" }),
        onCell: () => ({ className: "admin-table-col-gap-l" }),
      }),
      adminColPct(9, {
        title: "State",
        dataIndex: "stateUi",
        key: "stateUi",
        render: (v) => (
          <Tag color={projectProgrammeStateTagColor(v)} className="admin-investor-pill">
            {v}
          </Tag>
        ),
      }),
      adminColPct(18, {
        title: "Investor",
        dataIndex: "investorName",
        key: "investorName",
        ellipsis: true,
      }),
      adminColPct(12, {
        title: "Actions",
        key: "actions",
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
      }),
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
            {...ADMIN_DATA_TABLE_PROPS}
            className="admin-investor-data-table admin-investor-data-table--compact"
            columns={projectsProgrammeColumns}
            dataSource={projectsTableRows}
            loading={projectsListLoading}
            rowKey="key"
          />
          <Text type="secondary" className="admin-investor-footnote">
            Capacity, costs, programme state, and investor assignment per project.
          </Text>
        </Card>

        <Card bordered={false} className="admin-investor-panel">
          <div className="admin-investor-panel-head admin-investor-panel-head--plain">
            <span>Project performance</span>
            <Space size={8}>
              <Segmented size="small" options={["Top", "Bottom"]} value={perfMode} onChange={setPerfMode} />
              <Button size="small" className="admin-investor-filter-btn">
                Total generation (MWh) ▾
              </Button>
            </Space>
          </div>
          <Table
            {...ADMIN_DATA_TABLE_PROPS}
            className="admin-investor-data-table admin-investor-data-table--compact"
            columns={perfColumns}
            dataSource={perfRows}
            loading={projectsPerformanceLoading}
            rowKey="key"
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
      projectsPerformanceLoading,
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

  /** Preview only — the API computes the real capital_amount server-side. */
  const createInvestmentCapitalAmount = useMemo(() => {
    const pid = Number(createInvestmentProjectId);
    if (!Number.isFinite(pid)) return null;
    const p = (adminProjectsList?.results || []).find((x) => Number(x.id) === pid);
    if (!p) return null;
    const total = Number(p.total_project_cost ?? 0);
    const clientEntered = Number(createInvestmentClientContribution);
    const client = Number.isFinite(clientEntered) ? clientEntered : Number(p.client_contribution ?? 0);
    if (Number.isFinite(total) && total > 0)
    {
      const computed = total - (Number.isFinite(client) ? client : 0);
      if (Number.isFinite(computed) && computed > 0) return computed;
    }
    const tgt = Number(p.investor_funding_target ?? 0);
    return Number.isFinite(tgt) && tgt > 0 ? tgt : null;
  }, [adminProjectsList, createInvestmentProjectId, createInvestmentClientContribution]);

  const customerScheduleSelectOptions = useMemo(() => {
    const results = customerSchedules?.results || [];
    const pid = recordPaymentProjectId;
    const filtered =
      pid != null && pid !== ""
        ? results.filter((r) => String(r.project_id) === String(pid))
        : results;
    return filtered.map((s) => ({
      value: s.id,
      label: `${s.label || `ID ${s.id}`} · ${s.project_name || `Project ${s.project_id}`} · due ${s.due_date} · rem ${ngnCompact(
        Number(s.amount_remaining ?? s.amount_due ?? 0)
      )}`,
    }));
  }, [customerSchedules, recordPaymentProjectId]);

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
      // (ID column removed as instructed)
      adminColPct(28, {
        title: "Investor",
        dataIndex: "investorName",
        key: "investorName",
        ellipsis: true,
      }),
      adminColPct(24, { title: "Project", dataIndex: "projectName", key: "projectName", ellipsis: true }),
      adminColPct(14, {
        title: "Capital",
        dataIndex: "capital",
        key: "capital",
        align: "right",
        render: (v) => <span className="admin-table-nowrap">{ngnCompact(Number(v))}</span>,
      }),
      adminColPct(13, {
        title: "Score",
        key: "score",
        render: (_, row) => (
          <div className="admin-investor-score-cell">
            <div className="admin-investor-score-main">{row.scoreMain}</div>
            <div className="admin-investor-score-sub">{row.scoreSub}</div>
          </div>
        ),
      }),
      adminColPct(9, {
        title: "Plan",
        dataIndex: "planLabel",
        key: "planLabel",
        render: (v) => <Tag className="admin-investor-pill">{v}</Tag>,
      }),
      adminColPct(12, {
        title: "Actions",
        key: "actions",
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
      }),
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
        r.notes?.toLowerCase().includes(q) ||
        String(r.line_status || "")
          .toLowerCase()
          .includes(q) ||
        String(r.payment_score?.label || "")
          .toLowerCase()
          .includes(q)
    );
  }, [adminCustomerPaymentsList, customerPaymentSearch]);

  const customerPaymentsListRows = useMemo(
    () =>
      filteredCustomerPaymentResults.map((r) => ({
        key: String(r.id),
        id: r.id,
        projectName: r.project_name,
        branchId: r.branch_id,
        scheduleId: r.customer_schedule_id,
        amount: r.amount_received,
        paymentDate: r.payment_date ? dayjs(r.payment_date).format("DD MMM YYYY") : "—",
        method: r.payment_method,
        reference: r.reference,
        notes: r.notes,
        createdAt: r.created_at,
        paymentScoreLabel: r.payment_score?.label ?? "—",
        paymentScorePercent: r.payment_score?.percent ?? null,
        lineStatus: r.line_status ?? "—",
      })),
    [filteredCustomerPaymentResults]
  );

  const customerPaymentsListColumns = useMemo(
    () => [
      adminColPct(17, { title: "Project", dataIndex: "projectName", key: "projectName", ellipsis: true }),
      adminColPct(10, {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        align: "right",
        render: (v) => <span className="admin-table-nowrap">{ngnCompact(Number(v))}</span>,
        onHeaderCell: () => ({ className: "admin-table-col-gap-r" }),
        onCell: () => ({ className: "admin-table-col-gap-r" }),
      }),
      adminColPct(10, {
        title: "date",
        dataIndex: "paymentDate",
        key: "paymentDate",
        render: (v) => <span className="admin-table-nowrap">{v}</span>,
        onHeaderCell: () => ({ className: "admin-table-col-gap-l" }),
        onCell: () => ({ className: "admin-table-col-gap-l" }),
      }),
      adminColPct(10, { title: "Method", dataIndex: "method", key: "method", ellipsis: true }),
      adminColPct(13, { title: "Reference", dataIndex: "reference", key: "reference", ellipsis: true }),
      adminColPct(10, {
        title: "Progress",
        key: "progress",
        ellipsis: true,
        render: (_, row) => (
          <span className="admin-table-nowrap">
            {row.paymentScoreLabel}
            {row.paymentScorePercent != null ? ` (${row.paymentScorePercent}%)` : ""}
          </span>
        ),
      }),
      adminColPct(8, {
        title: "Line",
        dataIndex: "lineStatus",
        key: "lineStatus",
        render: (v) => (
          <Tag
            color={
              String(v).toLowerCase() === "paid"
                ? "green"
                : String(v).toLowerCase().includes("partial")
                  ? "gold"
                  : "default"
            }
            className="admin-investor-pill"
          >
            {v}
          </Tag>
        ),
      }),
      adminColPct(10, {
        title: "Schedule",
        key: "schedule",
        onHeaderCell: () => ({ className: "admin-table-col-action" }),
        onCell: () => ({ className: "admin-table-col-action" }),
        render: (_, record) => (
          <Button size="small" className="admin-investor-action-btn" onClick={() => openCustomerRepayment(record)}>
            View
          </Button>
        ),
      }),
      adminActionCol(12, {
        title: "Actions",
        key: "actions",
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
      }),
    ],
    [handleDeactivateCustomerPayment, handleViewCustomerPayment, openCustomerRepayment]
  );

  const upcomingCustomerPaymentColumns = useMemo(
    () => [
      adminColPct(12, {
        title: "date",
        dataIndex: "when",
        key: "date",
        render: (v) => <span className="admin-table-nowrap">{v}</span>,
      }),
      adminColPct(22, { title: "Project", dataIndex: "branch", key: "branch", ellipsis: true }),
      adminColPct(16, { title: "Line", dataIndex: "lineLabel", key: "lineLabel", ellipsis: true }),
      adminColPct(12, { title: "Amount", dataIndex: "amount", key: "amount", align: "right" }),
      adminColPct(11, {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (v) => (
          <Tag
            color={
              String(v).toLowerCase().includes("overdue")
                ? "red"
                : String(v).toLowerCase() === "scheduled"
                  ? "blue"
                  : "green"
            }
            className="admin-investor-pill"
          >
            {v}
          </Tag>
        ),
      }),
      adminColPct(11, {
        title: "Schedule",
        key: "sched",
        onHeaderCell: () => ({ className: "admin-table-col-action" }),
        onCell: () => ({ className: "admin-table-col-action" }),
        render: (_, record) => (
          <Button size="small" className="admin-investor-action-btn" onClick={() => openCustomerRepayment(record)}>
            View
          </Button>
        ),
      }),
      adminActionCol(16, {
        title: "Action",
        key: "action",
        render: () => (
          <Button size="small" type="primary" className="admin-investor-action-btn" onClick={() => setActiveModal(MODAL.RECORD_PAYMENT)}>
            Record
          </Button>
        ),
      }),
    ],
    [openCustomerRepayment]
  );

  const upcomingCustomerPaymentRows = useMemo(() => {
    const results = customerSchedules?.results || [];
    const today = dayjs().startOf("day");
    return results
      .filter((r) => {
        const st = String(r.status || "").toLowerCase();
        if (st !== "scheduled") return false;
        return !dayjs(r.due_date).startOf("day").isBefore(today);
      })
      .sort((a, b) => dayjs(a.due_date).valueOf() - dayjs(b.due_date).valueOf())
      .map((r) => ({
        key: String(r.id),
        when: dayjs(r.due_date).format("DD MMM YYYY"),
        branch: r.project_name || "—",
        lineLabel: r.label || `Installment ${r.installment_number}`,
        amount: ngnCompact(Number(r.amount_remaining ?? r.amount_due)),
        status: r.status,
        scheduleId: r.id,
        projectName: r.project_name,
        branchId: null,
        paymentScoreLabel: null,
        paymentScorePercent: null,
        reference: r.label,
      }));
  }, [customerSchedules]);

  const customerScheduleModalRows = useMemo(() => {
    const results = customerSchedules?.results || [];
    const lineId = activePaymentMeta?.customerScheduleLineId;
    if (activePaymentMeta?.type !== "customer") return mockCustomerRepaymentSchedule;
    if (lineId != null && results.length)
    {
      const anchor = results.find((r) => r.id === lineId || String(r.id) === String(lineId));
      if (anchor)
      {
        const pid = anchor.customer_repayment_plan_id;
        return results
          .filter((r) => r.customer_repayment_plan_id === pid)
          .sort((a, b) => (a.installment_number || 0) - (b.installment_number || 0))
          .map((r) => ({
            key: String(r.id),
            idx: r.installment_number,
            due: r.due_date ? dayjs(r.due_date).format("DD MMM YYYY") : "—",
            dueAmount: ngnCompact(Number(r.amount_due)),
            paid: Number(r.amount_paid) > 0 ? ngnCompact(Number(r.amount_paid)) : "—",
            left: ngnCompact(Number(r.amount_remaining)),
            status: r.status,
          }));
      }
      return [];
    }
    return mockCustomerRepaymentSchedule;
  }, [activePaymentMeta, customerSchedules, mockCustomerRepaymentSchedule]);

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
            {...ADMIN_DATA_TABLE_PROPS}
            columns={customerPaymentsListColumns}
            dataSource={customerPaymentsListRows}
            loading={customerPaymentsListLoading}
            rowKey="key"
          />
        </Card>

        <Card bordered={false} className="admin-investor-panel">
          <div className="admin-investor-panel-head admin-investor-panel-head--plain">
            <span>Upcoming customer payments</span>
            <Button size="small" className="admin-investor-filter-btn">
              Scheduled ▾
            </Button>
          </div>
          <Table
            {...ADMIN_DATA_TABLE_PROPS}
            columns={upcomingCustomerPaymentColumns}
            dataSource={upcomingCustomerPaymentRows}
            loading={customerSchedulesLoading}
            rowKey="key"
          />
        </Card>
      </div>
    ),
    [
      customerPaymentSearch,
      customerPaymentsListColumns,
      customerPaymentsListRows,
      customerPaymentsListLoading,
      upcomingCustomerPaymentColumns,
      upcomingCustomerPaymentRows,
      customerSchedulesLoading,
    ]
  );

  const ticketsTabPanel = useMemo(() => {
    const raw = supportTicketsList?.results || [];
    const mapped = raw.map((t) => {
      const idStr = String(t.id);
      const tag = t.subject_tag ? String(t.subject_tag).toUpperCase() : "—";
      return {
        key: idStr,
        id: t.id,
        idStr,
        subjectTag: tag,
        subjectTagDisplay: `[${tag}]`,
        subject: t.subject,
        investor: t.investor_name,
        ref: t.investor_ref,
        investorEmail: t.investor_email,
        status: t.status,
        priority: t.priority,
        created: t.created_at_display || t.created_at,
        updated: t.updated_at_display || t.updated_at,
        responded: Boolean(t.responded),
        staffNoteCount: t.staff_note_count ?? 0,
      };
    });

    const rows = mapped.filter((t) => {
      const localNotes = ticketPostResponses[t.idStr]?.length ?? 0;
      const hasResponse = t.responded || t.staffNoteCount > 0 || localNotes > 0;
      if (ticketsTableMode === "responded") return hasResponse;
      if (ticketsTableMode === "open") return !["resolved", "closed"].includes(String(t.status || "").toLowerCase());
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
            </Space>
          </div>

          <Table
            {...ADMIN_DATA_TABLE_PROPS}
            columns={[
              adminColPct(28, { title: "Subject", dataIndex: "subject", key: "subject", ellipsis: true }),
              adminColPct(22, {
                title: "Investor",
                dataIndex: "investor",
                key: "investor",
                ellipsis: true,
                render: (_, r) => (
                  <div className="admin-investor-ticket-investor">
                    <div className="admin-investor-ticket-investor-name">{r.investor}</div>
                    <div className="admin-investor-ticket-investor-ref">{r.ref}</div>
                  </div>
                ),
              }),
              adminColPct(10, {
                title: "Status",
                dataIndex: "status",
                key: "status",
                render: (v) => {
                  const s = String(v || "").toLowerCase();
                  const color = s === "resolved" ? "green" : s === "closed" ? "default" : s === "pending" ? "gold" : "blue";
                  return (
                    <Tag color={color} className="admin-investor-pill">
                      {v}
                    </Tag>
                  );
                },
              }),
              adminColPct(8, { title: "Priority", dataIndex: "priority", key: "priority" }),
              adminColPct(12, {
                title: "Created",
                dataIndex: "created",
                key: "created",
                render: (v) => <span className="admin-table-nowrap">{v}</span>,
                onHeaderCell: () => ({ className: "admin-table-col-gap-r" }),
                onCell: () => ({ className: "admin-table-col-gap-r" }),
              }),
              adminColPct(12, {
                title: "Updated",
                dataIndex: "updated",
                key: "updated",
                render: (v) => <span className="admin-table-nowrap">{v}</span>,
                onHeaderCell: () => ({ className: "admin-table-col-gap-l" }),
                onCell: () => ({ className: "admin-table-col-gap-l" }),
              }),
              adminActionCol(18, {
                title: "Respond",
                key: "respond",
                render: (_, r) => {
                  const localNotes = ticketPostResponses[r.idStr]?.length ?? 0;
                  const has = r.responded || r.staffNoteCount > 0 || localNotes > 0;
                  return (
                    <div className="admin-investor-ticket-respond-cell">
                      {has ? (
                        <Tag color="green" className="admin-investor-pill">
                          Responded
                        </Tag>
                      ) : (
                        <Text type="secondary" className="admin-investor-ticket-respond-hint">
                          Not yet
                        </Text>
                      )}
                      <Button
                        size="small"
                        type="primary"
                        className="admin-investor-action-btn"
                        onClick={() =>
                          openTicketResponse(r.id, {
                            ticketId: `#${r.id}`,
                            subjectTag: r.subjectTagDisplay,
                            subject: r.subject,
                            investor: r.investor,
                            investorRef: r.ref,
                            investorEmail: r.investorEmail,
                          })
                        }
                      >
                        {has ? "Add response" : "Respond"}
                      </Button>
                    </div>
                  );
                },
              }),
            ]}
            dataSource={rows}
            loading={supportTicketsListLoading}
            rowKey="key"
          />

        </Card>
      </div>
    );
  }, [openTicketResponse, supportTicketsList, supportTicketsListLoading, ticketPostResponses, ticketsTableMode]);

  if (!isSuperAdmin)
  {
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
                      {...ADMIN_DATA_TABLE_PROPS}
                      className="admin-investor-data-table admin-investor-data-table--compact"
                      columns={customerRepaymentColumns}
                      dataSource={overviewCustomerRepaymentRows}
                      loading={customerPaymentsListLoading}
                      rowKey="key"
                    />
                    <Text type="secondary" className="admin-investor-footnote">
                      Recent customer payments. See Payments for search and recording.
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
                            Total generation (MWh) ▾
                          </Button>
                        </Space>
                      </div>
                    }
                  >
                    <Table
                      {...ADMIN_DATA_TABLE_PROPS}
                      className="admin-investor-data-table admin-investor-data-table--compact"
                      columns={perfColumns}
                      dataSource={overviewPerfRows}
                      loading={projectsPerformanceLoading}
                      rowKey="key"
                    />
                    <Text type="secondary" className="admin-investor-footnote">
                      Same Top/Bottom toggle as the Projects tab.
                    </Text>
                  </Card>

                  <Card bordered={false} className="admin-investor-panel admin-investor-wide">
                    <div className="admin-investor-panel-head admin-investor-panel-head--plain">
                      <span>Finance overview — by investor</span>
                    </div>
                    <Table
                      {...ADMIN_DATA_TABLE_PROPS}
                      className="admin-investor-data-table admin-investor-data-table--compact"
                      columns={financeByInvestorColumns}
                      dataSource={overviewFinanceByInvestorRows}
                      loading={financeByInvestorLoading}
                      rowKey="key"
                    />
                    <Text type="secondary" className="admin-investor-footnote">
                      Investors ranked by deployed capital.
                    </Text>
                  </Card>
                </div>
              ),
            },
            {
              key: "investors",
              label: "Investors",
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
                      {...ADMIN_DATA_TABLE_PROPS}
                      className="admin-investor-data-table admin-investor-data-table--compact"
                      columns={investorsColumns}
                      dataSource={investorsTableRows}
                      loading={listLoading}
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
                      {...ADMIN_DATA_TABLE_PROPS}
                      className="admin-investor-data-table admin-investor-data-table--compact"
                      columns={financeByInvestorColumns}
                      loading={financeByInvestorLoading}
                      dataSource={overviewFinanceByInvestorRows}
                      rowKey="key"
                    />
                    <Text type="secondary" className="admin-investor-footnote">
                      Same finance columns as Overview; project-level detail stays in the Investments tab.
                    </Text>
                  </Card>
                </div>
              ),
            },
            {
              key: "investments",
              label: "Investments",
              children: (
                <div className="admin-investor-stack">
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
                      {...ADMIN_DATA_TABLE_PROPS}
                      className="admin-investor-data-table admin-investor-data-table--compact"
                      columns={investmentsListColumns}
                      dataSource={investmentsListRows}
                      loading={investmentsListLoading}
                      rowKey="key"
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
          {activeTicketMeta?.ticketId || activeTicketId || "—"} {activeTicketMeta?.subjectTag ? `· ${activeTicketMeta.subjectTag}` : ""}{" "}
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
          <Text className="admin-investor-payment-head-title">Customer repayment</Text>
          <Space size={10}>
            <Text type="secondary">{activePaymentMeta?.ref}</Text>
            <Text type="secondary">·</Text>
            <Text type="secondary">{activePaymentMeta?.cadence}</Text>
          </Space>
        </div>
        <Table
          {...ADMIN_DATA_TABLE_PROPS}
          rowKey="key"
          loading={customerSchedulesLoading && activePaymentMeta?.type === "customer"}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          dataSource={customerScheduleModalRows}
          columns={[
            { title: "#", dataIndex: "idx", width: 60 },
            { title: "Due date", dataIndex: "due", width: 140 },
            { title: "Due amount", dataIndex: "dueAmount", width: 140 },
            { title: "Paid", dataIndex: "paid", width: 140 },
            { title: "Remaining", dataIndex: "left", width: 120 },
            {
              title: "Status",
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
          Set up the investor profile and portal login credentials.
        </Text>
        <Form
          form={investorForm}
          layout="vertical"
          className="admin-modal-form"
          initialValues={{
            country: "NG",
            kycTier: "pending",
            kycStatus: "pending",
            active: "Yes",
            isWalletInvestor: false,
          }}
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

            <Form.Item
              name="isWalletInvestor"
              label="Wallet investor"
              valuePropName="checked"
              className="admin-modal-wide"
            >
              <Switch />
            </Form.Item>

            {createWalletInvestor ? (
              <Form.Item
                name="totalDeposited"
                label="Total deposited (₦)"
                extra="Optional initial wallet deposit"
                className="admin-modal-wide"
              >
                <InputNumber min={0} style={{ width: "100%" }} placeholder="e.g. 500000000" />
              </Form.Item>
            ) : null}
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
          <Button key="edit" onClick={openInvestorEdit} disabled={!investorUserDetail}>
            Edit
          </Button>,
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

      <Modal
        open={investorEditOpen}
        onCancel={closeInvestorEdit}
        title="Update investor"
        width={820}
        className="admin-investor-modal"
        destroyOnClose
        footer={[
          <Button key="cancel" onClick={closeInvestorEdit}>
            Cancel
          </Button>,
          <Button key="save" type="primary" loading={detailLoading} onClick={submitInvestorEdit}>
            Save
          </Button>,
        ]}
      >
        <Text type="secondary" className="admin-modal-subtitle">
          Update profile, KYC, and account settings for this investor.
        </Text>
        <Form form={investorEditForm} layout="vertical" className="admin-modal-form">
          <div className="admin-modal-grid">
            <Form.Item name="legal_name" label="Legal name" rules={[{ required: true, message: "Required" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Phone">
              <Input placeholder="+234…" />
            </Form.Item>

            <Form.Item name="kyc_tier" label="KYC tier" rules={[{ required: true, message: "Required" }]}>
              <Select options={KYC_TIER_OPTIONS} />
            </Form.Item>
            <Form.Item name="kyc_status" label="KYC status" rules={[{ required: true, message: "Required" }]}>
              <Select options={KYC_STATUS_OPTIONS} />
            </Form.Item>

            <Form.Item name="is_active" label="Investor active" rules={[{ required: true, message: "Required" }]}>
              <Select options={[{ value: true, label: "Yes" }, { value: false, label: "No" }]} />
            </Form.Item>
            <Form.Item name="user_is_active" label="User active" rules={[{ required: true, message: "Required" }]}>
              <Select options={[{ value: true, label: "Yes" }, { value: false, label: "No" }]} />
            </Form.Item>

            <Form.Item name="user_email" label="User email" className="admin-modal-wide" rules={[{ required: true, message: "Required" }]}>
              <Input placeholder="investor@example.com" />
            </Form.Item>

            <Form.Item name="user_first_name" label="First name">
              <Input />
            </Form.Item>
            <Form.Item name="user_last_name" label="Last name">
              <Input />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Create project */}
      <Modal
        open={activeModal === MODAL.CREATE_PROJECT}
        onCancel={closeModal}
        title="Create project"
        width={680}
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
        <Form
          form={projectForm}
          layout="vertical"
          className="admin-modal-form"
          requiredMark={(label, { required }) =>
            required ? (
              <>
                {label}
                <span className="admin-modal-required-mark">*</span>
              </>
            ) : (
              label
            )
          }
          initialValues={{
            projectType: "solar",
            systemCapacityKwp: undefined,
            totalProjectCost: undefined,
            cost_items: [{ category: "materials", label: "", amount: undefined, notes: "" }],
          }}
        >
          <div className="admin-modal-section-heading-row admin-modal-section-heading-row--first">
            <span className="admin-modal-section-heading">Basics</span>
          </div>
          <div className="admin-modal-grid">
            <Form.Item name="projectName" label="Project name" rules={[{ required: true, message: "Required" }]}>
              <Input placeholder="e.g. Access Ayobo 2" />
            </Form.Item>
            <Form.Item
              name="branchId"
              label={
                <>
                  Branch
                  <span className="admin-modal-label-hint">(optional ID)</span>
                </>
              }
            >
              <Input placeholder="Nullable — link later" />
            </Form.Item>

            <Form.Item name="projectType" label="Project type">
              <Select options={PROJECT_TYPE_OPTIONS} />
            </Form.Item>
            <Form.Item name="systemCapacityKwp" label="System capacity (kWp)">
              <InputNumber min={0} step={0.0001} style={{ width: "100%" }} placeholder="0.0000" />
            </Form.Item>
          </div>

          <div className="admin-modal-section-heading-row">
            <span className="admin-modal-section-heading">Cost</span>
          </div>
          <div className="admin-modal-grid">
            <Form.Item
              name="totalProjectCost"
              label="Total project cost (₦)"
              className="admin-modal-wide"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="e.g. 50,000,000"
                formatter={(value) =>
                  value === undefined || value === null || value === "" ? "" : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => (value ? value.replace(/,/g, "") : "")}
              />
            </Form.Item>
            <Form.Item name="description" label="Description" className="admin-modal-wide">
              <Input.TextArea rows={3} placeholder="Optional" />
            </Form.Item>
          </div>

          <div className="admin-modal-section-heading-row">
            <span className="admin-modal-section-heading">Cost breakdown</span>
            {showProjectCostBreakdown && (
              <Button type="link" className="admin-modal-link-action" onClick={hideProjectCostBreakdown}>
                Remove section
              </Button>
            )}
          </div>

          {!showProjectCostBreakdown ? (
            <Button type="dashed" block icon={<PlusOutlined />} onClick={openProjectCostBreakdown}>
              Add cost breakdown (optional)
            </Button>
          ) : (
            <Form.List name="cost_items">
              {(fields, { add, remove }) => (
                <div className="admin-modal-cost-items">
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="admin-modal-cost-item-row">
                      <div className="admin-modal-cost-item-fields">
                        <Form.Item
                          {...restField}
                          name={[name, "category"]}
                          className="admin-modal-cost-item-category"
                        >
                          <Select
                            placeholder="Category"
                            options={[
                              { value: "materials", label: "Materials" },
                              { value: "labor", label: "Labor" },
                              { value: "logistics", label: "Logistics" },
                              { value: "services", label: "Services" },
                              { value: "other", label: "Other" },
                            ]}
                          />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, "label"]} className="admin-modal-cost-item-label">
                          <Input placeholder="e.g. PV modules" />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, "amount"]} className="admin-modal-cost-item-amount">
                          <InputNumber min={0} style={{ width: "100%" }} placeholder="Amount ₦" />
                        </Form.Item>
                        {fields.length > 1 && (
                          <MinusCircleOutlined
                            className="admin-modal-cost-item-remove"
                            onClick={() => remove(name)}
                          />
                        )}
                      </div>
                      <Form.Item {...restField} name={[name, "notes"]}>
                        <Input placeholder="Notes (optional)" />
                      </Form.Item>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    block
                    className="admin-modal-add-item-btn"
                    onClick={() => add({ category: "materials", label: "", amount: undefined, notes: "" })}
                  >
                    + Add cost item
                  </Button>
                </div>
              )}
            </Form.List>
          )}
        </Form>
      </Modal>

      <Modal
        open={projectDetailOpen}
        onCancel={closeProjectDetail}
        title="Project details"
        width={800}
        className="admin-investor-modal"
        footer={[
          <Button
            key="edit"
            onClick={openProjectEdit}
            disabled={!projectDetail || projectDetailLoading}
          >
            Edit project and payment
          </Button>,
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
              {...ADMIN_DATA_TABLE_PROPS}
              rowKey="id"
              pagination={false}
              dataSource={Array.isArray(projectDetail.investments) ? projectDetail.investments : []}
              columns={[
                { title: "Investor", dataIndex: "investor_name", ellipsis: true, ...adminTableFlexCol },
                { title: "Capital", dataIndex: "capital_amount", width: 96, align: "right", render: (v) => ngnCompact(Number(v)) },
                { title: "Share %", dataIndex: "share_percent", width: 80 },
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

      <Modal
        open={projectEditOpen}
        onCancel={closeProjectEdit}
        title="Update project and payment"
        width={960}
        className="admin-investor-modal"
        destroyOnClose
        footer={[
          <Button key="cancel" onClick={closeProjectEdit} disabled={projectUpdateLoading}>
            Cancel
          </Button>,
          <Button key="save" type="primary" loading={projectUpdateLoading} onClick={submitProjectEdit}>
            Save
          </Button>,
        ]}
      >
        <Text type="secondary" className="admin-modal-subtitle">
          Edit project details, customer repayment plan, and payment schedules.
        </Text>
        {!projectDetail?.customer_repayment_plan?.id ? (
          <Text type="warning" className="admin-modal-section-sub">
            No customer repayment plan on this project yet — saving will update project details only.
          </Text>
        ) : null}
        <Form form={projectEditForm} layout="vertical" className="admin-modal-form">
          <div className="admin-modal-section-title">Project</div>
          <div className="admin-modal-grid">
            <Form.Item name="projectName" label="Project name" rules={[{ required: true, message: "Required" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="branchId" label="Branch ID">
              <Input placeholder="Numeric or empty" />
            </Form.Item>
            <Form.Item name="projectType" label="Project type" rules={[{ required: true, message: "Required" }]}>
              <Select options={PROJECT_TYPE_OPTIONS} />
            </Form.Item>
            <Form.Item name="status" label="Status" rules={[{ required: true, message: "Required" }]}>
              <Select options={PROJECT_STATUS_OPTIONS} />
            </Form.Item>
            <Form.Item name="locationLabel" label="Location label">
              <Input />
            </Form.Item>
            <Form.Item name="systemCapacityKwp" label="System capacity (kWp)">
              <InputNumber min={0} step={0.0001} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="totalProjectCost" label="Total project cost (₦)" rules={[{ required: true, message: "Required" }]}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="clientContribution" label="Client contribution (₦)">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="installationDate" label="Installation date" rules={[{ required: true, message: "Required" }]}>
              <AdminDatePicker disablePast style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="dd/mm/yyyy" />
            </Form.Item>
            <Form.Item name="projectDurationMonths" label="Project duration (months)" rules={[{ required: true, message: "Required" }]}>
              <InputNumber min={1} step={1} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="is_active" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="description" label="Description" className="admin-modal-wide">
              <Input.TextArea rows={3} />
            </Form.Item>
          </div>

          {projectDetail?.customer_repayment_plan?.id ? (
            <>
              <Divider className="admin-modal-divider" />
              <div className="admin-modal-section-title">Customer repayment plan</div>
              <div className="admin-modal-grid">
                <Form.Item name="crPlanType" label="Plan type" rules={[{ required: true, message: "Required" }]}>
                  <Select options={REPAYMENT_PLAN_TYPE_OPTIONS} />
                </Form.Item>
                <Form.Item name="crFirstDueDate" label="First due date" rules={[{ required: true, message: "Required" }]}>
                  <AdminDatePicker disablePast style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="dd/mm/yyyy" />
                </Form.Item>
                <Form.Item name="crPrincipalAmount" label="Principal amount (₦)" rules={[{ required: true, message: "Required" }]}>
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name="crInterestRatePa" label="Interest rate % p.a." rules={[{ required: true, message: "Required" }]}>
                  <InputNumber min={0} max={100} step={0.0001} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name="crGracePeriodDays" label="Grace period (days)">
                  <InputNumber min={0} step={1} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name="crNotes" label="Plan notes" className="admin-modal-wide">
                  <Input placeholder="Optional" />
                </Form.Item>
              </div>

              <Divider className="admin-modal-divider" />
              <div className="admin-modal-section-title">Customer payment schedules</div>
              <Table
                className="admin-investor-data-table admin-investor-modal-schedule-table"
                tableLayout="fixed"
                size="small"
                pagination={false}
                scroll={{ x: 900 }}
                rowKey={(row, i) => String(row.id ?? i)}
                dataSource={projectCustomerSchedules}
                columns={[
                  { title: "#", dataIndex: "installment_number", width: 48 },
                  {
                    title: "Due date",
                    dataIndex: "due_date",
                    width: 150,
                    render: (v, row, index) => (
                      <AdminDatePicker
                        disablePast
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        value={v ? dayjs(v) : null}
                        onChange={(d) => {
                          setProjectCustomerSchedules((prev) => {
                            const next = [...prev];
                            next[index] = { ...next[index], due_date: d };
                            return next;
                          });
                        }}
                      />
                    ),
                  },
                  {
                    title: "Amount due",
                    dataIndex: "amount_due",
                    width: 130,
                    render: (v, row, index) => (
                      <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        value={v != null ? Number(v) : undefined}
                        onChange={(n) => {
                          setProjectCustomerSchedules((prev) => {
                            const next = [...prev];
                            next[index] = { ...next[index], amount_due: n };
                            return next;
                          });
                        }}
                      />
                    ),
                  },
                  {
                    title: "Amount paid",
                    dataIndex: "amount_paid",
                    width: 130,
                    render: (v, row, index) => (
                      <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        value={v != null ? Number(v) : undefined}
                        onChange={(n) => {
                          setProjectCustomerSchedules((prev) => {
                            const next = [...prev];
                            next[index] = { ...next[index], amount_paid: n };
                            return next;
                          });
                        }}
                      />
                    ),
                  },
                  {
                    title: "Paid date",
                    dataIndex: "paid_date",
                    width: 150,
                    render: (v, row, index) => (
                      <AdminDatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        allowClear
                        value={v ? dayjs(v) : null}
                        onChange={(d) => {
                          setProjectCustomerSchedules((prev) => {
                            const next = [...prev];
                            next[index] = { ...next[index], paid_date: d };
                            return next;
                          });
                        }}
                      />
                    ),
                  },
                  {
                    title: "Status",
                    dataIndex: "status",
                    width: 120,
                    render: (v, row, index) => (
                      <Select
                        style={{ width: "100%" }}
                        value={v || "scheduled"}
                        options={SCHEDULE_LINE_STATUS_OPTIONS}
                        onChange={(s) => {
                          setProjectCustomerSchedules((prev) => {
                            const next = [...prev];
                            next[index] = { ...next[index], status: s };
                            return next;
                          });
                        }}
                      />
                    ),
                  },
                ]}
              />
            </>
          ) : null}
        </Form>
      </Modal>

      {/* Create investment */}
      <Modal
        open={activeModal === MODAL.CREATE_INVESTMENT}
        onCancel={closeModal}
        title="Create investment"
        width={680}
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
        <Form
          form={investmentForm}
          layout="vertical"
          className="admin-modal-form"
          requiredMark={(label, { required }) =>
            required ? (
              <>
                {label}
                <span className="admin-modal-required-mark">*</span>
              </>
            ) : (
              label
            )
          }
          initialValues={{
            status: "active",
            planType: "monthly",
            interestBasis: "annual",
          }}
        >
          <div className="admin-modal-section-heading-row admin-modal-section-heading-row--first">
            <span className="admin-modal-section-heading">Link</span>
          </div>
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
          </div>

          <div
            className="admin-modal-section-heading-row admin-modal-section-heading-row--collapsible"
            onClick={() => setShowInvestmentContractDetails((v) => !v)}
          >
            <span className="admin-modal-section-heading">Project &amp; contract details</span>
            <DownOutlined
              className={`admin-modal-section-chevron${showInvestmentContractDetails ? "" : " admin-modal-section-chevron--collapsed"}`}
            />
          </div>
          {showInvestmentContractDetails && (
            <div className="admin-modal-grid">
              <Form.Item
                name="expectedCommissionDate"
                label="Expected commission date"
                rules={[{ required: true, message: "Required" }]}
              >
                <AdminDatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="dd/mm/yyyy" />
              </Form.Item>
              <Form.Item name="projectDurationMonths" label="Project duration (months)">
                <InputNumber min={1} step={1} style={{ width: "100%" }} placeholder="e.g. 36" />
              </Form.Item>

              <Form.Item name="clientContribution" label="Client contribution (₦)">
                <InputNumber min={0} style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
              <Form.Item name="status" label="Status">
                <Select options={INVESTMENT_STATUS_OPTIONS} />
              </Form.Item>

              <Form.Item className="admin-modal-wide" label="Capital amount (₦)">
                <InputNumber
                  disabled
                  value={createInvestmentCapitalAmount ?? undefined}
                  style={{ width: "100%" }}
                  placeholder="Auto-filled from the selected project"
                />
              </Form.Item>
            </div>
          )}

          <div
            className="admin-modal-section-heading-row admin-modal-section-heading-row--collapsible"
            onClick={() => setShowInvestmentRepaymentPlan((v) => !v)}
          >
            <span className="admin-modal-section-heading">Repayment plan</span>
            <DownOutlined
              className={`admin-modal-section-chevron${showInvestmentRepaymentPlan ? "" : " admin-modal-section-chevron--collapsed"}`}
            />
          </div>
          {showInvestmentRepaymentPlan && (
            <div className="admin-modal-grid">
              <Form.Item
                name="planType"
                label="Plan type"
                className="admin-modal-wide"
                rules={[{ required: true, message: "Required" }]}
              >
                <Select options={REPAYMENT_PLAN_TYPE_OPTIONS} />
              </Form.Item>

              <Form.Item
                name="interestRate"
                label="Interest rate (%)"
                rules={[{ required: true, message: "Required" }]}
              >
                <InputNumber min={0} max={100} step={0.0001} style={{ width: "100%" }} placeholder="e.g. 10" />
              </Form.Item>
              <Form.Item name="interestBasis" label="Interest basis">
                <Select options={REPAYMENT_INTEREST_BASIS_OPTIONS} />
              </Form.Item>
            </div>
          )}
        </Form>
      </Modal>

      <Modal
        open={investmentDetailOpen}
        onCancel={closeInvestmentDetail}
        title="Investment details"
        width={720}
        className="admin-investor-modal"
        footer={[
          <Button
            key="edit"
            onClick={openInvestmentEdit}
            disabled={!investmentDetail || investmentDetailLoading}
          >
            Edit investment and repayment
          </Button>,
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

      <Modal
        open={investmentEditOpen}
        onCancel={closeInvestmentEdit}
        title="Update investment and repayment"
        width={960}
        className="admin-investor-modal"
        destroyOnClose
        footer={[
          <Button key="cancel" onClick={closeInvestmentEdit} disabled={investmentUpdateLoading}>
            Cancel
          </Button>,
          <Button key="save" type="primary" loading={investmentUpdateLoading} onClick={submitInvestmentEdit}>
            Save
          </Button>,
        ]}
      >
        <Text type="secondary" className="admin-modal-subtitle">
          Edit investment terms, repayment plan, and scheduled payouts.
        </Text>
        {investmentDetail ? (
          <div className="admin-modal-section-sub" style={{ marginBottom: 12 }}>
            <Text type="secondary">
              Investor {investmentDetail.investor_name} · Project {investmentDetail.project_name}
            </Text>
          </div>
        ) : null}
        {!investmentDetail?.repayment_plan?.id ? (
          <Text type="warning" className="admin-modal-section-sub">
            No repayment plan on this investment yet — saving will update investment details only.
          </Text>
        ) : null}
        <Form form={investmentEditForm} layout="vertical" className="admin-modal-form">
          <div className="admin-modal-section-title">Investment</div>
          <div className="admin-modal-grid">
            <Form.Item name="capitalAmount" label="Capital amount (₦)" rules={[{ required: true, message: "Required" }]}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="sharePercent" label="Share %" rules={[{ required: true, message: "Required" }]}>
              <InputNumber min={0} max={100} step={0.0001} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="contractStart" label="Contract start" rules={[{ required: true, message: "Required" }]}>
              <AdminDatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="dd/mm/yyyy" />
            </Form.Item>
            <Form.Item name="contractEnd" label="Contract end (optional)">
              <AdminDatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="dd/mm/yyyy" allowClear />
            </Form.Item>
            <Form.Item name="invStatus" label="Status" rules={[{ required: true, message: "Required" }]}>
              <Select options={INVESTMENT_STATUS_OPTIONS} />
            </Form.Item>
            <Form.Item name="invNotes" label="Notes" className="admin-modal-wide">
              <Input.TextArea rows={3} />
            </Form.Item>
          </div>

          {investmentDetail?.repayment_plan?.id ? (
            <>
              <Divider className="admin-modal-divider" />
              <div className="admin-modal-section-title">Investor repayment plan</div>
              <div className="admin-modal-grid">
                <Form.Item name="planType" label="Plan type" rules={[{ required: true, message: "Required" }]}>
                  <Select options={REPAYMENT_PLAN_TYPE_OPTIONS} />
                </Form.Item>
                <Form.Item name="firstDueDate" label="First due date" rules={[{ required: true, message: "Required" }]}>
                  <AdminDatePicker disablePast style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="dd/mm/yyyy" />
                </Form.Item>
                <Form.Item name="interestPercent" label="Interest percent" rules={[{ required: true, message: "Required" }]}>
                  <InputNumber min={0} max={100} step={0.0001} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name="interestBasis" label="Interest basis">
                  <Select options={REPAYMENT_INTEREST_BASIS_OPTIONS} />
                </Form.Item>
                <Form.Item name="totalRepayable" label="Total repayable (₦)" rules={[{ required: true, message: "Required" }]}>
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </div>

              <Divider className="admin-modal-divider" />
              <div className="admin-modal-section-title">Investor payment schedules</div>
              <Table
                className="admin-investor-data-table admin-investor-modal-schedule-table"
                tableLayout="fixed"
                size="small"
                pagination={false}
                scroll={{ x: 1020 }}
                rowKey={(row, i) => String(row.id ?? i)}
                dataSource={investmentPaymentSchedules}
                columns={[
                  { title: "#", dataIndex: "installment_number", width: 44 },
                  {
                    title: "Due date",
                    dataIndex: "due_date",
                    width: 150,
                    render: (v, row, index) => (
                      <AdminDatePicker
                        disablePast
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        value={v ? dayjs(v) : null}
                        onChange={(d) => {
                          setInvestmentPaymentSchedules((prev) => {
                            const next = [...prev];
                            next[index] = { ...next[index], due_date: d };
                            return next;
                          });
                        }}
                      />
                    ),
                  },
                  {
                    title: "Due total",
                    dataIndex: "amount_due_total",
                    width: 120,
                    render: (v, row, index) => (
                      <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        value={v != null ? Number(v) : undefined}
                        onChange={(n) => {
                          setInvestmentPaymentSchedules((prev) => {
                            const next = [...prev];
                            next[index] = { ...next[index], amount_due_total: n };
                            return next;
                          });
                        }}
                      />
                    ),
                  },
                  {
                    title: "Investor share",
                    dataIndex: "amount_due_investor_share",
                    width: 120,
                    render: (v, row, index) => (
                      <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        value={v != null ? Number(v) : undefined}
                        onChange={(n) => {
                          setInvestmentPaymentSchedules((prev) => {
                            const next = [...prev];
                            next[index] = { ...next[index], amount_due_investor_share: n };
                            return next;
                          });
                        }}
                      />
                    ),
                  },
                  {
                    title: "Amount paid",
                    dataIndex: "amount_paid",
                    width: 120,
                    render: (v, row, index) => (
                      <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        value={v != null ? Number(v) : undefined}
                        onChange={(n) => {
                          setInvestmentPaymentSchedules((prev) => {
                            const next = [...prev];
                            next[index] = { ...next[index], amount_paid: n };
                            return next;
                          });
                        }}
                      />
                    ),
                  },
                  {
                    title: "Paid date",
                    dataIndex: "paid_date",
                    width: 150,
                    render: (v, row, index) => (
                      <AdminDatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        allowClear
                        value={v ? dayjs(v) : null}
                        onChange={(d) => {
                          setInvestmentPaymentSchedules((prev) => {
                            const next = [...prev];
                            next[index] = { ...next[index], paid_date: d };
                            return next;
                          });
                        }}
                      />
                    ),
                  },
                  {
                    title: "Status",
                    dataIndex: "status",
                    width: 120,
                    render: (v, row, index) => (
                      <Select
                        style={{ width: "100%" }}
                        value={v || "scheduled"}
                        options={SCHEDULE_LINE_STATUS_OPTIONS}
                        onChange={(s) => {
                          setInvestmentPaymentSchedules((prev) => {
                            const next = [...prev];
                            next[index] = { ...next[index], status: s };
                            return next;
                          });
                        }}
                      />
                    ),
                  },
                ]}
              />
            </>
          ) : null}
        </Form>
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
          Add one or more schedule lines with amount and payment date.
        </Text>
        <Form
          form={recordPaymentForm}
          layout="vertical"
          className="admin-modal-form"
          initialValues={{
            payment_method: "Transfer",
            customer_schedule_ids: [],
            line_items: [{ customer_schedule_id: undefined, amount_received: undefined, payment_date: undefined }],
          }}
        >
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

          <Divider className="admin-modal-divider" />
          <Text type="secondary" className="admin-modal-section-sub">
            Each line needs a schedule ID, amount, and payment date. Reference and notes apply to all rows.
          </Text>

          <Form.Item
            name="customer_schedule_ids"
            label="Payment schedules (select one or more)"
            extra="Optional: select schedules to auto-create line items below. Filtered by the selected project."
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder={customerScheduleSelectOptions.length ? "Select schedules" : "No schedules loaded yet"}
              options={customerScheduleSelectOptions}
              onChange={(ids) => {
                const uniq = Array.from(new Set((ids || []).map((v) => Number(v)).filter((n) => Number.isFinite(n))));
                recordPaymentForm.setFieldsValue({
                  line_items: uniq.length
                    ? uniq.map((id) => ({ customer_schedule_id: id, amount_received: undefined, payment_date: undefined }))
                    : [{ customer_schedule_id: undefined, amount_received: undefined, payment_date: undefined }],
                });
              }}
            />
          </Form.Item>

          <Form.List name="line_items">
            {(fields, { add, remove }) => (
              <div className="admin-payment-line-items">
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="admin-payment-line-item-row">
                    <Form.Item {...restField} name={[name, "customer_schedule_id"]}>
                      {customerScheduleSelectOptions.length ? (
                        <Select
                          disabled={Boolean((recordPaymentForm.getFieldValue("customer_schedule_ids") || []).length)}
                          allowClear
                          showSearch
                          optionFilterProp="label"
                          placeholder="Schedule"
                          options={customerScheduleSelectOptions}
                        />
                      ) : (
                        <InputNumber min={1} step={1} placeholder="Schedule ID" />
                      )}
                    </Form.Item>
                    <Form.Item {...restField} name={[name, "amount_received"]}>
                      <InputNumber min={0} placeholder="Amount ₦" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, "payment_date"]}>
                      <AdminDatePicker format="DD/MM/YYYY" placeholder="Date" />
                    </Form.Item>
                    {fields.length > 1 ? (
                      <MinusCircleOutlined
                        className="admin-payment-line-item-remove"
                        onClick={() => remove(name)}
                      />
                    ) : (
                      <span className="admin-payment-line-item-remove-spacer" aria-hidden />
                    )}
                  </div>
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
        open={customerPaymentDetailOpen}
        onCancel={closeCustomerPaymentDetail}
        title="Customer payment details"
        width={640}
        className="admin-investor-modal"
        footer={
          customerPaymentEditing
            ? [
              <Button
                key="cancel"
                onClick={() => {
                  setCustomerPaymentEditing(false);
                  customerPaymentEditForm.resetFields();
                }}
              >
                Cancel edit
              </Button>,
              <Button key="save" type="primary" loading={customerPaymentUpdateLoading} onClick={submitCustomerPaymentEdit}>
                Save changes
              </Button>,
            ]
            : [
              <Button
                key="edit"
                onClick={() => {
                  if (!customerPaymentDetail) return;
                  setCustomerPaymentEditing(true);
                  customerPaymentEditForm.setFieldsValue({
                    amount_received: Number(customerPaymentDetail.amount_received),
                    payment_date: customerPaymentDetail.payment_date ? dayjs(customerPaymentDetail.payment_date) : null,
                    payment_method: customerPaymentDetail.payment_method,
                    reference: customerPaymentDetail.reference,
                    notes: customerPaymentDetail.notes,
                  });
                }}
              >
                Edit
              </Button>,
              <Button key="close" type="primary" onClick={closeCustomerPaymentDetail}>
                Close
              </Button>,
            ]
        }
        destroyOnClose
      >
        {customerPaymentDetailLoading ? (
          <Text type="secondary">Loading…</Text>
        ) : customerPaymentDetail ? (
          <>
            {!customerPaymentEditing ? (
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
                <Descriptions.Item label="Installment progress">
                  {customerPaymentDetail.payment_score?.label ?? "—"}
                  {customerPaymentDetail.payment_score?.percent != null
                    ? ` (${customerPaymentDetail.payment_score.percent}%)`
                    : ""}
                  {customerPaymentDetail.payment_score?.paid_installments != null &&
                    customerPaymentDetail.payment_score?.total_installments != null
                    ? ` — ${customerPaymentDetail.payment_score.paid_installments}/${customerPaymentDetail.payment_score.total_installments} paid`
                    : ""}
                </Descriptions.Item>
                <Descriptions.Item label="Line status">{customerPaymentDetail.line_status ?? "—"}</Descriptions.Item>
              </Descriptions>
            ) : (
              <Form form={customerPaymentEditForm} layout="vertical" className="admin-modal-form">
                <div className="admin-modal-grid">
                  <Form.Item name="amount_received" label="Amount received (₦)" rules={[{ required: true, message: "Required" }]}>
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item name="payment_date" label="Payment date" rules={[{ required: true, message: "Required" }]}>
                    <AdminDatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                  </Form.Item>
                  <Form.Item name="payment_method" label="Payment method" rules={[{ required: true, message: "Required" }]}>
                    <Select options={CUSTOMER_PAYMENT_METHOD_OPTIONS} />
                  </Form.Item>
                  <Form.Item name="reference" label="Reference" rules={[{ required: true, message: "Required" }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item name="notes" label="Notes" className="admin-modal-wide">
                    <Input.TextArea rows={2} />
                  </Form.Item>
                </div>
              </Form>
            )}
          </>
        ) : (
          <Text type="secondary">No data.</Text>
        )}
      </Modal>

    </div>
  );
}

export default InvestorAdministration;

