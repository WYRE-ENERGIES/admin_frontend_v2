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
  const branchIds = Array.isArray(od?.branch_ids) ? od.branch_ids.filter((id) => id != null) : [];
  let overdueSub = "No overdue installments (90d+)";
  if (branchIds.length) {
    overdueSub = `Branches ${branchIds.join(", ")}`;
  } else if (overdueNgn != null && overdueNgn > 0) {
    overdueSub = "See upcoming schedule for detail";
  }

  const dueDate = next?.due_date ?? next?.dueDate;
  const nextDueDateDisplay =
    dueDate && dayjs(dueDate).isValid() ? dayjs(dueDate).format("DD MMM") : "—";
  const nextAmount = firstNumber(next, ["amount", "your_credit", "total_due"]);
  const nextSubParts = [];
  if (nextAmount != null) nextSubParts.push(formatNgnAmount(nextAmount));
  if (next?.branch_id != null) nextSubParts.push(`Branch ${next.branch_id}`);
  else if (next?.project_id != null) nextSubParts.push(`Project #${next.project_id}`);
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
    const branch =
      row.branch_id != null
        ? String(row.branch_id)
        : row.project_name
          ? String(row.project_name).slice(0, 28)
          : "—";
    const statusLabel = formatScheduleStatus(row.status_display || row.status);
    const posted =
      row.last_posted_at && dayjs(row.last_posted_at).isValid()
        ? dayjs(row.last_posted_at).format("DD MMM · HH:mm")
        : null;
    const statusCell = posted ? `${statusLabel} · ${posted}` : statusLabel;

    return {
      key: String(row.schedule_id ?? `${row.due_date}-${row.project_id}`),
      due,
      branch,
      totalDue: formatNgnAmount(row.total_due),
      yourCredit: formatNgnAmount(row.your_credit),
      status: statusCell,
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
      ref: row.branch_ref != null ? String(row.branch_ref) : "—",
      customer:
        row.customer_amount != null ? formatNgnAmount(row.customer_amount) : "—",
      allocation: formatNgnAmount(row.your_allocation),
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
    const statusCell = posted && statusLabel !== "—" ? `${statusLabel} · ${posted}` : statusLabel;

    return {
      key: String(row.schedule_id ?? `${row.installment_number}-${row.due_date}`),
      installmentNumber: row.installment_number ?? "—",
      due,
      dueIso: row.due_date,
      amountDue: formatNgnAmount(row.amount_due),
      amountPaid: formatNgnAmount(row.amount_paid),
      amountRemaining: formatNgnAmount(row.amount_remaining),
      paidDate,
      status: statusCell,
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
      totalDue: formatNgnAmount(summary.total_due),
      totalPaid: formatNgnAmount(summary.total_paid),
      totalRemaining: formatNgnAmount(summary.total_remaining),
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
