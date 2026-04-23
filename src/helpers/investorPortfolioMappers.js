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
  const sub = firstString(o, ["period_label", "subtitle", "description"], "Cumulative (period)");
  return { value, sub };
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

/** investors/me/financed-projects/ */
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
    const project =
      firstString(item, ["project_name", "name", "title", "project"], "—");
    const branchIdRaw = item.branch_id ?? item.branchId ?? item.branch;
    const branchId =
      branchIdRaw != null && branchIdRaw !== "" ? String(branchIdRaw) : "";
    const location = firstString(item, ["location", "state", "city"], "");
    const branch =
      [branchId && `Branch ID ${branchId}`, location].filter(Boolean).join(" · ") ||
      firstString(item, ["branch_label", "branchLabel"], "—");
    const systemKw =
      firstNumber(item, [
        "system_capacity_kwp",
        "system_kwp",
        "capacity_kwp",
        "kwp",
        "system_size_kwp",
      ]) ??
      firstNumber(item, ["system_kw", "capacity_kw"]);
    const system =
      systemKw != null ? `${systemKw} kWp` : firstString(item, ["system", "system_display"], "—");
    const shareNum =
      firstNumber(item, [
        "your_share_percent",
        "your_share_pct",
        "share_pct",
        "share_percent",
        "investor_share",
      ]) ??
      null;
    const share = shareNum != null ? `${shareNum}%` : firstString(item, ["share", "your_share"], "—");
    const investedN =
      firstNumber(item, [
        "invested_amount",
        "invested_ngn",
        "invested",
        "amount_invested",
        "investment_amount",
      ]) ??
      null;
    const invested =
      investedN != null
        ? `₦${investedN.toLocaleString("en-NG")}`
        : firstString(item, ["invested_display", "invested"], "—");
    const status = firstString(
      item,
      ["payment_health", "investment_status", "status", "health", "payment_status"],
      "—"
    );
    return {
      key: String(id),
      project,
      branch,
      system,
      share,
      invested,
      status,
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
