import {
  firstNumber,
  firstString,
  formatCompactNgn,
  unwrapListOrObject,
} from "./investorPortfolioMappers";

function unwrapApiData(body) {
  if (body == null) return null;
  if (body.status === false) return null;
  return body.data != null ? body.data : body;
}

function listFromPaged(data) {
  const inner = unwrapApiData(data) ?? data;
  if (Array.isArray(inner)) return inner;
  if (Array.isArray(inner?.results)) return inner.results;
  return unwrapListOrObject(inner) || [];
}

function formatGenerationYtdDisplay(genData) {
  const mwhVal = firstNumber(genData, ["value"]);
  const unit = firstString(genData, ["unit"], "MWh");
  if (mwhVal == null) {
    const kwh = firstNumber(genData, [
      "portfolio_generation_ytd_kwh",
      "generation_kwh",
      "kwh",
    ]);
    if (kwh == null) return null;
    const mwh = kwh / 1000;
    if (mwh >= 1000) return `${(mwh / 1000).toFixed(1)}k MWh`;
    if (mwh >= 10) return `${mwh.toFixed(1)} MWh`;
    return `${mwh.toFixed(2)} MWh`;
  }
  const u = unit.toLowerCase();
  if (u === "mwh") {
    if (mwhVal >= 1000) return `${(mwhVal / 1000).toFixed(1)}k MWh`;
    if (mwhVal >= 10) return `${mwhVal.toFixed(1)} MWh`;
    if (mwhVal >= 1) return `${mwhVal.toFixed(1)} MWh`;
    return `${mwhVal.toFixed(2)} MWh`;
  }
  return `${mwhVal.toLocaleString("en-NG", { maximumFractionDigits: 1 })} ${unit}`;
}

/** KPI cards on Projects page (dedicated kpi/* endpoints). */
export function mapProjectsPageSummary({
  activeProjectsRaw,
  portfolioCapacityRaw,
  portfolioGenerationYtdRaw,
  attentionRaw,
}) {
  const activeData = unwrapApiData(activeProjectsRaw) ?? activeProjectsRaw;
  const capData = unwrapApiData(portfolioCapacityRaw) ?? portfolioCapacityRaw;
  const genData = unwrapApiData(portfolioGenerationYtdRaw) ?? portfolioGenerationYtdRaw;
  const attentionData = unwrapApiData(attentionRaw) ?? attentionRaw;

  const activeProjects =
    firstNumber(activeData, ["value", "active_projects", "activeProjects", "count"]) ??
    null;

  const portfolioAcKwp =
    firstNumber(capData, [
      "value_kwp",
      "portfolio_ac_capacity_kwp",
      "portfolioAcCapacityKwp",
      "capacity_kwp",
      "kwp",
      "value",
    ]) ?? null;

  const portfolioGenerationYtdDisplay = formatGenerationYtdDisplay(genData);

  const attentionCount =
    firstNumber(attentionData, ["value", "count", "attention_count"]) ?? null;

  return {
    activeProjects,
    portfolioAcKwp:
      portfolioAcKwp != null
        ? Number(portfolioAcKwp).toLocaleString("en-NG", { maximumFractionDigits: 1 })
        : null,
    portfolioGenerationYtdDisplay,
    attentionCount,
  };
}

function formatOpenProjectStatus(item) {
  const statusRaw = firstString(item, ["status"], "");
  if (statusRaw) {
    return statusRaw
      .replace(/_/g, " ")
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }
  if (item.is_available != null) {
    return item.is_available ? "Available" : "—";
  }
  return "—";
}

/** investors/projects/open/ */
export function mapOpenProjectsList(raw) {
  return listFromPaged(raw).map((item) => {
    const id = item.project_id ?? item.id;

    const target =
      firstNumber(item, ["investor_target", "investor_funding_target", "investorTarget"]) ?? 0;
    const remaining =
      firstNumber(item, ["remaining", "investor_funding_remaining", "remaining_ngn"]) ?? 0;

    let raised =
      firstNumber(item, ["raised", "investor_funding_raised", "amount_raised"]) ?? null;
    if (raised == null && target > 0 && remaining >= 0) {
      raised = target - remaining;
    }
    if (raised == null || Number.isNaN(raised)) raised = 0;

    const raisedPctFromApi = firstNumber(item, ["raised_percent", "raised_pct", "raisedPercent"]);
    const raisedPct =
      raisedPctFromApi != null
        ? Math.round(raisedPctFromApi)
        : target > 0
          ? Math.round((raised / target) * 100)
          : null;

    const systemKwp =
      firstNumber(item, ["capacity_kwp", "system_capacity_kwp", "system_kwp", "kwp"]) ?? "—";

    const totalCostNgn =
      firstNumber(item, ["total_cost", "total_project_cost", "project_cost"]) ?? 0;

    const clientContributionNgn =
      firstNumber(item, ["client_contribution", "client_contribution_ngn"]) ?? 0;

    const loc = [item.branch_label, item.location_label, item.location, item.city]
      .filter(Boolean)
      .join(" · ");

    const statusRaw = firstString(item, ["status"], "").toLowerCase();
    const isAvailable =
      item.is_available != null
        ? Boolean(item.is_available)
        : statusRaw === "available" || statusRaw === "";

    return {
      id: String(id),
      projectId: id,
      name: firstString(item, ["name", "project_name"], "—"),
      status: formatOpenProjectStatus(item),
      summaryLine: loc ? `Remaining: ${formatCompactNgn(remaining)} · ${loc}` : undefined,
      remainingNgn: remaining,
      investorTargetNgn: target,
      raisedNgn: raised,
      systemKwp,
      totalCostNgn,
      clientContributionNgn,
      raisedPct,
      locationLabel: item.location_label || item.location,
      branchLabel: item.branch_label,
      projectType: item.project_type,
      isAvailable,
      footerLeft: "Open project detail for cost breakdown",
    };
  });
}

/** investors/investment-tickets/ */
export function mapInvestmentTicketsList(raw) {
  return listFromPaged(raw).map((item) => {
    const subject = item.subject || "";
    const projectMatch = subject.match(/project #\d+\s*—\s*(.+?)(?:\]|$)/i);
    return {
      id: String(item.ticket_id ?? item.id),
      ticketId: item.ticket_id ?? item.id,
      subject,
      projectName: projectMatch?.[1]?.trim() || subject.replace(/^\[INVESTMENT\]\s*/i, ""),
      status: item.status || "Pending",
      priority: item.priority,
      createdAt: item.created_at,
      amountIntendedNgn: null,
      message: null,
      repaymentPreference: null,
    };
  });
}

/** investors/projects/:id/ — cost breakdown for modal */
export function mapProjectDetail(raw) {
  const item = unwrapApiData(raw) ?? raw;
  if (!item || typeof item !== "object") return null;

  const breakdown = item.project_cost_breakdown;
  const items = Array.isArray(breakdown?.items) ? breakdown.items : [];

  return {
    projectId: item.project_id ?? item.id,
    name: firstString(item, ["name", "project_name"], "—"),
    breakdownItems: items.map((row) => ({
      key: `${row.category}-${row.label}`,
      category: row.category,
      label: row.label,
      amount: Number(row.amount),
      amountDisplay: formatCompactNgn(row.amount),
    })),
    totalBreakdown: breakdown?.total_breakdown,
    totalsByCategory: breakdown?.totals_by_category || {},
    ...mapOpenProjectsList({ results: [item] })[0],
  };
}

function formatProjectsFinancedStatus(raw) {
  const s = String(raw || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .trim();
  if (!s) return "Active";
  return s
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Financed project cards on Projects tab (GET investors/projects/financed/). */
export function mapFinancedProjectsTiles(raw) {
  const list = listFromPaged(raw);
  return list.map((item, idx) => {
    const id =
      item.investment_id ??
      item.project_id ??
      item.id ??
      item.pk ??
      idx;

    const name = firstString(item, ["name", "project_name", "installation_name"], "—");
    const branchLabel = firstString(item, ["location", "branch_label", "branchLabel"], "—");

    const paymentHealth = String(item.payment_health || item.repayment_status || "").toLowerCase();
    let status = formatProjectsFinancedStatus(
      firstString(item, ["status", "investment_status"], "active")
    );
    if (paymentHealth.includes("overdue") || item.repayment_overdue || item.overdue_installment_due) {
      status = "Overdue";
    } else if (paymentHealth.includes("review")) {
      status = "Review";
    }

    const sharePct =
      firstNumber(item, ["share_percent", "your_share_percent", "share_pct", "investor_share_pct"]) ??
      null;

    const systemKwp =
      firstNumber(item, ["capacity_kwp", "system_capacity_kwp", "system_kwp", "kwp"]) ?? "—";

    const projectCostNgn =
      firstNumber(item, ["project_cost", "project_cost_ngn", "total_project_cost"]) ?? 0;

    const investedNgn =
      firstNumber(item, [
        "invested",
        "invested_amount",
        "amount_invested",
        "invested_ngn",
        "investor_amount",
      ]) ?? 0;

    const mtdMwhVal = firstNumber(item, [
      "mtd_generation_mwh",
      "mtd_generation_mwh_ytd",
    ]);
    let mtdMwh = "—";
    if (mtdMwhVal != null) {
      mtdMwh =
        mtdMwhVal >= 10
          ? mtdMwhVal.toFixed(1)
          : mtdMwhVal.toFixed(2);
    } else {
      const energyKwh = firstNumber(item, ["energy_yield_kwh", "mtd_generation_kwh"]);
      if (energyKwh != null) mtdMwh = (energyKwh / 1000).toFixed(1);
    }

    const paidInstallments = firstNumber(item, ["repayment_paid"]);
    const totalInstallments = firstNumber(item, ["repayment_total"]);
    const repaymentDisplay =
      paidInstallments != null && totalInstallments != null
        ? `${paidInstallments}/${totalInstallments}`
        : "—";

    const estSavingsMtd = firstNumber(item, ["est_savings_mtd", "est_savings_mtd_ngn"]);
    const footerLeft =
      estSavingsMtd != null
        ? `Est. savings (MTD) ${formatCompactNgn(estSavingsMtd)}`
        : "—";

    const overdue =
      status.toLowerCase() === "overdue" ||
      paymentHealth.includes("overdue") ||
      (item.overdue_installment_due != null && item.overdue_installment_due !== "");

    const contractStart =
      firstString(item, ["contract_start_label", "contract_start_display"], "") ||
      (item.contract_start
        ? `Contract start · ${firstString(item, ["contract_start"], "")}`
        : "");

    return {
      id: String(id),
      investmentId: item.investment_id ?? item.id ?? id,
      name,
      status,
      branchLabel,
      contractStart,
      sharePct: sharePct ?? "—",
      systemKwp,
      projectCostNgn,
      investedNgn,
      mtdMwh,
      repaymentDisplay,
      footerLeft,
      footerLink: overdue ? "View receivables →" : "Payment schedule →",
      repaymentOverdue: overdue,
    };
  });
}
