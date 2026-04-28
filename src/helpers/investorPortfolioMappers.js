/**
 * Normalizes investor portfolio API payloads into UI-friendly shapes.
 * Backend field names may vary — extend these helpers when the contract is finalized.
 */

export function unwrapListOrObject(payload) {
  if (payload == null) return null;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  if (payload.data != null) return unwrapListOrObject(payload.data);
  if (payload.authenticatedData != null) return unwrapListOrObject(payload.authenticatedData);
  return payload;
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

/** investors/total-invested */
export function mapTotalInvestedCard(raw) {
  const o = unwrapListOrObject(raw) || raw;
  const amount =
    firstNumber(o, [
      "total_invested",
      "total_invested_ngn",
      "totalInvested",
      "amount",
      "value",
    ]) ?? firstNumber(o?.data, ["total_invested", "amount"]);
  const activeProjects = firstNumber(o, ["active_projects", "activeProjects", "project_count"]);
  const sub =
    activeProjects != null
      ? `Across ${activeProjects} active project${activeProjects === 1 ? "" : "s"}`
      : firstString(o, ["subtitle", "description", "detail"], "—");
  return { amount, sub };
}

/** investors/portfolio-generation */
export function mapPortfolioGenerationCard(raw) {
  const o = unwrapListOrObject(raw) || raw;
  const kwh =
    firstNumber(o, [
      "portfolio_generation_kwh",
      "kwh",
      "total_kwh",
      "generation_kwh",
      "value",
    ]) ?? firstNumber(o?.data, ["portfolio_generation_kwh", "kwh", "total_kwh"]);
  let value = "—";
  if (kwh != null) {
    if (kwh >= 1e6) value = `${(kwh / 1e6).toFixed(2)}M kWh`;
    else if (kwh >= 1e3) value = `${(kwh / 1e3).toFixed(1)}k kWh`;
    else value = `${kwh.toLocaleString("en-NG")} kWh`;
  } else {
    const preset = firstString(o, ["display", "label", "summary"], "");
    if (preset && preset !== "—") value = preset;
  }
  const ngnVal =
    firstNumber(o, [
      "portfolio_generation_value_ngn",
      "generation_value_ngn",
      "energy_value_ngn",
      "yield_value_ngn",
      "value_ngn",
    ]) ?? firstNumber(o?.data, ["generation_value_ngn", "value_ngn"]);
  const nairaSub = ngnVal != null ? `(${formatCompactNgn(ngnVal)})` : null;
  const sub = firstString(o, ["period_label", "subtitle", "description"], "Cumulative (period)");
  return { value, sub, nairaSub };
}

/** investors/me/repayment-totals */
export function mapRepaymentTotalsCard(raw) {
  const o = unwrapListOrObject(raw) || raw;
  const received =
    firstNumber(o, ["repayments_received", "total_repayments", "lifetime_total", "amount", "value"]) ??
    firstNumber(o?.data, ["repayments_received", "total", "amount"]);
  const outstanding =
    firstNumber(o, ["outstanding", "outstanding_amount", "outstanding_total"]) ??
    firstNumber(o?.data, ["outstanding"]);
  const sub = firstString(o, ["subtitle", "description", "period", "detail"], "Lifetime to date");
  return { received, outstanding, sub };
}

/**
 * Primary purple card: total invested + lines for payments received & outstanding.
 */
export function mapPrimaryInvestedCard(totalRaw, repaymentTotalsRaw) {
  const total = mapTotalInvestedCard(totalRaw);
  const repay = mapRepaymentTotalsCard(repaymentTotalsRaw);
  return {
    amount: total.amount,
    paymentsReceived: repay.received,
    outstanding: repay.outstanding,
  };
}

/** Repayment score KPI: "26/72" + "26 months remitted · 72 remaining" */
export function mapRepaymentScoreCard(raw) {
  const o = unwrapListOrObject(raw) || raw;
  const scoreStr = firstString(o, ["repayment_score", "repayment_score_display", "score"], "");
  const remitted = firstNumber(o, [
    "months_remitted",
    "repayment_months_remitted",
    "installments_paid",
    "paid_installments",
  ]);
  const remaining = firstNumber(o, [
    "months_remaining",
    "repayment_months_remaining",
    "remaining_installments",
  ]);
  const totalMonths = firstNumber(o, ["schedule_months_total", "total_schedule_months", "tenor_months"]);

  let display = "—";
  if (scoreStr && /\d/.test(scoreStr)) display = scoreStr.replace(/\s/g, "");
  else if (remitted != null && totalMonths != null) display = `${remitted}/${totalMonths}`;
  else if (remitted != null && remaining != null) display = `${remitted}/${remitted + remaining}`;

  let sub = "—";
  if (remitted != null && remaining != null) {
    sub = `${remitted} months remitted · ${remaining} remaining`;
  } else {
    sub = firstString(o, ["repayment_score_subtitle", "score_subtitle", "subtitle"], "—");
  }

  return { display, sub };
}

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

function mapProductionHealth(item) {
  // Backend shape (current): daytime_performance.ratio where < 0.7 => underperforming.
  // If last_posted_at is null and no daytime generation/load, treat as inactive/no data.
  const ratioRaw = item?.daytime_performance?.ratio;
  const ratio = ratioRaw == null ? null : Number(ratioRaw);
  if (ratio != null && !Number.isNaN(ratio)) {
    if (ratio < 0.7) return { dot: "yellow", label: "Underperforming" };
    return { dot: "green", label: "Active" };
  }

  const gen = Number(item?.daytime_performance?.daytime_generation_kwh ?? NaN);
  const load = Number(item?.daytime_performance?.daytime_load_kwh ?? NaN);
  const noEnergy = (!Number.isNaN(gen) && gen === 0) && (!Number.isNaN(load) && load === 0);
  const lastPostedAt = item?.last_posted_at ?? item?.last_postedAt ?? null;
  if (!lastPostedAt && noEnergy) return { dot: "red", label: "Inactive" };

  // Fallback to any textual status field.
  const raw = firstString(
    item,
    ["production_health", "telemetry_health", "energy_status", "site_health", "yield_health"],
    ""
  ).toLowerCase();
  if (raw.includes("under")) return { dot: "yellow", label: "Underperforming" };
  if (raw.includes("inactive") || raw.includes("zero") || raw === "red") return { dot: "red", label: "Inactive" };
  return { dot: "green", label: "Active" };
}

/** investors/me/financed-projects/ — portfolio table (installation, status, capacity, cost, yield, CO₂, repayment). */
export function mapFinancedProjectsTable(rows) {
  const list = unwrapListOrObject(rows);
  const arr = Array.isArray(list) ? list : list ? [list] : [];
  return arr.map((item, idx) => {
    const id =
      item.investment_id ??
      item.id ??
      item.pk ??
      item.branch_id ??
      item.branchId ??
      idx;
    const installationTitle = firstString(
      item,
      ["project_name", "name", "title", "project", "installation_name"],
      "—"
    );
    const location = firstString(
      item,
      ["installation_location", "location", "city", "state", "site_location"],
      ""
    );
    const branchLabel = firstString(item, ["branch_label", "branchLabel"], "");
    const installationSub =
      location ||
      branchLabel ||
      firstString(item, ["branch_city_line", "location_line"], "—");

    const health = mapProductionHealth(item);
    const statusPosted =
      firstString(item, ["last_posted_human", "last_posted_relative"], "") ||
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

    const kpiRecoveryPct =
      firstNumber(item?.kpi, ["recovery_percent"]) ??
      firstNumber(item?.cost_recovery, ["recovery_percent"]) ??
      null;
    const kpiPaybackHuman =
      firstString(item?.kpi?.payback_approx, ["human"], "") ||
      firstString(item?.payback_estimate, ["human"], "");
    const kpiRemarkMain =
      kpiRecoveryPct != null ? `${kpiRecoveryPct}%` : kpiPaybackHuman || "—";
    const kpiRemarkSub =
      kpiRecoveryPct != null && kpiPaybackHuman ? kpiPaybackHuman : null;

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
      firstNumber(item?.repayment_score, ["paid_installments"]) ??
      firstNumber(item, ["repayment_installments_paid", "installments_paid", "repayments_paid_count"]);
    const totalInst =
      firstNumber(item?.repayment_score, ["total_installments"]) ??
      firstNumber(item, ["repayment_installments_total", "installments_total", "schedule_installments"]);
    const remainingInst =
      firstNumber(item?.repayment_score, ["remaining_installments"]) ??
      firstNumber(item, ["remaining_installments", "repayment_months_remaining"]);
    const pct = firstNumber(item, ["repayment_percent_completed", "repayment_pct", "percent_completed"]);
    let repaymentMain = "—";
    if (paid != null && totalInst != null) {
      const p = pct != null ? pct : Math.round((paid / totalInst) * 100);
      repaymentMain = `${paid}/${totalInst} (${p}% completed)`;
    } else {
      const preset = firstString(item, ["repayment_score_display", "repayment_score"], "");
      if (preset) repaymentMain = preset;
    }

    const nextPaymentLine = firstString(item, ["next_payment_line", "next_payment_label", "next_payment_due_display"], "");
    const overdue =
      Boolean(item.repayment_overdue) ||
      String(item.payment_health || "").toLowerCase() === "overdue" ||
      String(item.payment_health || "").toLowerCase() === "past_due";
    const nextDueRaw = firstString(item, ["next_payment_due", "next_due_date"], "");
    const paybackHuman =
      firstString(item?.payback_estimate, ["human"], "") ||
      firstString(item?.kpi?.payback_approx, ["human"], "");
    const recoveryPct =
      firstNumber(item?.cost_recovery, ["recovery_percent"]) ??
      firstNumber(item?.kpi, ["recovery_percent"]);
    let repaymentSub = "—";
    if (overdue && nextDueRaw) repaymentSub = `Overdue: ${nextDueRaw}`;
    else if (overdue) repaymentSub = "Overdue";
    else if (nextPaymentLine) repaymentSub = nextPaymentLine;
    else if (nextDueRaw) repaymentSub = `Next payment: ${nextDueRaw}`;
    else if (paybackHuman) repaymentSub = `Payback: ${paybackHuman}`;
    else if (recoveryPct != null) repaymentSub = `Recovery: ${recoveryPct}%`;
    else if (remainingInst != null && remainingInst !== 0) repaymentSub = `${remainingInst} remaining`;

    const paymentHealth = String(item.payment_health || "").toLowerCase();
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
      kpiRemarkMain,
      kpiRemarkSub,
      energyKwhDisplay,
      energyValueDisplay,
      carbonDisplay,
      repaymentMain,
      repaymentSub,
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

/** investors/me/recent-payment-activity/ */
export function mapRecentPaymentActivity(raw) {
  const list = unwrapListOrObject(raw);
  const arr = Array.isArray(list) ? list : [];
  return arr.map((row, idx) => {
    const key = String(row.id ?? idx);
    const date = firstString(row, ["date", "posted_at", "created_at", "day"], "—");
    const label = firstString(row, ["description", "label", "type", "memo"], "—");
    const amountRaw = row.amount ?? row.credit ?? row.value;
    let amount = "—";
    let isBad = false;
    if (amountRaw === null || amountRaw === undefined || amountRaw === "") {
      amount = firstString(row, ["amount_display", "display"], "—");
    } else if (typeof amountRaw === "string") {
      amount = amountRaw;
      if (/^no$/i.test(amountRaw.trim())) isBad = true;
    } else {
      const n = Number(amountRaw);
      if (!Number.isNaN(n)) {
        if (n <= 0) {
          amount = n === 0 ? "NO" : `₦${n.toLocaleString("en-NG")}`;
          isBad = n < 0;
        } else {
          amount = `+ ₦${n.toLocaleString("en-NG")}`;
        }
      }
    }
    if (/^no$/i.test(String(amount).trim())) isBad = true;
    return { key, date, label, amount, isBad };
  });
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
