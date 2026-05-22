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

/** KPI cards + attention count derived from financed rows. */
export function mapProjectsPageSummary({
  activeProjectsRaw,
  portfolioCapacityRaw,
  portfolioGenerationYtdRaw,
  financedRows = [],
}) {
  const activeData = unwrapApiData(activeProjectsRaw) ?? activeProjectsRaw;
  const capData = unwrapApiData(portfolioCapacityRaw) ?? portfolioCapacityRaw;
  const genData = unwrapApiData(portfolioGenerationYtdRaw) ?? portfolioGenerationYtdRaw;

  const activeProjects =
    firstNumber(activeData, ["active_projects", "activeProjects", "count"]) ?? null;

  const portfolioAcKwp =
    firstNumber(capData, [
      "portfolio_ac_capacity_kwp",
      "portfolioAcCapacityKwp",
      "capacity_kwp",
      "kwp",
    ]) ?? null;

  const portfolioGenerationYtdKwh =
    firstNumber(genData, [
      "portfolio_generation_ytd_kwh",
      "portfolioGenerationYtdKwh",
      "generation_kwh",
      "kwh",
    ]) ?? null;

  const attentionCount = financedRows.filter((p) => {
    const s = String(p.status || "").toLowerCase();
    return s.includes("overdue") || s.includes("review") || p.repaymentOverdue;
  }).length;

  return {
    activeProjects,
    portfolioAcKwp:
      portfolioAcKwp != null
        ? Number(portfolioAcKwp).toLocaleString("en-NG", { maximumFractionDigits: 1 })
        : null,
    portfolioGenerationYtdKwh,
    attentionCount,
  };
}

/** investors/projects/open/ */
export function mapOpenProjectsList(raw) {
  return listFromPaged(raw).map((item) => {
    const id = item.project_id ?? item.id;
    const target = Number(item.investor_funding_target);
    const raised = Number(item.investor_funding_raised);
    const remaining = Number(item.investor_funding_remaining);
    const raisedPct =
      target > 0 && !Number.isNaN(raised) ? Math.round((raised / target) * 100) : null;

    const loc = [item.branch_label, item.location_label, item.city].filter(Boolean).join(" · ");

    return {
      id: String(id),
      projectId: id,
      name: item.project_name || item.name || "—",
      status: item.is_available ? "Available" : firstString(item, ["status"], "—"),
      summaryLine: loc ? `Remaining: ${formatCompactNgn(remaining)} · ${loc}` : undefined,
      remainingNgn: Number.isNaN(remaining) ? 0 : remaining,
      investorTargetNgn: Number.isNaN(target) ? 0 : target,
      raisedNgn: Number.isNaN(raised) ? 0 : raised,
      systemKwp: Number(item.system_capacity_kwp) || item.system_capacity_kwp || "—",
      totalCostNgn: Number(item.total_project_cost) || 0,
      clientContributionNgn: Number(item.client_contribution) || 0,
      raisedPct,
      locationLabel: item.location_label,
      branchLabel: item.branch_label,
      projectType: item.project_type,
      isAvailable: Boolean(item.is_available),
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
    name: item.project_name,
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

/** Financed project cards on Projects tab (from financed-projects/). */
export function mapFinancedProjectsTiles(raw) {
  const list = listFromPaged(raw);
  return list.map((item, idx) => {
    const id =
      item.investment_id ??
      item.project_id ??
      item.id ??
      item.pk ??
      idx;

    const name = firstString(item, ["project_name", "name", "installation_name"], "—");
    const branch = firstString(item, ["branch_label", "branchLabel"], "");
    const city = firstString(item, ["city", "location_label", "location"], "");
    const branchLabel = [branch, city].filter(Boolean).join(" · ") || "—";

    const paymentHealth = String(item.payment_health || item.repayment_status || "").toLowerCase();
    let status = firstString(item, ["investment_status", "status"], "active").replace(/_/g, " ");
    if (paymentHealth.includes("overdue") || item.repayment_overdue) status = "Overdue";
    else if (paymentHealth.includes("review")) status = "Review";

    const sharePct =
      firstNumber(item, ["your_share_percent", "share_percent", "share_pct", "investor_share_pct"]) ??
      null;

    const systemKwp =
      firstNumber(item, ["capacity_kwp", "system_capacity_kwp", "system_kwp", "kwp"]) ?? "—";

    const projectCostNgn =
      firstNumber(item, ["project_cost", "project_cost_ngn", "total_project_cost"]) ??
      firstNumber(item?.cost_recovery, ["project_cost_naira"]) ??
      0;

    const investedNgn =
      firstNumber(item, [
        "invested_amount",
        "amount_invested",
        "invested_ngn",
        "investor_amount",
        "your_investment_ngn",
        "total_invested",
      ]) ?? 0;

    const energyKwh = firstNumber(item, [
      "energy_yield_kwh",
      "mtd_generation_kwh",
      "generation_mtd_kwh",
    ]);
    const mtdMwh =
      energyKwh != null ? Number((energyKwh / 1000).toFixed(1)) : null;

    const paidInstallments = firstNumber(item?.repayment_score, ["paid_installments"]);
    const totalInstallments = firstNumber(item?.repayment_score, ["total_installments"]);
    const repaymentDisplay =
      paidInstallments != null && totalInstallments != null
        ? `${paidInstallments}/${totalInstallments}`
        : "—";

    const overdue = status.toLowerCase() === "overdue" || paymentHealth.includes("overdue");

    return {
      id: String(id),
      name,
      status,
      branchLabel,
      contractStart:
        firstString(item, ["contract_start_label", "contract_start_display"], "") ||
        (item.contract_start
          ? `Contract start · ${firstString(item, ["contract_start"], "")}`
          : firstString(item, ["financed_since", "investment_date"], "—")),
      sharePct: sharePct ?? "—",
      systemKwp,
      projectCostNgn,
      investedNgn,
      mtdMwh: mtdMwh != null ? String(mtdMwh) : "—",
      repaymentDisplay,
      footerLeft:
        firstString(item, ["savings_mtd_label", "est_savings_mtd"], "") ||
        (item.energy_yield_value_naira
          ? `Est. savings (MTD) ${formatCompactNgn(item.energy_yield_value_naira)}`
          : "—"),
      footerLink: overdue ? "View receivables →" : "Payment schedule →",
      repaymentOverdue: overdue,
    };
  });
}
