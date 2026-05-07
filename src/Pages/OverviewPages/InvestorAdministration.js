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
  updateAdminInvestorUser,
} from "../../redux/actions/adminInvestorUser/adminInvestorUser.action";
import {
  createAdminInvestorProject,
  deleteAdminInvestorProject,
  fetchAdminInvestorProjectDetail,
  fetchAdminInvestorProjectsList,
  clearInvestorProjectDetail,
  fetchAdminInvestorProjectsPerformance,
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
  fetchAdminCustomerPaymentSchedules,
  updateAdminCustomerPayment,
  clearCustomerPaymentDetail,
} from "../../redux/actions/adminCustomerPayment/adminCustomerPayment.action";
import {
  createAdminInvestorPayout,
  deleteAdminInvestorPayout,
  fetchAdminInvestorPayoutDetail,
  fetchAdminInvestorPayoutsList,
  fetchAdminInvestorPaymentSchedulesList,
  updateAdminInvestorPayout,
  clearInvestorPayoutDetail,
  fetchInvestorPaymentSchedules,
} from "../../redux/actions/adminInvestorPayout/adminInvestorPayout.action";
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
  POST_PAYOUT: "postPayout",
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
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "Cash", label: "Cash" },
  { value: "POS", label: "POS" },
];

const ngn = (n) => `₦${Number(n).toLocaleString("en-NG")}`;
/** Overview tab: show this many rows per highlight table (full lists live on Payments / Projects / Investors). */
const OVERVIEW_HIGHLIGHT_LIMIT = 5;
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
  const financeByInvestorList = useSelector((s) => s.adminInvestorDirectoryPage?.financeByInvestor);
  const financeByInvestorLoading = useSelector((s) => s.adminInvestorDirectoryPage?.financeByInvestorLoading);

  const adminProjectsList = useSelector((s) => s.adminInvestorProjectsPage?.list);
  const projectsListLoading = useSelector((s) => s.adminInvestorProjectsPage?.listLoading);
  const projectCreateLoading = useSelector((s) => s.adminInvestorProjectsPage?.createLoading);
  const projectDetail = useSelector((s) => s.adminInvestorProjectsPage?.detail);
  const projectDetailLoading = useSelector((s) => s.adminInvestorProjectsPage?.detailLoading);
  const projectDeleteLoading = useSelector((s) => s.adminInvestorProjectsPage?.deleteLoading);
  const projectsPerformance = useSelector((s) => s.adminInvestorProjectsPage?.performance);
  const projectsPerformanceLoading = useSelector((s) => s.adminInvestorProjectsPage?.performanceLoading);

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
  const customerPaymentUpdateLoading = useSelector((s) => s.adminCustomerPaymentsPage?.updateLoading);
  const customerSchedules = useSelector((s) => s.adminCustomerPaymentsPage?.customerSchedules);
  const customerSchedulesLoading = useSelector((s) => s.adminCustomerPaymentsPage?.customerSchedulesLoading);

  const adminInvestorPayoutsList = useSelector((s) => s.adminInvestorPayoutsPage?.list);
  const payoutsListLoading = useSelector((s) => s.adminInvestorPayoutsPage?.listLoading);
  const payoutCreateLoading = useSelector((s) => s.adminInvestorPayoutsPage?.createLoading);
  const payoutDetail = useSelector((s) => s.adminInvestorPayoutsPage?.detail);
  const payoutDetailLoading = useSelector((s) => s.adminInvestorPayoutsPage?.detailLoading);
  const payoutDeleteLoading = useSelector((s) => s.adminInvestorPayoutsPage?.deleteLoading);
  const payoutUpdateLoading = useSelector((s) => s.adminInvestorPayoutsPage?.updateLoading);
  const investorSchedulesList = useSelector((s) => s.adminInvestorPayoutsPage?.investorSchedulesList);
  const investorSchedulesLoading = useSelector((s) => s.adminInvestorPayoutsPage?.investorSchedulesLoading);

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
  /** Staff responses posted this session (API returns each POST result; list refreshes for `responded`). */
  const [ticketPostResponses, setTicketPostResponses] = useState({});
  const [customerRepaymentOpen, setCustomerRepaymentOpen] = useState(false);
  const [investorPaymentOpen, setInvestorPaymentOpen] = useState(false);
  const [activePaymentMeta, setActivePaymentMeta] = useState(null);
  const [investorForm] = Form.useForm();
  const [investorEditForm] = Form.useForm();
  const [projectForm] = Form.useForm();
  const [investmentForm] = Form.useForm();
  const [recordPaymentForm] = Form.useForm();
  const [payoutForm] = Form.useForm();
  const [customerPaymentEditForm] = Form.useForm();
  const [payoutEditForm] = Form.useForm();
  const [customerPaymentEditing, setCustomerPaymentEditing] = useState(false);
  const [payoutEditing, setPayoutEditing] = useState(false);
  const recordPaymentEntryMode = Form.useWatch("entryMode", recordPaymentForm) ?? "single";
  const recordPaymentProjectId = Form.useWatch("project_id", recordPaymentForm);
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

  const refreshPaymentSchedules = useCallback(() => {
    if (!isSuperAdmin) return undefined;
    return Promise.all([
      dispatch(fetchAdminCustomerPaymentSchedules({ page: 1, page_size: 100 })),
      dispatch(fetchAdminInvestorPaymentSchedulesList({ page: 1, page_size: 100 })),
    ]);
  }, [dispatch, isSuperAdmin]);

  useEffect(() => {
    refreshInvestorUsers();
    refreshAdminProjects();
    refreshAdminInvestments();
    refreshCustomerPayments();
    refreshInvestorPayouts();
  }, [refreshInvestorUsers, refreshAdminProjects, refreshAdminInvestments, refreshCustomerPayments, refreshInvestorPayouts]);

  useEffect(() => {
    if (!isSuperAdmin) return undefined;
    let cancelled = false;
    (async () => {
      const results = await refreshPaymentSchedules();
      if (cancelled || !results) return;
      const [r1, r2] = results;
      if (r1 && !r1.fulfilled) message.error(r1.message || "Could not load customer payment schedules");
      if (r2 && !r2.fulfilled) message.error(r2.message || "Could not load investor payment schedules");
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

  const openTicketResponse = useCallback(
    async (ticketId, meta) => {
      const idStr = String(ticketId);
      setActiveTicketId(idStr);
      setActiveTicketMeta(meta || null);
      setTicketResponseDraft("");
      dispatch(clearSupportTicketDetail());
      setTicketResponseOpen(true);
      const res = await dispatch(fetchAdminSupportTicketDetail(ticketId));
      if (!res.fulfilled) {
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
      setTicketResponseOpen(false);
      setTicketResponseDraft("");
    } else {
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
    try {
      await navigator.clipboard.writeText(String(value || ""));
      message.success("Copied");
    } catch {
      message.warning("Could not copy");
    }
  }, []);

  const openCustomerRepayment = useCallback((row) => {
    if (row && typeof row === "object" && row.projectName != null) {
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
    } else {
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

  const openInvestorPayment = useCallback((row) => {
    if (row && typeof row === "object" && row.investmentId != null) {
      setActivePaymentMeta({
        type: "investor",
        title: `${row.projectName || "Project"} — investor repayment`,
        subtitle: [row.projectName, row.investorName ? `Investor: ${row.investorName}` : null].filter(Boolean).join("  •  "),
        ref: row.reference || `Investment #${row.investmentId}`,
        cadence: row.repaymentScoreLabel || null,
        actionLabel: "Post investor payout",
        investmentId: row.investmentId,
      });
    } else {
      setActivePaymentMeta({
        type: "investor",
        title: "Investor repayment schedule",
        subtitle: "Select a payout or upcoming line with an investment",
        ref: "—",
        cadence: null,
        actionLabel: "Post investor payout",
        investmentId: undefined,
      });
    }
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
    try {
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
      if (res.fulfilled) {
        message.success(res.message || "Updated");
        closeInvestorEdit();
        refreshInvestorUsers();
      } else {
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
            void refreshPaymentSchedules();
          } else {
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
      if (!res.fulfilled) {
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
      const selectedScheduleIds = Array.isArray(values.customer_schedule_ids) ? values.customer_schedule_ids : [];
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
          message.error(
            selectedScheduleIds.length
              ? "Fill amount and payment date for the selected schedule lines"
              : "Add at least one line with schedule ID, amount, and payment date"
          );
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
        void refreshPaymentSchedules();
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
            void refreshPaymentSchedules();
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
      setPayoutEditing(false);
      payoutEditForm.resetFields();
      setPayoutDetailOpen(true);
      dispatch(clearInvestorPayoutDetail());
      const res = await dispatch(fetchAdminInvestorPayoutDetail(id));
      if (!res.fulfilled) {
        message.error(res.message || "Failed to load payout");
        setPayoutDetailOpen(false);
      }
    },
    [dispatch, payoutEditForm]
  );

  const closePayoutDetail = () => {
    setPayoutDetailOpen(false);
    setPayoutEditing(false);
    payoutEditForm.resetFields();
    dispatch(clearInvestorPayoutDetail());
  };

  const submitCustomerPaymentEdit = useCallback(async () => {
    if (!customerPaymentDetail?.id) return;
    try {
      const values = await customerPaymentEditForm.validateFields();
      const payload = {
        amount_received: String(Number(values.amount_received)),
        payment_date: dayjs(values.payment_date).format("YYYY-MM-DD"),
        payment_method: values.payment_method,
        reference: values.reference?.trim() || "",
        notes: values.notes?.trim() || "",
      };
      const res = await dispatch(updateAdminCustomerPayment(customerPaymentDetail.id, payload));
      if (res.fulfilled) {
        message.success(res.message || "Updated");
        setCustomerPaymentEditing(false);
        refreshCustomerPayments();
        void refreshPaymentSchedules();
      } else {
        message.error(res.message || "Update failed");
      }
    } catch {
      /* validation */
    }
  }, [customerPaymentDetail, customerPaymentEditForm, dispatch, refreshCustomerPayments, refreshPaymentSchedules]);

  const submitPayoutEdit = useCallback(async () => {
    if (!payoutDetail?.id) return;
    try {
      const values = await payoutEditForm.validateFields();
      const payload = {
        amount_paid: String(Number(values.amount_paid)),
        paid_date: dayjs(values.paid_date).format("YYYY-MM-DD"),
        payment_method: values.payment_method,
        reference: values.reference?.trim() || "",
      };
      const res = await dispatch(updateAdminInvestorPayout(payoutDetail.id, payload));
      if (res.fulfilled) {
        message.success(res.message || "Updated");
        setPayoutEditing(false);
        refreshInvestorPayouts();
        void refreshPaymentSchedules();
      } else {
        message.error(res.message || "Update failed");
      }
    } catch {
      /* validation */
    }
  }, [dispatch, payoutDetail, payoutEditForm, refreshInvestorPayouts, refreshPaymentSchedules]);

  const submitPostPayout = async () => {
    try {
      await payoutForm.validateFields(["investment_id", "payment_method", "reference"]);
      const values = payoutForm.getFieldsValue(true);
      const selectedScheduleIds = Array.isArray(values.schedule_ids) ? values.schedule_ids : [];
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
        message.error(
          selectedScheduleIds.length
            ? "Fill amount and paid date for the selected schedule lines"
            : "Add at least one line with schedule ID, amount paid, and paid date"
        );
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
        void refreshPaymentSchedules();
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

  const metrics = useMemo(() => {
    const dash = () => (overviewLoading ? "…" : "—");
    const ti = overviewTotalInvested;
    const ce = overviewCustomersExpected;
    const ap = overviewActiveProjects;
    const ai = overviewActiveInvestors;
    const np = overviewNearestPayments;

    const totalInvestedVal =
      ti?.total_invested != null && ti.total_invested !== "" ? ngnCompact(Number(ti.total_invested)) : dash();
    const totalRepaidSub =
      ti?.total_repaid_to_investors != null && ti.total_repaid_to_investors !== ""
        ? `Total repaid: ${ngnCompact(Number(ti.total_repaid_to_investors))}`
        : undefined;

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
    const toInv = np?.to_investor;
    const fromCust = np?.from_customer;
    const nearestSub =
      toInv?.amount != null && fromCust?.amount != null
        ? `To investor: ${ngnCompact(Number(toInv.amount))}${
            toInv.relative_label ? ` (${toInv.relative_label})` : ""
          } · From customer: ${ngnCompact(Number(fromCust.amount))}${
            fromCust.relative_label ? ` (${fromCust.relative_label})` : ""
          }`
        : undefined;

    return [
      {
        key: "a",
        icon: <DollarOutlined />,
        label: "Total invested (investors)",
        value: totalInvestedVal,
        sub: totalRepaidSub,
        variant: "purple",
      },
      {
        key: "b",
        icon: <FundOutlined />,
        label: "Customers expected (all-in)",
        value: expectedVal,
        sub: expectedSub,
        variant: "blue",
      },
      {
        key: "c",
        icon: <ProjectOutlined />,
        label: "Active projects",
        value: projectsVal,
        sub: projectsSub,
        variant: "teal",
      },
      {
        key: "d",
        icon: <UserAddOutlined />,
        label: "Active investors",
        value: investorsVal,
        sub: investorsSub,
        variant: "mint",
      },
      {
        key: "e",
        icon: <ThunderboltOutlined />,
        label: "Nearest payments",
        value: nearestHeadline,
        sub: nearestSub,
        variant: "amber",
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

  const overviewCustomerRepaymentRows = useMemo(() => {
    const results = adminCustomerPaymentsList?.results || [];
    return results.slice(0, OVERVIEW_HIGHLIGHT_LIMIT).map((r) => {
      const st = String(r.line_status || "").toLowerCase();
      const status =
        st === "paid" ? "Paid" : st.includes("partial") ? "Partial" : st.includes("miss") ? "Missed" : "Pending";
      return {
        key: String(r.id),
        branch: r.branch_id != null && r.branch_id !== "" ? String(r.branch_id) : "—",
        status,
        event: r.project_name || "Customer payment",
        amount: ngnCompact(Number(r.amount_received)),
        when: r.payment_date ? dayjs(r.payment_date).format("DD MMM YYYY") : "—",
        next: r.payment_score?.label ?? "—",
      };
    });
  }, [adminCustomerPaymentsList]);

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
        render: (v) => {
          const s = String(v || "").toLowerCase();
          const color = s.includes("miss") ? "red" : s.includes("pending") ? "gold" : s.includes("sched") ? "green" : "default";
          return (
            <Tag color={color} className="admin-investor-pill">
              {v}
            </Tag>
          );
        },
      },
    ],
    []
  );

  const overviewDisbursementRows = useMemo(() => {
    const results = investorSchedulesList?.results || [];
    const sorted = [...results].sort((a, b) => dayjs(a.due_date).valueOf() - dayjs(b.due_date).valueOf());
    return sorted.slice(0, OVERVIEW_HIGHLIGHT_LIMIT).map((r) => ({
      key: String(r.id),
      due: r.due_date ? dayjs(r.due_date).format("DD MMM YYYY") : "—",
      investor: r.investor_name || "—",
      investment: `#${r.investment_id}`,
      amount: ngnCompact(Number(r.amount_due_investor_share ?? r.amount_due_total)),
      status: r.status ? String(r.status).replace(/^\w/, (c) => c.toUpperCase()) : "—",
    }));
  }, [investorSchedulesList]);

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
            color={String(v).toLowerCase() === "active" ? "green" : String(v).toLowerCase().includes("watch") ? "gold" : "default"}
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
    () =>
      (projectsPerformance?.results || []).map((r) => ({
        key: String(r.project_id),
        project: r.project_name,
        capacityKwp: r.system_capacity_kwp,
        totalGenKwh: Number(r.total_generation_kwh ?? 0).toLocaleString("en-NG"),
        avgDailyKwh: Number(r.average_daily_generation_kwh ?? 0).toLocaleString("en-NG"),
        solarPct: r.solar_percent_of_branch_energy != null ? `${Number(r.solar_percent_of_branch_energy).toFixed(2)}%` : "—",
        status: r.status,
      })),
    [projectsPerformance]
  );

  const overviewPerfRows = useMemo(() => perfRows.slice(0, OVERVIEW_HIGHLIGHT_LIMIT), [perfRows]);

  const overviewFinanceByInvestorRows = useMemo(
    () =>
      (financeByInvestorList?.results || []).slice(0, OVERVIEW_HIGHLIGHT_LIMIT).map((r) => ({
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
        user: r.user_email || r.user_username || "—",
        ref: r.investor_ref,
        kyc: r.kyc_status,
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
          branch: r.branch_id != null ? String(r.branch_id) : "—",
          typeLabel,
          capacityKwp: r.system_capacity_kwp,
          totalCost: r.total_project_cost,
          clientContr: r.client_contribution,
          investorTarget: r.investor_funding_target,
          stateUi,
          investorName: r.investor_summary || r.primary_investor || (Array.isArray(r.investors) ? r.investors.join(", ") : "—") || "—",
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
            scroll={{ x: 1500 }}
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
            loading={projectsPerformanceLoading}
            pagination={false}
            size="small"
            rowKey="key"
            scroll={{ x: 1300 }}
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
        paymentDate: r.payment_date,
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
      { title: "ID", dataIndex: "id", width: 72 },
      { title: "Project", dataIndex: "projectName", ellipsis: true, width: 220 },
      {
        title: "Branch",
        dataIndex: "branchId",
        width: 88,
        render: (v) => (v != null && v !== "" ? String(v) : "—"),
      },
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
        title: "Progress",
        key: "progress",
        width: 100,
        render: (_, row) => (
          <span>
            {row.paymentScoreLabel}
            {row.paymentScorePercent != null ? (
              <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>
                ({row.paymentScorePercent}%)
              </Text>
            ) : null}
          </span>
        ),
      },
      {
        title: "Line",
        dataIndex: "lineStatus",
        width: 100,
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
      },
      {
        title: "",
        key: "schedule",
        width: 130,
        render: (_, record) => (
          <Button size="small" className="admin-investor-action-btn" onClick={() => openCustomerRepayment(record)}>
            View schedule
          </Button>
        ),
      },
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
    [handleDeactivateCustomerPayment, handleViewCustomerPayment, openCustomerRepayment]
  );

  const investorRepaymentsReceivedRows = useMemo(() => {
    const results = adminInvestorPayoutsList?.results || [];
    const q = payoutSearch.trim().toLowerCase();
    let next = results;
    if (q) {
      next = results.filter(
        (r) =>
          String(r.id).includes(q) ||
          String(r.investment_id || "").includes(q) ||
          String(r.schedule_id || "").includes(q) ||
          r.reference?.toLowerCase().includes(q) ||
          r.investor_name?.toLowerCase().includes(q) ||
          r.project?.name?.toLowerCase().includes(q)
      );
    }
    return next.map((r) => ({
      key: String(r.id),
      id: r.id,
      when: r.paid_date ? dayjs(r.paid_date).format("DD MMM YYYY") : "—",
      investor: r.investor_name || "—",
      investment: `#${r.investment_id}`,
      amount: ngnCompact(Number(r.amount_paid)),
      status: "Paid",
      investmentId: r.investment_id,
      projectName: r.project?.name,
      investorName: r.investor_name,
      reference: r.reference,
      repaymentScoreLabel: r.repayment_score?.label,
    }));
  }, [adminInvestorPayoutsList, payoutSearch]);

  const investorRepaymentsReceivedColumns = useMemo(
    () => [
      { title: "When", dataIndex: "when", key: "when", width: 120 },
      { title: "Investor", dataIndex: "investor", key: "investor", width: 160, ellipsis: true },
      { title: "Investment", dataIndex: "investment", key: "investment", width: 100 },
      { title: "Amount", dataIndex: "amount", key: "amount", width: 120 },
      {
        title: "Progress",
        dataIndex: "repaymentScoreLabel",
        key: "repaymentScoreLabel",
        width: 200,
        ellipsis: true,
        render: (v) => v || "—",
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
        render: (v) => (
          <Tag color="green" className="admin-investor-pill">
            {v}
          </Tag>
        ),
      },
      {
        title: "",
        key: "view",
        width: 170,
        render: (_, record) => (
          <Button size="small" className="admin-investor-action-btn" onClick={() => openInvestorPayment(record)}>
            View schedule
          </Button>
        ),
      },
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
    [handleDeactivatePayout, handleViewPayout, openInvestorPayment]
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
        event: r.label || `Installment ${r.installment_number}`,
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

  const upcomingInvestorRepaymentRows = useMemo(() => {
    const results = investorSchedulesList?.results || [];
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
        due: dayjs(r.due_date).format("DD MMM YYYY"),
        investor: r.investor_name || "—",
        investment: `#${r.investment_id}`,
        dueAmount: ngnCompact(Number(r.amount_due_investor_share ?? r.amount_due_total)),
        status: r.status,
        investmentId: r.investment_id,
        projectName: r.project_name,
        investorName: r.investor_name,
        reference: r.label,
      }));
  }, [investorSchedulesList]);

  const customerScheduleModalRows = useMemo(() => {
    const results = customerSchedules?.results || [];
    const lineId = activePaymentMeta?.customerScheduleLineId;
    if (activePaymentMeta?.type !== "customer") return mockCustomerRepaymentSchedule;
    if (lineId != null && results.length) {
      const anchor = results.find((r) => r.id === lineId || String(r.id) === String(lineId));
      if (anchor) {
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

  const investorScheduleModalRows = useMemo(() => {
    const results = investorSchedulesList?.results || [];
    const invId = activePaymentMeta?.investmentId;
    if (activePaymentMeta?.type !== "investor") return mockInvestorPaymentSchedule;
    if (invId != null && results.length) {
      const lines = results
        .filter((r) => r.investment_id === invId || String(r.investment_id) === String(invId))
        .sort((a, b) => (a.installment_number || 0) - (b.installment_number || 0));
      if (lines.length) {
        return lines.map((r) => ({
          key: String(r.id),
          idx: r.installment_number,
          due: r.due_date ? dayjs(r.due_date).format("DD MMM YYYY") : "—",
          dueAmount: ngnCompact(Number(r.amount_due_investor_share ?? r.amount_due_total)),
          paid: Number(r.amount_paid) > 0 ? ngnCompact(Number(r.amount_paid)) : "—",
          left: ngnCompact(Number(r.amount_remaining)),
          status: r.status,
        }));
      }
      return [];
    }
    return mockInvestorPaymentSchedule;
  }, [activePaymentMeta, investorSchedulesList, mockInvestorPaymentSchedule]);

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
            columns={customerPaymentsListColumns}
            dataSource={customerPaymentsListRows}
            loading={customerPaymentsListLoading}
            pagination={false}
            size="small"
            rowKey="key"
            scroll={{ x: 1480 }}
          />
          <Text type="secondary" className="admin-investor-footnote">
            GET <Text code>/api/v1/investors/admin/customer-payments/</Text> — list; detail via{" "}
            <Text code>/customer-payments/&lt;id&gt;/</Text>.
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
            columns={investorRepaymentsReceivedColumns}
            dataSource={investorRepaymentsReceivedRows}
            loading={payoutsListLoading}
            pagination={false}
            size="small"
            rowKey="key"
            scroll={{ x: 1400 }}
          />
          <Text type="secondary" className="admin-investor-footnote">
            GET <Text code>/api/v1/investors/admin/investor-payouts/</Text> — detail, PATCH, and DELETE on{" "}
            <Text code>/investor-payouts/&lt;id&gt;/</Text>.
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
              { title: "Project", dataIndex: "branch", key: "branch", width: 220, ellipsis: true },
              { title: "Line", dataIndex: "event", key: "event", ellipsis: true },
              { title: "Amount", dataIndex: "amount", key: "amount", width: 120 },
              {
                title: "Status",
                dataIndex: "status",
                key: "status",
                width: 130,
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
              },
              {
                title: "",
                key: "sched",
                width: 130,
                render: (_, record) => (
                  <Button size="small" className="admin-investor-action-btn" onClick={() => openCustomerRepayment(record)}>
                    View schedule
                  </Button>
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
            dataSource={upcomingCustomerPaymentRows}
            loading={customerSchedulesLoading}
            pagination={false}
            size="small"
            rowKey="key"
            scroll={{ x: 1100 }}
          />
          <Text type="secondary" className="admin-investor-footnote">
            GET <Text code>/api/v1/investors/admin/customer-payment-schedules/</Text> — scheduled lines from today onward.
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
              { title: "Investor", dataIndex: "investor", key: "investor", width: 160, ellipsis: true },
              { title: "Investment", dataIndex: "investment", key: "investment", width: 100 },
              { title: "Due amount", dataIndex: "dueAmount", key: "dueAmount", width: 120 },
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
                        : String(v).toLowerCase() === "scheduled"
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
                key: "viewsched",
                width: 130,
                render: (_, record) => (
                  <Button size="small" className="admin-investor-action-btn" onClick={() => openInvestorPayment(record)}>
                    View schedule
                  </Button>
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
            dataSource={upcomingInvestorRepaymentRows}
            loading={investorSchedulesLoading}
            pagination={false}
            size="small"
            rowKey="key"
            scroll={{ x: 1100 }}
          />
          <Text type="secondary" className="admin-investor-footnote">
            GET <Text code>/api/v1/investors/admin/investor-payment-schedules/</Text> — scheduled investor lines from today onward.
          </Text>
        </Card>
      </div>
    ),
    [
      customerPaymentSearch,
      payoutSearch,
      customerPaymentsListColumns,
      customerPaymentsListRows,
      customerPaymentsListLoading,
      openCustomerRepayment,
      openInvestorPayment,
      investorRepaymentsReceivedColumns,
      investorRepaymentsReceivedRows,
      payoutsListLoading,
      upcomingCustomerPaymentRows,
      customerSchedulesLoading,
      upcomingInvestorRepaymentRows,
      investorSchedulesLoading,
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
            columns={[
              { title: "ID", dataIndex: "id", key: "id", width: 72 },
              { title: "Tag", dataIndex: "subjectTagDisplay", key: "subjectTagDisplay", width: 120 },
              { title: "Subject", dataIndex: "subject", key: "subject", ellipsis: true },
              {
                title: "Investor",
                dataIndex: "investor",
                key: "investor",
                width: 180,
                ellipsis: true,
                render: (_, r) => (
                  <div className="admin-investor-ticket-investor">
                    <div className="admin-investor-ticket-investor-name">{r.investor}</div>
                    <div className="admin-investor-ticket-investor-ref">{r.ref}</div>
                  </div>
                ),
              },
              {
                title: "Status",
                dataIndex: "status",
                key: "status",
                width: 110,
                render: (v) => {
                  const s = String(v || "").toLowerCase();
                  const color = s === "resolved" ? "green" : s === "closed" ? "default" : s === "pending" ? "gold" : "blue";
                  return (
                    <Tag color={color} className="admin-investor-pill">
                      {v}
                    </Tag>
                  );
                },
              },
              { title: "Priority", dataIndex: "priority", key: "priority", width: 100 },
              { title: "Created", dataIndex: "created", key: "created", width: 150 },
              { title: "Updated", dataIndex: "updated", key: "updated", width: 150 },
              {
                title: "Respond",
                key: "respond",
                width: 190,
                render: (_, r) => {
                  const localNotes = ticketPostResponses[r.idStr]?.length ?? 0;
                  const has = r.responded || r.staffNoteCount > 0 || localNotes > 0;
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
                    </Space>
                  );
                },
              },
            ]}
            dataSource={rows}
            loading={supportTicketsListLoading}
            pagination={false}
            size="small"
            rowKey="key"
            scroll={{ x: 1320 }}
          />

          <Text type="secondary" className="admin-investor-footnote">
            GET <Text code>/api/v1/investors/admin/support-tickets/</Text> — respond via POST{" "}
            <Text code>/support-tickets/&lt;id&gt;/responses/</Text> with <Text code>body</Text>.
          </Text>
        </Card>
      </div>
    );
  }, [openTicketResponse, supportTicketsList, supportTicketsListLoading, ticketPostResponses, ticketsTableMode]);

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
                      dataSource={overviewCustomerRepaymentRows}
                      loading={customerPaymentsListLoading}
                      pagination={false}
                      size="small"
                      rowKey="key"
                    />
                    <Text type="secondary" className="admin-investor-footnote">
                      Latest {OVERVIEW_HIGHLIGHT_LIMIT} from{" "}
                      <Text code>/api/v1/investors/admin/customer-payments/</Text> — see Payments for the full list.
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
                        dataSource={overviewDisbursementRows}
                        loading={investorSchedulesLoading}
                        pagination={false}
                        size="small"
                        rowKey="key"
                      />
                      <Text type="secondary" className="admin-investor-footnote">
                        Next {OVERVIEW_HIGHLIGHT_LIMIT} lines by due date from{" "}
                        <Text code>/api/v1/investors/admin/investor-payment-schedules/</Text>.
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
                        dataSource={overviewPerfRows}
                        loading={projectsPerformanceLoading}
                        pagination={false}
                        size="small"
                        rowKey="key"
                        scroll={{ x: 1300 }}
                      />
                      <Text type="secondary" className="admin-investor-footnote">
                        Up to {OVERVIEW_HIGHLIGHT_LIMIT} rows from{" "}
                        <Text code>/api/v1/investors/admin/projects/performance/</Text> (same Top/Bottom toggle as Projects tab).
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
                      dataSource={overviewFinanceByInvestorRows}
                      loading={financeByInvestorLoading}
                      pagination={false}
                      size="small"
                      rowKey="key"
                    />
                    <Text type="secondary" className="admin-investor-footnote">
                      First {OVERVIEW_HIGHLIGHT_LIMIT} from{" "}
                      <Text code>/api/v1/investors/admin/directory/finance-by-investor/</Text>.
                    </Text>
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
                        { title: "Ref", dataIndex: "ref", key: "ref", width: 140 },
                        { title: "Capital deployed", dataIndex: "capital", key: "capital", width: 160 },
                        { title: "Interest (flat)", dataIndex: "interest", key: "interest", width: 140 },
                        { title: "Paid to investor YTD", dataIndex: "paid", key: "paid", width: 170 },
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
                      loading={financeByInvestorLoading}
                      dataSource={(financeByInvestorList?.results || []).map((r) => ({
                        key: String(r.id),
                        investor: r.legal_name,
                        ref: r.investor_ref,
                        capital: ngnCompact(Number(r.capital_deployed)),
                        interest: ngnCompact(Number(r.interest_flat_amount)),
                        paid: ngnCompact(Number(r.paid_to_investor_ytd)),
                        health: r.health,
                      }))}
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
        <Text type="secondary" className="admin-investor-footnote">
          Rows for the same <Text code>customer_repayment_plan_id</Text> as the selected payment&apos;s schedule line (from{" "}
          <Text code>/customer-payment-schedules/</Text>).
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
          loading={investorSchedulesLoading && activePaymentMeta?.type === "investor"}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          dataSource={investorScheduleModalRows}
          columns={[
            { title: "#", dataIndex: "idx", width: 60 },
            { title: "Due date", dataIndex: "due", width: 140 },
            { title: "Due (investor)", dataIndex: "dueAmount", width: 140 },
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
        <Text type="secondary" className="admin-investor-footnote">
          Schedule lines for the selected <Text code>investment_id</Text> from <Text code>/investor-payment-schedules/</Text>.
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
          Updates <Text code>investors/admin/investor-users/{investorUserDetail?.id || "…"}/</Text> via PATCH.
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
            customer_schedule_ids: [],
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
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key} align="baseline" wrap style={{ marginBottom: 8 }}>
                        <Form.Item {...restField} name={[name, "customer_schedule_id"]}>
                          {customerScheduleSelectOptions.length ? (
                            <Select
                              disabled={Boolean((recordPaymentForm.getFieldValue("customer_schedule_ids") || []).length)}
                              allowClear
                              showSearch
                              optionFilterProp="label"
                              placeholder="Schedule"
                              style={{ width: 280 }}
                              options={customerScheduleSelectOptions}
                            />
                          ) : (
                            <InputNumber min={1} step={1} placeholder="Schedule ID" style={{ width: 140 }} />
                          )}
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
                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
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
                <Text type="secondary" style={{ fontSize: 12 }}>
                  PATCH <Text code>/api/v1/investors/admin/customer-payments/&lt;id&gt;/</Text>
                </Text>
              </Form>
            )}
          </>
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
            schedule_ids: [],
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
                  {payoutSchedules.length} schedule line(s) — select one or more schedules below.
                </Text>
              ) : (
                <Text type="secondary">No schedule rows returned for this investment.</Text>
              )}
            </div>
          ) : null}

          <Divider className="admin-modal-divider" />
          <div className="admin-modal-section-title">Payment schedules</div>

          <Form.Item
            name="schedule_ids"
            label="Payment schedules (select one or more)"
            extra="Selecting schedules will auto-create line items below."
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder={payoutScheduleSelectOptions.length ? "Select schedules" : "No schedules loaded yet"}
              options={payoutScheduleSelectOptions}
              onChange={(ids) => {
                const uniq = Array.from(new Set((ids || []).map((v) => Number(v)).filter((n) => Number.isFinite(n))));
                payoutForm.setFieldsValue({
                  line_items: uniq.length
                    ? uniq.map((id) => ({ schedule_id: id, amount_paid: undefined, paid_date: undefined }))
                    : [{ schedule_id: undefined, amount_paid: undefined, paid_date: undefined }],
                });
              }}
            />
          </Form.Item>

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
                          disabled={Boolean((payoutForm.getFieldValue("schedule_ids") || []).length)}
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
        footer={
          payoutEditing
            ? [
                <Button
                  key="cancel"
                  onClick={() => {
                    setPayoutEditing(false);
                    payoutEditForm.resetFields();
                  }}
                >
                  Cancel edit
                </Button>,
                <Button key="save" type="primary" loading={payoutUpdateLoading} onClick={submitPayoutEdit}>
                  Save changes
                </Button>,
              ]
            : [
                <Button
                  key="edit"
                  onClick={() => {
                    if (!payoutDetail) return;
                    setPayoutEditing(true);
                    payoutEditForm.setFieldsValue({
                      amount_paid: Number(payoutDetail.amount_paid),
                      paid_date: payoutDetail.paid_date ? dayjs(payoutDetail.paid_date) : null,
                      payment_method: payoutDetail.payment_method,
                      reference: payoutDetail.reference,
                    });
                  }}
                >
                  Edit
                </Button>,
                <Button key="close" type="primary" onClick={closePayoutDetail}>
                  Close
                </Button>,
              ]
        }
        destroyOnClose
      >
        {payoutDetailLoading ? (
          <Text type="secondary">Loading…</Text>
        ) : payoutDetail ? (
          <>
            {!payoutEditing ? (
              <Descriptions bordered size="small" column={1} className="admin-investor-detail-desc">
                <Descriptions.Item label="ID">{payoutDetail.id}</Descriptions.Item>
                <Descriptions.Item label="Investor">{payoutDetail.investor_name || "—"}</Descriptions.Item>
                <Descriptions.Item label="Investment ID">{payoutDetail.investment_id}</Descriptions.Item>
                <Descriptions.Item label="Project">{payoutDetail.project?.name || "—"}</Descriptions.Item>
                <Descriptions.Item label="Schedule ID">{payoutDetail.schedule_id}</Descriptions.Item>
                <Descriptions.Item label="Amount paid">{ngnCompact(Number(payoutDetail.amount_paid))}</Descriptions.Item>
                <Descriptions.Item label="Paid date">{payoutDetail.paid_date}</Descriptions.Item>
                <Descriptions.Item label="Payment method">{payoutDetail.payment_method}</Descriptions.Item>
                <Descriptions.Item label="Reference">{payoutDetail.reference || "—"}</Descriptions.Item>
                <Descriptions.Item label="Repayment progress">
                  {payoutDetail.repayment_score?.label ?? "—"}
                  {payoutDetail.repayment_score?.percent != null ? ` (${payoutDetail.repayment_score.percent}%)` : ""}
                </Descriptions.Item>
                <Descriptions.Item label="Disbursed by">{payoutDetail.disbursed_by ?? "—"}</Descriptions.Item>
                <Descriptions.Item label="Created">{payoutDetail.created_at || "—"}</Descriptions.Item>
              </Descriptions>
            ) : (
              <Form form={payoutEditForm} layout="vertical" className="admin-modal-form">
                <div className="admin-modal-grid">
                  <Form.Item name="amount_paid" label="Amount paid (₦)" rules={[{ required: true, message: "Required" }]}>
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item name="paid_date" label="Paid date" rules={[{ required: true, message: "Required" }]}>
                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                  </Form.Item>
                  <Form.Item name="payment_method" label="Payment method" rules={[{ required: true, message: "Required" }]}>
                    <Input placeholder="e.g. bank_transfer" />
                  </Form.Item>
                  <Form.Item name="reference" label="Reference" rules={[{ required: true, message: "Required" }]}>
                    <Input />
                  </Form.Item>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  PATCH <Text code>/api/v1/investors/admin/investor-payouts/&lt;id&gt;/</Text>
                </Text>
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

