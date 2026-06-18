import dayjs from "dayjs";
import {
  firstNumber,
  formatCompactNgn,
  unwrapInvestorEnvelope,
  unwrapListOrObject,
} from "./investorPortfolioMappers";

function listFromPaged(data) {
  const envelope = unwrapInvestorEnvelope(data);
  if (envelope == null) return [];
  if (Array.isArray(envelope)) return envelope;
  if (Array.isArray(envelope.results)) return envelope.results;
  return unwrapListOrObject(data) || [];
}

function parseAmount(value) {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function formatNgnAmount(value) {
  const n = parseAmount(value);
  if (n == null) return "—";
  return `₦${n.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

/** Table amounts: compact (₦6.0M) from ₦1,000 upward to avoid column wrap. */
function formatTableNgnAmount(value) {
  const n = parseAmount(value);
  if (n == null) return "—";
  if (Math.abs(n) >= 1000) return formatCompactNgn(n);
  return formatNgnAmount(value);
}

function formatScheduleStatus(statusDisplay) {
  const raw = String(statusDisplay || "")
    .replace(/_/g, " ")
    .trim();
  if (!raw) return "—";
  return raw.replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatLedgerType(type) {
  const t = String(type || "").replace(/_/g, " ");
  if (!t) return "—";
  return t.replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatBalanceEffect(effect) {
  const e = String(effect || "").toLowerCase();
  if (e === "credited") return "Credited";
  if (e === "flagged") return "Flagged";
  if (!e) return "—";
  return e.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Top four KPI cards — aligned with Payments & receivables mock. */
export function mapPaymentsKpis({
  totalCreditedRaw,
  dueNext30Raw,
  overdue90Raw,
  nextPaymentDueRaw,
}) {
  const tc = unwrapInvestorEnvelope(totalCreditedRaw);
  const due = unwrapInvestorEnvelope(dueNext30Raw);
  const od = unwrapInvestorEnvelope(overdue90Raw);
  const next = unwrapInvestorEnvelope(nextPaymentDueRaw);

  const totalCreditedNgn = firstNumber(tc, [
    "total_credited",
    "totalCredited",
    "total_credited_ngn",
    "amount",
  ]);

  const periodMode = tc?.period_mode || "lifetime";
  const totalCreditedSub =
    periodMode === "lifetime"
      ? "Lifetime disbursements"
      : `Period: ${periodMode}`;

  const dueNext30Ngn = firstNumber(due, [
    "due_next_30_days",
    "dueNext30Days",
    "amount",
    "total_due",
  ]);
  const installmentCount = firstNumber(due, ["installment_count", "installmentCount"]);
  const dueSub =
    installmentCount != null
      ? `Across all open installments (${installmentCount})`
      : "Across all open installments";

  const overdueNgn = firstNumber(od, [
    "overdue_90d_plus",
    "overdue90dPlus",
    "overdue_amount",
    "amount",
  ]);
  const overdueSub =
    overdueNgn != null && overdueNgn > 0
      ? "See upcoming schedule for detail"
      : "No overdue installments (90d+)";

  const dueDate = next?.due_date ?? next?.dueDate;
  const nextDueDateDisplay =
    dueDate && dayjs(dueDate).isValid() ? dayjs(dueDate).format("DD MMM") : "—";
  const nextAmount = firstNumber(next, ["amount", "your_credit", "total_due"]);
  const nextSubParts = [];
  if (nextAmount != null) nextSubParts.push(formatTableNgnAmount(nextAmount));
  if (next?.project_name) nextSubParts.push(String(next.project_name));
  let nextSub = nextSubParts.length ? nextSubParts.join(" · ") : "—";
  if (next?.is_past_due) {
    nextSub = nextSub === "—" ? "Past due" : `${nextSub} · Past due`;
  }

  return {
    totalCredited: {
      label: "Total credited to you",
      value: totalCreditedNgn != null ? formatCompactNgn(totalCreditedNgn) : "—",
      sub: totalCreditedSub,
      primary: true,
    },
    dueNext30: {
      label: "Due next 30 days",
      value: dueNext30Ngn != null ? formatCompactNgn(dueNext30Ngn) : "—",
      sub: dueSub,
    },
    overdue90: {
      label: "Overdue (90D+)",
      value: overdueNgn != null ? formatCompactNgn(overdueNgn) : "—",
      sub: overdueSub,
    },
    nextPaymentDue: {
      label: "Next payment due",
      value: nextDueDateDisplay,
      sub: nextSub,
      isPastDue: Boolean(next?.is_past_due),
    },
  };
}

/** investors/payments/upcoming-schedule/ */
export function mapUpcomingSchedule(raw) {
  return listFromPaged(raw).map((row) => {
    const due = row.due_date && dayjs(row.due_date).isValid()
      ? dayjs(row.due_date).format("DD MMM")
      : "—";
    const project = row.project_name ? String(row.project_name) : "—";
    const statusLabel = formatScheduleStatus(row.status_display || row.status);
    const posted =
      row.last_posted_at && dayjs(row.last_posted_at).isValid()
        ? dayjs(row.last_posted_at).format("DD MMM · HH:mm")
        : null;

    return {
      key: String(row.schedule_id ?? `${row.due_date}-${row.project_id}`),
      due,
      project,
      totalDue: formatTableNgnAmount(row.total_due),
      yourCredit: formatTableNgnAmount(row.your_credit),
      status: statusLabel,
      statusDetail: posted ? `${statusLabel} · ${posted}` : statusLabel,
      statusKey: String(row.status_display || row.status || "").toLowerCase(),
      projectName: row.project_name,
    };
  });
}

/** investors/payments/payout-history/ */
export function mapPayoutHistory(raw) {
  return listFromPaged(raw).map((row) => {
    const date =
      row.paid_date && dayjs(row.paid_date).isValid()
        ? dayjs(row.paid_date).format("DD MMM")
        : "—";
    const label = row.label || row.event_type || "Payout";
    const amount = parseAmount(row.amount_paid);
    const ref = row.reference ? ` · ${row.reference}` : "";
    const project = row.project_name ? ` · ${row.project_name}` : "";

    return {
      key: String(row.id ?? `${row.paid_date}-${row.amount_paid}`),
      line: `${date} · ${label}${ref}${project}`,
      amount: amount != null && amount > 0 ? `+ ${formatCompactNgn(amount)}` : "NO",
      isBad: amount == null || amount <= 0,
    };
  });
}

/** investors/payments/receivable-health/ */
export function mapReceivableHealth(raw) {
  const data = unwrapInvestorEnvelope(raw);
  if (!data || typeof data !== "object") {
    return { dpd: "—", projectsOverdue: "—", irrRange: "—", disclaimer: null };
  }

  const dpdVal = firstNumber(data, ["weighted_days_past_due", "weightedDaysPastDue"]);
  const dpd = dpdVal != null ? `${dpdVal}d` : "—";

  const issues = firstNumber(data, ["projects_with_issues", "projectsWithIssues"]);
  const projectsOverdue = issues != null ? String(issues) : "—";

  const irr = data.expected_irr_range ?? data.expectedIrrRange;
  let irrRange = "—";
  if (irr?.min_percent != null && irr?.max_percent != null) {
    irrRange = `${irr.min_percent}–${irr.max_percent}%`;
  }

  return {
    dpd,
    projectsOverdue,
    irrRange,
    portfolioScore: data.portfolio_score_percent,
    disclaimer: irr?.disclaimer || null,
  };
}

/** investors/payments/ledger/ */
export function mapPaymentsLedger(raw) {
  const envelope = unwrapInvestorEnvelope(raw);
  const rows = listFromPaged(raw);
  const periodYear = envelope?.period?.year;

  const ledger = rows.map((row, idx) => {
    const date =
      row.date && dayjs(row.date).isValid()
        ? dayjs(row.date).format("DD MMM YYYY")
        : "—";

    return {
      key: String(row.customer_payment_id ?? row.disbursement_id ?? `${row.date}-${idx}`),
      date,
      dateIso: row.date,
      type: formatLedgerType(row.type),
      ref: row.project_name
        ? String(row.project_name)
        : row.reference
          ? String(row.reference)
          : "—",
      customer:
        row.customer_amount != null ? formatTableNgnAmount(row.customer_amount) : "—",
      allocation: formatTableNgnAmount(row.your_allocation),
      effect: formatBalanceEffect(row.balance_effect),
      projectName: row.project_name,
    };
  });

  return {
    ledger,
    periodYear,
    pagination: {
      page: envelope?.page ?? 1,
      pageSize: envelope?.page_size ?? 20,
      total: envelope?.total ?? ledger.length,
      pages: envelope?.pages ?? 1,
    },
  };
}

/** investors/payments/project-payout-schedule/?investment_id= */
export function mapProjectPayoutSchedule(raw) {
  const data = unwrapInvestorEnvelope(raw);
  if (!data || typeof data !== "object") return null;

  const summary = data.summary || {};
  const rows = Array.isArray(data.results) ? data.results : [];

  const mapRow = (row) => {
    const due =
      row.due_date && dayjs(row.due_date).isValid()
        ? dayjs(row.due_date).format("DD MMM YYYY")
        : "—";
    const paidDate =
      row.paid_date && dayjs(row.paid_date).isValid()
        ? dayjs(row.paid_date).format("DD MMM YYYY")
        : "—";
    const posted =
      row.last_posted_at && dayjs(row.last_posted_at).isValid()
        ? dayjs(row.last_posted_at).format("DD MMM YYYY")
        : null;
    const statusLabel = formatScheduleStatus(row.status_display || row.status);

    return {
      key: String(row.schedule_id ?? `${row.due_date}-${row.installment_number}`),
      due,
      dueIso: row.due_date,
      amountDue: formatTableNgnAmount(row.amount_due),
      amountPaid: formatTableNgnAmount(row.amount_paid),
      amountRemaining: formatTableNgnAmount(row.amount_remaining),
      paidDate,
      status: statusLabel,
      statusDetail: posted && statusLabel !== "—" ? `${statusLabel} · ${posted}` : statusLabel,
      statusKey: String(row.status_display || row.status || "").toLowerCase(),
      projectName: row.project_name,
    };
  };

  return {
    currency: data.currency || "NGN",
    investmentId: data.investment_id,
    projectId: data.project_id,
    projectName: data.project_name || "—",
    count: data.count ?? rows.length,
    summary: {
      totalInstallments: firstNumber(summary, ["total_installments"]) ?? rows.length,
      paidCount: firstNumber(summary, ["paid_count"]) ?? 0,
      openCount: firstNumber(summary, ["open_count"]) ?? 0,
      totalDue: formatTableNgnAmount(summary.total_due),
      totalPaid: formatTableNgnAmount(summary.total_paid),
      totalRemaining: formatTableNgnAmount(summary.total_remaining),
    },
    installments: rows.map(mapRow),
  };
}

export function buildPaymentsPagePayload(apiResponses, options = {}) {
  const { partialErrors = [] } = options;

  const kpis = mapPaymentsKpis({
    totalCreditedRaw: apiResponses.totalCredited,
    dueNext30Raw: apiResponses.dueNext30,
    overdue90Raw: apiResponses.overdue90,
    nextPaymentDueRaw: apiResponses.nextPaymentDue,
  });

  const ledgerMapped = mapPaymentsLedger(apiResponses.ledger);

  return {
    partialErrors: partialErrors.length ? partialErrors : null,
    loadError: null,
    kpis,
    schedule: mapUpcomingSchedule(apiResponses.upcomingSchedule),
    payoutHistory: mapPayoutHistory(apiResponses.payoutHistory),
    receivableHealth: mapReceivableHealth(apiResponses.receivableHealth),
    ledger: ledgerMapped.ledger,
    ledgerMeta: ledgerMapped.pagination,
    ledgerPeriodYear: ledgerMapped.periodYear,
  };
}
