import dayjs from "dayjs";

function stamp() {
  return dayjs().format("YYYY-MM-DD");
}

function pushMetricRows(rows, section, metrics = []) {
  metrics.forEach(({ label, value, sub }) => {
    rows.push({
      Section: section,
      Label: label,
      Value: value ?? "—",
      Detail: sub ?? "",
    });
  });
}

export function buildPortfolioReportRows(portfolioOverview, range) {
  const rows = [];
  const period =
    range?.[0] && range?.[1]
      ? `${range[0].format("YYYY-MM")} to ${range[1].format("YYYY-MM")}`
      : "Current period";

  rows.push({ Section: "Report", Label: "Page", Value: "Portfolio overview", Detail: period });

  const kpis = portfolioOverview?.kpis || {};
  pushMetricRows(rows, "KPI", [
    {
      label: "Total receivables",
      value: kpis.primaryReceivables?.value,
      sub: kpis.primaryReceivables?.sub,
    },
    {
      label: "Portfolio score",
      value: kpis.portfolioScore?.value,
      sub: kpis.portfolioScore?.sub,
    },
    {
      label: "Portfolio generation",
      value: kpis.portfolioGeneration?.value,
      sub: kpis.portfolioGeneration?.sub,
    },
    {
      label: "Repayments received",
      value: kpis.repaymentTotals?.value,
      sub: kpis.repaymentTotals?.sub,
    },
    {
      label: "CO₂ offset",
      value: kpis.co2?.value,
      sub: kpis.co2?.sub,
    },
    {
      label: "Total deposited",
      value: kpis.totalDeposited?.value,
      sub: kpis.totalDeposited?.sub,
    },
  ]);

  (portfolioOverview?.financedProjects || []).forEach((p) => {
    rows.push({
      Section: "Financed projects",
      Installation: p.installationTitle,
      Location: p.installationSub,
      Status: p.healthLabel,
      "Last posted": p.statusPosted || p.lastPostedIso || "—",
      "Capacity kWp": p.capacityKwp,
      "Project cost": p.projectCostDisplay,
      Invested: p.investedDisplay,
      "Energy kWh": p.energyKwhDisplay,
      "Energy value": p.energyValueDisplay,
      ROI: p.kpiRemarkMain,
      Repayment: p.repaymentMain,
      "Repayment detail": p.repaymentSub,
      "Carbon offset": p.carbonDisplay,
    });
  });

  (portfolioOverview?.activity || []).forEach((a) => {
    rows.push({
      Section: "Recent activity",
      Date: a.date,
      Description: a.label,
      Amount: a.amount,
    });
  });

  return {
    title: "Portfolio overview",
    filename: `wyre-investor-portfolio-${stamp()}.pdf`,
    rows,
  };
}

export function buildProjectsReportRows(bundle) {
  const rows = [];
  const summary = bundle?.summary || {};

  rows.push({ Section: "Report", Label: "Page", Value: "Projects", Detail: stamp() });

  pushMetricRows(rows, "KPI", [
    { label: "Active projects", value: summary.activeProjects, sub: "Financed & monitored" },
    {
      label: "Portfolio AC capacity",
      value: summary.portfolioAcKwp != null ? `${summary.portfolioAcKwp} kWp` : "—",
    },
    {
      label: "Portfolio generation YTD",
      value: summary.portfolioGenerationYtdDisplay,
      sub: "Year to date",
    },
    { label: "Attention", value: summary.attentionCount },
  ]);

  (bundle?.projects || []).forEach((p) => {
    rows.push({
      Section: "Financed projects",
      Project: p.name,
      Status: p.status,
      Location: p.branchLabel,
      "Contract start": p.contractStart,
      "Share %": p.sharePct,
      "System kWp": p.systemKwp,
      Invested: p.investedNgn,
      Outstanding: p.outstandingNgn,
      "MTD MWh": p.mtdMwh,
    });
  });

  (bundle?.openProjects || []).forEach((p) => {
    rows.push({
      Section: "Open projects",
      Project: p.name,
      Status: p.status,
      Summary: p.summaryLine,
      "Remaining NGN": p.remainingNgn,
      "Investor target NGN": p.investorTargetNgn,
      "System kWp": p.systemKwp,
      "Raised %": p.raisedPct,
    });
  });

  (bundle?.investmentTickets || []).forEach((t) => {
    rows.push({
      Section: "Investment tickets",
      Subject: t.subject || t.projectName,
      Status: t.status,
      Priority: t.priority,
      Created: t.createdAt,
    });
  });

  return {
    title: "Projects",
    filename: `wyre-investor-projects-${stamp()}.pdf`,
    rows,
  };
}

export function buildPaymentsReportRows({ bundle, payoutSchedule, ledgerYear }) {
  const rows = [];
  const kpis = bundle?.kpis || {};

  rows.push({
    Section: "Report",
    Label: "Page",
    Value: "Payments & receivables",
    Detail: ledgerYear ? `Ledger year ${ledgerYear}` : stamp(),
  });

  pushMetricRows(rows, "KPI", [
    { label: "Total credited", value: kpis.totalCredited?.value, sub: kpis.totalCredited?.sub },
    { label: "Due next 30 days", value: kpis.dueNext30?.value, sub: kpis.dueNext30?.sub },
    { label: "Overdue 90d+", value: kpis.overdue90?.value, sub: kpis.overdue90?.sub },
    {
      label: "Next payment due",
      value: kpis.nextPaymentDue?.value,
      sub: kpis.nextPaymentDue?.sub,
    },
  ]);

  const health = bundle?.receivableHealth || {};
  pushMetricRows(rows, "Receivable health", [
    { label: "Weighted DPD", value: health.dpd },
    { label: "Projects with overdue line", value: health.projectsOverdue },
    { label: "Expected IRR range", value: health.irrRange },
  ]);

  if (payoutSchedule?.projectName) {
    const summary = payoutSchedule.summary;
    rows.push({
      Section: "Payment schedule",
      Project: payoutSchedule.projectName,
      "Total due": summary?.totalDue,
      "Total paid": summary?.totalPaid,
      Remaining: summary?.totalRemaining,
      Installments: summary?.totalInstallments,
    });
  }

  (payoutSchedule?.installments || []).forEach((row) => {
    rows.push({
      Section: "Installments",
      "Due date": row.due,
      "Amount due": row.amountDue,
      "Amount paid": row.amountPaid,
      Remaining: row.amountRemaining,
      "Paid date": row.paidDate,
      Status: row.status,
    });
  });

  (bundle?.schedule || []).forEach((row) => {
    rows.push({
      Section: "Upcoming schedule",
      Due: row.due,
      Project: row.project,
      "Total due": row.totalDue,
      "Your credit": row.yourCredit,
      Status: row.status,
    });
  });

  (bundle?.payoutHistory || []).forEach((row) => {
    rows.push({
      Section: "Payout history",
      Line: row.line,
      Amount: row.amount,
    });
  });

  (bundle?.ledger || []).forEach((row) => {
    rows.push({
      Section: "Repayment history",
      "Paid date": row.paidDate,
      Project: row.projectName,
      Amount: row.amount,
      Status: row.status,
    });
  });

  return {
    title: "Payments & receivables",
    filename: `wyre-investor-payments-${stamp()}.pdf`,
    rows,
  };
}

export function buildSupportReportRows(tickets = []) {
  const rows = tickets.map((t) => ({
    Section: "Support tickets",
    ID: t.id,
    Subject: t.subject,
    Type: t.subjectTagDisplay || t.subjectTag,
    Status: t.status,
    Priority: t.priority,
    Created: t.createdDisplay || t.createdAt,
    Updated: t.updatedDisplay || t.updatedAt,
    Responded: t.responded ? "Yes" : "No",
  }));

  return {
    title: "Support",
    filename: `wyre-investor-support-${stamp()}.pdf`,
    rows,
  };
}

