/**
 * Normalizes investor portfolio API payloads into UI-friendly shapes.
 * Backend field names may vary — extend these helpers when the contract is finalized.
 */

import dayjs from "dayjs";

/** Peel investor API envelopes: { status, data }, { authenticatedData }, nested data. */
export function unwrapInvestorEnvelope(payload) {
  if (payload == null) return null;
  if (payload.authenticatedData != null) return unwrapInvestorEnvelope(payload.authenticatedData);
  if (payload.status === false) return null;
  if (payload.data != null && typeof payload.data === "object") {
    return unwrapInvestorEnvelope(payload.data);
  }
  return payload;
}

export function unwrapListOrObject(payload) {
  if (payload == null) return null;
  const unwrapped = unwrapInvestorEnvelope(payload);
  const root = unwrapped ?? payload;
  if (Array.isArray(root)) return root;
  if (Array.isArray(root.results)) return root.results;
  if (root.data != null) return unwrapListOrObject(root);
  if (root.authenticatedData != null) return unwrapListOrObject(root.authenticatedData);
  return root;
}

export function firstNumber(obj, keys) {
  if (!obj || typeof obj !== "object") return null;
  for (const k of keys) {
    const v = obj[k];
    if (v == null) continue;
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

export function firstString(obj, keys, fallback = "—") {
  if (!obj || typeof obj !== "object") return fallback;
  for (const k of keys) {
    const v = obj[k];
    if (v == null || v === "") continue;
    return String(v);
  }
  return fallback;
}

/** Compact ₦ for KPI headlines (e.g. ₦48.2M). */
export function formatCompactNgn(n) {
  if (n == null || n === "") return "—";
  const num = Number(n);
  if (Number.isNaN(num)) return "—";
  if (num >= 1e9) return `₦${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `₦${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `₦${(num / 1e3).toFixed(0)}k`;
  return `₦${num.toLocaleString("en-NG")}`;
}

/** Join location labels for display; drops numeric-only branch IDs. */
export function humanLocationLabel(...parts) {
  const cleaned = parts
    .flat()
    .filter((p) => p != null && String(p).trim() !== "" && String(p).trim() !== "—")
    .map((p) => String(p).trim())
    .filter((p) => !/^\d+$/.test(p));
  const unique = [...new Set(cleaned)];
  return unique.length ? unique.join(" · ") : null;
}

/** investors/total-receivables */
export function mapTotalReceivablesCard(raw) {
  const o = unwrapInvestorEnvelope(raw) ?? unwrapListOrObject(raw) ?? raw;

  const totalReceivable =
    firstNumber(o, [
      "total_receivable",
      "total_receivables",
      "totalReceivable",
      "total_receivable_ngn",
    ]) ?? firstNumber(o?.data, ["total_receivable", "amount"]);

  const investedAmount =
    firstNumber(o, ["total_invested", "total_invested_ngn", "totalInvested"]) ??
    firstNumber(o?.data, ["total_invested"]);

  const interestTotal =
    firstNumber(o, ["interest_total", "interestTotal", "total_interest"]) ??
    firstNumber(o?.data, ["interest_total"]);

  const paymentsReceived =
    firstNumber(o, ["payments_received", "paymentsReceived", "repayments_received"]) ??
    firstNumber(o?.data, ["payments_received"]);

  const outstanding = parseOutstandingAmount(o);

  const activeProjectsCount =
    firstNumber(o, ["active_projects_count", "active_projects", "activeProjects"]) ??
    firstNumber(o?.data, ["active_projects_count"]);

  const investedFmt = investedAmount != null ? formatCompactNgn(investedAmount) : null;
  const interestFmt = interestTotal != null ? formatCompactNgn(interestTotal) : null;

  let compositionSub = null;
  if (investedFmt && interestFmt) {
    compositionSub = `${investedFmt} invested · ${interestFmt} interest`;
  } else if (investedFmt) {
    compositionSub = `${investedFmt} invested`;
  } else if (interestFmt) {
    compositionSub = `${interestFmt} interest`;
  }

  return {
    totalReceivable,
    investedAmount,
    interestTotal,
    compositionSub,
    paymentsReceived,
    outstanding,
    activeProjectsCount,
  };
}

/**
 * Primary purple card: total receivables + invested/interest breakdown + payments & outstanding.
 * Falls back to repayment-totals when receivables fields are missing.
 */
export function mapPrimaryReceivablesCard(totalReceivablesRaw, repaymentTotalsRaw) {
  const rec = mapTotalReceivablesCard(totalReceivablesRaw);
  const repay = mapRepaymentTotalsCard(repaymentTotalsRaw);
  return {
    totalReceivable: rec.totalReceivable,
    investedAmount: rec.investedAmount,
    interestTotal: rec.interestTotal,
    compositionSub: rec.compositionSub,
    paymentsReceived: rec.paymentsReceived ?? repay.received,
    outstanding: rec.outstanding ?? repay.outstanding,
  };
}

/** investors/total-deposited — wallet investor KPI card */
export function mapTotalDepositedCard(raw) {
  const o = unwrapInvestorEnvelope(raw) ?? unwrapListOrObject(raw) ?? raw;
  if (!o || typeof o !== "object") {
    return {
      isWalletInvestor: false,
      totalDeposited: null,
      display: "—",
      sub: "—",
    };
  }
  const isWalletInvestor = Boolean(o?.is_wallet_investor);
  const totalDeposited =
    firstNumber(o, ["total_deposited", "totalDeposited"]) ??
    firstNumber(o?.data, ["total_deposited"]);
  const currency = firstString(o, ["currency"], "NGN");

  return {
    isWalletInvestor,
    totalDeposited,
    display: totalDeposited != null ? formatCompactNgn(totalDeposited) : "—",
    sub: currency === "NGN" ? "Lifetime wallet deposits" : `Lifetime deposits (${currency})`,
  };
}

/** @deprecated Use mapTotalReceivablesCard — kept for legacy callers. */
export function mapTotalInvestedCard(raw) {
  const rec = mapTotalReceivablesCard(raw);
  const activeProjects = rec.activeProjectsCount;
  const sub =
    activeProjects != null
      ? `Across ${activeProjects} active project${activeProjects === 1 ? "" : "s"}`
      : "—";
  return { amount: rec.investedAmount ?? rec.totalReceivable, sub };
}

/** @deprecated Use mapPrimaryReceivablesCard */
export function mapPrimaryInvestedCard(totalRaw, repaymentTotalsRaw) {
  const rec = mapPrimaryReceivablesCard(totalRaw, repaymentTotalsRaw);
  return {
    amount: rec.totalReceivable ?? rec.investedAmount,
    paymentsReceived: rec.paymentsReceived,
    outstanding: rec.outstanding,
  };
}

/** Convert API kWh to MWh headline (portfolio_generation_kwh → display). */
export function formatPortfolioGenerationMwh(kwh) {
  if (kwh == null || Number.isNaN(Number(kwh))) return "—";
  const mwh = Number(kwh) / 1000;
  if (mwh >= 1e3) return `${(mwh / 1e3).toFixed(1)}k MWh`;
  if (mwh >= 10) return `${mwh.toFixed(1)} MWh`;
  if (mwh >= 1) return `${mwh.toFixed(1)} MWh`;
  return `${mwh.toFixed(2)} MWh`;
}

/** investors/portfolio-generation — MWh headline + ₦ naira equivalent badge */
export function mapPortfolioGenerationCard(raw) {
  const o = unwrapInvestorEnvelope(raw) ?? unwrapListOrObject(raw) ?? raw;

  const genBlock = o?.portfolio_generation;
  const mwhVal = firstNumber(genBlock, ["value"]);
  const genUnit = firstString(genBlock, ["unit"], "MWh");

  let value = "—";
  if (mwhVal != null) {
    const unit = genUnit.toLowerCase();
    if (unit === "mwh") {
      if (mwhVal >= 1000) value = `${(mwhVal / 1000).toFixed(1)}k MWh`;
      else if (mwhVal >= 10) value = `${mwhVal.toFixed(1)} MWh`;
      else if (mwhVal >= 1) value = `${mwhVal.toFixed(1)} MWh`;
      else value = `${mwhVal.toFixed(2)} MWh`;
    } else {
      value = `${mwhVal.toLocaleString("en-NG", { maximumFractionDigits: 1 })} ${genUnit}`;
    }
  } else {
    const kwh =
      firstNumber(o, [
        "portfolio_generation_kwh",
        "kwh",
        "total_kwh",
        "generation_kwh",
      ]) ?? firstNumber(o?.data, ["portfolio_generation_kwh", "kwh"]);
    if (kwh != null) value = formatPortfolioGenerationMwh(kwh);
    else {
      const preset = firstString(o, ["display", "label", "summary"], "");
      if (preset && preset !== "—") value = preset;
    }
  }

  const ngnVal = firstNumber(o, [
    "portfolio_generation_naira_equivalent",
    "portfolio_generation_value_ngn",
    "generation_value_ngn",
    "value_ngn",
  ]);

  const nairaSub = ngnVal != null ? formatCompactNgn(ngnVal) : null;

  return {
    value,
    sub: nairaSub ?? "—",
    nairaSub,
  };
}

/** Sum upcoming_payments when API returns a list of schedule lines. */
function sumUpcomingPaymentsList(list) {
  if (!Array.isArray(list) || !list.length) return null;
  let total = 0;
  let any = false;
  for (const row of list) {
    const n = firstNumber(row, [
      "amount",
      "your_credit",
      "your_allocation",
      "total_due",
      "amount_due",
      "amount_remaining",
      "value",
    ]);
    if (n != null) {
      total += n;
      any = true;
    }
  }
  return any ? total : null;
}

/** Outstanding on portfolio KPI — prefer upcoming_payments from repayment-totals. */
export function parseOutstandingAmount(o) {
  if (!o || typeof o !== "object") return null;

  const scalar = firstNumber(o, [
    "upcoming_payments",
    "upcoming_payments_total",
    "upcomingPayments",
    "upcoming_payments_ngn",
  ]);
  if (scalar != null) return scalar;

  const nested = o.upcoming_payments;
  if (typeof nested === "number" || (typeof nested === "string" && nested !== "")) {
    const n = Number(nested);
    if (!Number.isNaN(n)) return n;
  }
  if (Array.isArray(nested)) {
    const summed = sumUpcomingPaymentsList(nested);
    if (summed != null) return summed;
  }

  return (
    firstNumber(o, ["outstanding", "outstanding_amount", "outstanding_total"]) ??
    firstNumber(o?.data, ["upcoming_payments", "outstanding"])
  );
}

/** investors/me/repayment-totals */
export function mapRepaymentTotalsCard(raw) {
  const o = unwrapInvestorEnvelope(raw) ?? unwrapListOrObject(raw) ?? raw;
  const received =
    firstNumber(o, ["repayments_received", "total_repayments", "lifetime_total", "amount", "value"]) ??
    firstNumber(o?.data, ["repayments_received", "total", "amount"]);
  const outstanding = parseOutstandingAmount(o);
  const sub = firstString(o, ["subtitle", "description", "period", "detail"], "Lifetime to date");
  return { received, outstanding, sub };
}
/** Portfolio score KPI: sum paid/total installments across financed projects (e.g. 6+7 / 24+12 → 36%). */
export function aggregatePortfolioScoreKpi(mappedFinancedProjects) {
  const rows = mappedFinancedProjects ?? [];
  if (!rows.length) {
    return { display: "—", sub: "—", percent: null };
  }

  let paidSum = 0;
  let totalSum = 0;
  let hasInstallmentData = false;

  rows.forEach((row) => {
    const paid = row.paidInstallments;
    const total = row.totalInstallments;
    if (paid != null && total != null && total > 0) {
      hasInstallmentData = true;
      paidSum += paid;
      totalSum += total;
    }
  });

  if (!hasInstallmentData || totalSum <= 0) {
    return { display: "—", sub: "—", percent: null };
  }

  const percent = Math.round((paidSum / totalSum) * 100);
  const overdueCount = rows.filter((p) => p.repaymentOverdue).length;

  let sub = `${paidSum}/${totalSum} installments completed`;
  if (overdueCount > 0) {
    sub += ` · ${overdueCount} project${overdueCount === 1 ? "" : "s"} overdue`;
  }

  return {
    display: `${percent}%`,
    sub,
    percent,
  };
}

/** investors/portfolio-score/ — percentage, score (e.g. "2/2"), overdue */
export function mapPortfolioScoreCard(raw) {
  const o = unwrapInvestorEnvelope(raw) ?? unwrapListOrObject(raw) ?? raw;

  const percent = firstNumber(o, [
    "percentage",
    "portfolio_score_percent",
    "score_percent",
  ]);
  const score = firstString(o, ["score"], "");
  const overdue = firstNumber(o, ["overdue", "overdue_count"], null);

  let display = "—";
  if (percent != null && !Number.isNaN(percent)) {
    display = `${Math.round(percent)}%`;
  }

  let sub = "—";
  if (score && score.includes("/")) {
    const overdueCount = overdue != null ? overdue : 0;
    sub =
      overdueCount > 0
        ? `${score} projects up to date - ${overdueCount} overdue`
        : `${score} projects up to date`;
  } else if (score) {
    sub = score;
  } else {
    sub = firstString(o, ["subtitle", "portfolio_score_subtitle"], "—");
  }

  const apiSummary = firstString(o, ["summary", "portfolio_score_summary"], "");
  const summary = apiSummary && apiSummary !== "—" ? apiSummary : sub;

  return {
    display,
    sub,
    summary,
    score: score || null,
    overdue: overdue != null ? overdue : null,
    percent: percent != null && !Number.isNaN(percent) ? Math.round(percent) : null,
  };
}

/** @deprecated Use mapPortfolioScoreCard */
export const mapRepaymentScoreCard = mapPortfolioScoreCard;

/** investors/me/co2-offset */
export function mapCo2Card(raw) {
  const o = unwrapListOrObject(raw) || raw;
  const tonnes =
    firstNumber(o, ["co2_tonnes", "co2_offset_tonnes", "tonnes", "t", "value"]) ??
    firstNumber(o?.data, ["co2_tonnes", "value"]);
  let value = "—";
  if (tonnes != null) value = `${tonnes.toLocaleString("en-NG", { maximumFractionDigits: 2 })} t`;
  else {
    const s = firstString(o, ["display", "summary"], "");
    if (s && s !== "—") value = s;
  }
  const sub = firstString(o, ["subtitle", "description"], "Portfolio aggregate");
  return { value, sub };
}

function formatProductionStatusLabel(rawStatus) {
  const s = String(rawStatus || "").trim();
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function mapProductionHealth(item) {
  const rawStatus = firstString(
    item,
    ["status", "production_health", "telemetry_health", "energy_status", "site_health", "yield_health"],
    ""
  );
  if (!rawStatus) {
    return { dot: "green", label: "—" };
  }

  const normalized = rawStatus.toLowerCase();
  let dot = "green";
  if (normalized.includes("under")) dot = "yellow";
  else if (normalized.includes("inactive") || normalized.includes("zero") || normalized === "red") {
    dot = "red";
  }

  return { dot, label: formatProductionStatusLabel(rawStatus) };
}

function formatNextPaymentDue(raw) {
  if (!raw) return "";
  const d = dayjs(raw);
  if (d.isValid()) return d.format("D MMM");
  return String(raw);
}

/** investors/financed-projects/ — portfolio Financed table */
export function mapFinancedProjectsTable(rows) {
  const list = unwrapListOrObject(rows);
  const arr = Array.isArray(list) ? list : list ? [list] : [];
  return arr.map((item, idx) => {
    const id =
      item.investment_id ??
      item.project_id ??
      item.id ??
      item.pk ??
      item.branch_id ??
      item.branchId ??
      idx;
    const installationTitle = firstString(
      item,
      ["name", "project_name", "title", "project", "installation_name"],
      "—"
    );
    const location = firstString(
      item,
      ["location", "installation_location", "city", "state", "site_location"],
      ""
    );
    const installationSub =
      humanLocationLabel(
        location,
        item.location_label,
        item.branch_label,
        firstString(item, ["branch_city_line", "location_line"], "")
      ) || "—";

    const health = mapProductionHealth(item);
    const statusPosted =
      firstString(item, ["last_posted", "last_posted_human", "last_posted_relative"], "") ||
      firstString(item, ["status_last_posted", "telemetry_last_posted"], "—");
    const lastPostedIso = firstString(item, ["last_posted_at", "updated_at", "modified_at"], "");

    const capacityKwp =
      firstNumber(item, ["capacity_kwp", "system_capacity_kwp", "system_kwp", "kwp", "system_size_kwp"]) ??
      null;

    const projectCostN =
      firstNumber(item, [
        "project_cost",
        "project_cost_ngn",
        "total_project_cost_ngn",
        "project_total_cost",
        "cost_ngn",
      ]) ?? null;
    const projectCostDisplay =
      projectCostN != null ? formatCompactNgn(projectCostN) : "—";

    const investedN =
      firstNumber(item, [
        "invested",
        "invested_amount",
        "amount_invested",
        "invested_ngn",
        "investor_invested",
        "your_investment",
        "investment_amount",
        "total_invested",
      ]) ?? null;
    const investedDisplay = investedN != null ? formatCompactNgn(investedN) : "—";

    const kpiRecoveryPct =
      firstNumber(item, ["recovery_percent"]) ??
      firstNumber(item?.kpi, ["recovery_percent"]) ??
      firstNumber(item?.cost_recovery, ["recovery_percent"]) ??
      null;
    const roiPct =
      firstNumber(item, ["roi_percent", "roi", "expected_roi_percent"]) ??
      firstNumber(item?.kpi, ["roi_percent"]) ??
      null;
    const kpiPaybackHuman =
      firstString(item, ["payback_label"], "") ||
      firstString(item?.kpi?.payback_approx, ["human"], "") ||
      firstString(item?.payback_estimate, ["human"], "");
    const kpiRemarkMain =
      roiPct != null
        ? `${roiPct}%`
        : kpiRecoveryPct != null
          ? `${kpiRecoveryPct}%`
          : kpiPaybackHuman || "—";
    const kpiRemarkSub =
      roiPct != null && kpiPaybackHuman
        ? kpiPaybackHuman
        : kpiRecoveryPct != null && kpiPaybackHuman
          ? kpiPaybackHuman
          : null;

    const energyKwh =
      firstNumber(item, [
        "energy_yield_kwh",
        "yield_kwh",
        "generation_kwh_ytd",
        "portfolio_generation_kwh",
      ]) ?? null;
    const energyValueN =
      firstNumber(item, [
        "energy_yield_value_naira",
        "energy_yield_value_ngn",
        "yield_value_ngn",
        "energy_value_ngn",
      ]) ?? null;
    const energyKwhDisplay =
      energyKwh != null
        ? energyKwh.toLocaleString("en-NG", { maximumFractionDigits: 0 })
        : "—";
    const energyValueDisplay =
      energyValueN != null ? `(${formatCompactNgn(energyValueN)})` : "—";

    const carbonN =
      firstNumber(item, ["carbon_offset_tonnes", "co2_offset_tonnes", "co2_tonnes", "tonnes"]) ??
      null;
    const carbonDisplay =
      carbonN != null
        ? `${carbonN.toLocaleString("en-NG", { maximumFractionDigits: 1 })} t`
        : "—";

    const paid =
      firstNumber(item, ["repayment_paid"]) ??
      firstNumber(item?.repayment_score, ["paid_installments"]) ??
      firstNumber(item, ["repayment_installments_paid", "installments_paid"]);
    const totalInst =
      firstNumber(item, ["repayment_total"]) ??
      firstNumber(item?.repayment_score, ["total_installments"]) ??
      firstNumber(item, ["repayment_installments_total", "installments_total"]);
    const pct = firstNumber(item, ["repayment_percent_completed", "repayment_pct"]);
    let repaymentMain = "—";
    if (paid != null && totalInst != null && totalInst > 0) {
      const p = pct != null ? pct : Math.round((paid / totalInst) * 100);
      repaymentMain = `${String(paid).padStart(2, "0")}/${totalInst} (${p}% completed)`;
    } else {
      const preset = firstString(item, ["repayment_score_display"], "");
      if (preset) repaymentMain = preset;
    }

    const overdueInstallmentDue = item.overdue_installment_due;
    const paymentHealth = String(item.payment_health || "").toLowerCase();
    const overdue =
      (overdueInstallmentDue != null && overdueInstallmentDue !== "") ||
      Boolean(item.repayment_overdue) ||
      paymentHealth === "overdue" ||
      paymentHealth === "past_due";
    const nextDueRaw = firstString(item, ["next_payment_due", "next_due_date"], "");
    const nextDueLabel = formatNextPaymentDue(nextDueRaw);
    const overdueLabel = formatNextPaymentDue(overdueInstallmentDue);

    let repaymentSub = "—";
    if (overdue && overdueLabel) repaymentSub = `Overdue: ${overdueLabel}`;
    else if (overdue) repaymentSub = "Overdue";
    else if (nextDueLabel) repaymentSub = `Next payment: ${nextDueLabel}`;
    else if (kpiPaybackHuman) repaymentSub = `Payback: ${kpiPaybackHuman}`;

    const repaymentOverdue = overdue || paymentHealth === "overdue";

    const needsAttention =
      health.dot !== "green" || repaymentOverdue || paymentHealth === "overdue";
    const isOnTrack =
      health.dot === "green" &&
      !repaymentOverdue &&
      (paymentHealth === "on_track" || paymentHealth === "on track" || paymentHealth === "");

    return {
      key: String(id),
      installationTitle,
      installationSub,
      healthDot: health.dot,
      healthLabel: health.label,
      statusPosted,
      lastPostedIso,
      capacityKwp: capacityKwp != null ? String(capacityKwp) : "—",
      projectCostDisplay,
      investedDisplay,
      investedNgn: investedN,
      kpiRemarkMain,
      kpiRemarkSub,
      energyKwhDisplay,
      energyValueDisplay,
      energyValueNgn: energyValueN,
      carbonDisplay,
      repaymentMain,
      repaymentSub,
      paidInstallments: paid,
      totalInstallments: totalInst,
      repaymentOverdue,
      needsAttention,
      isOnTrack,
      project: installationTitle,
      branch: installationSub,
    };
  });
}

/** investors/me/performance-snapshot/ */
export function mapPerformanceSnapshotChart(raw) {
  const o = unwrapListOrObject(raw) || raw;
  const weeks = Array.isArray(o?.weeks) ? o.weeks : Array.isArray(o?.data?.weeks) ? o.data.weeks : [];
  if (!weeks.length) return [];
  return weeks.map((row, i) => {
    const bucket = firstNumber(row, ["bucket"]) ?? i + 1;
    const label = `W${bucket}`;
    const solar =
      firstNumber(row, ["generation_kwh", "generation", "solar_generation", "solar_kwh", "solar"]) ??
      0;
    const site =
      firstNumber(row, ["load_kwh", "load", "site_load", "site_load_proxy", "site"]) ?? 0;
    return { week: label, solar, site };
  });
}

function formatActivityAmount(amountRaw, row) {
  let amount = "—";
  let isBad = false;
  if (amountRaw === null || amountRaw === undefined || amountRaw === "") {
    amount = firstString(row, ["amount_display", "display"], "—");
  } else if (typeof amountRaw === "string" && /^no$/i.test(amountRaw.trim())) {
    amount = amountRaw;
    isBad = true;
  } else {
    const n = Number(amountRaw);
    if (!Number.isNaN(n)) {
      if (n <= 0) {
        amount = n === 0 ? "NO" : `₦${n.toLocaleString("en-NG")}`;
        isBad = n < 0;
      } else {
        amount = `+ ₦${n.toLocaleString("en-NG")}`;
      }
    } else {
      amount = String(amountRaw);
    }
  }
  if (/^no$/i.test(String(amount).trim())) isBad = true;
  return { amount, isBad };
}

function mapActivityRow(row, idx) {
  const key = String(
    row.id ?? row.disbursement_id ?? row.payout_id ?? row.payment_id ?? `${row.payment_date}-${idx}`
  );
  const dateRaw =
    row.payment_date ??
    row.date ??
    row.paid_date ??
    row.posted_at ??
    row.created_at ??
    row.day;
  const date =
    dateRaw && dayjs(dateRaw).isValid()
      ? dayjs(dateRaw).format("DD MMM")
      : firstString(row, ["date_display", "date", "day"], "—");

  const projectName = firstString(row, ["project_name", "project", "installation_name"], "");
  let label = firstString(row, ["description", "label", "memo"], "");
  if (!label || label === "—") {
    const eventType = firstString(row, ["event_type", "type"], "Payout");
    label =
      projectName && projectName !== "—"
        ? `${eventType} · ${projectName}`
        : eventType;
  }

  const amountRaw =
    row.your_amount ??
    row.amount_received ??
    row.amount_paid ??
    row.your_allocation ??
    row.your_credit ??
    row.amount ??
    row.credit ??
    row.value;
  const { amount, isBad } = formatActivityAmount(amountRaw, row);
  return { key, date, label, amount, isBad };
}

function activityRowsFromPayload(raw) {
  const envelope = unwrapInvestorEnvelope(raw);
  if (Array.isArray(envelope)) return envelope;
  if (Array.isArray(envelope?.payments)) return envelope.payments;
  if (Array.isArray(envelope?.activities)) return envelope.activities;
  if (Array.isArray(envelope?.results)) return envelope.results;
  if (Array.isArray(envelope?.items)) return envelope.items;
  const list = unwrapListOrObject(raw);
  return Array.isArray(list) ? list : [];
}

export function mapRecentPaymentActivity(raw) {
  return activityRowsFromPayload(raw).map(mapActivityRow);
}

export function mapNotificationsToAlert(notificationsRaw) {
  const list = unwrapListOrObject(notificationsRaw);
  const arr = Array.isArray(list) ? list : [];
  const first = arr[0];
  if (!first) return null;
  const message =
    first.message ??
    first.body ??
    first.detail ??
    first.text ??
    firstString(first, ["title"], null);
  if (!message) return null;
  const type = String(first.level || first.severity || "warning").toLowerCase();
  const alertType =
    type === "error" || type === "danger"
      ? "error"
      : type === "success"
        ? "success"
        : type === "info"
          ? "info"
          : "warning";
  return { type: alertType, message: String(message) };
}
