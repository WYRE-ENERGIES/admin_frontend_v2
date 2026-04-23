/**
 * Sample payloads for investor dashboard UIs. Replace via API integration in investor.action.js.
 */

export const MOCK_INVESTOR_PROJECTS = {
  summary: {
    activeProjects: 6,
    portfolioAcKwp: 247,
    portfolioGenerationYtdKwh: 186000,
    attentionCount: 2,
  },
  projects: [
    {
      id: "p1",
      name: "Access Ayobo 2",
      status: "On track",
      branchLabel: "Branch 2104 · Lagos",
      contractStart: "Contract start · Mar 2024",
      sharePct: 18,
      systemKwp: 45,
      investedNgn: 9200000,
      outstandingNgn: 6100000,
      mtdMwh: 12.4,
      row3Left: "Next payment due",
      row3Right: "12 Apr",
      footerLeft: "Est. savings (MTD) ₦2.1M",
      footerLink: "Payment schedule →",
    },
    {
      id: "p2",
      name: "Access Idasho Ibeju",
      status: "Overdue",
      branchLabel: "Branch 2841 · Lagos",
      contractStart: "Contract start · Jan 2024",
      sharePct: 25,
      systemKwp: 60,
      investedNgn: 12000000,
      outstandingNgn: 9800000,
      mtdMwh: 10.1,
      row3Left: "Missed installment",
      row3Right: "Flagged",
      footerLeft: "Est. savings (MTD) ₦1.4M",
      footerLink: "View receivables →",
    },
    {
      id: "p3",
      name: "Access Akpana",
      status: "On track",
      branchLabel: "Branch 1988 · Oyo",
      contractStart: "Contract start · Jun 2023",
      sharePct: 12,
      systemKwp: 30,
      investedNgn: 4000000,
      outstandingNgn: 2100000,
      mtdMwh: 8.2,
      row3Left: "Data quality",
      row3Right: "OK",
      footerLeft: "Est. savings (MTD) ₦890k",
      footerLink: "Payment schedule →",
    },
    {
      id: "p4",
      name: "Access Amuwo Odofin",
      status: "Review",
      branchLabel: "Branch 2230 · Lagos",
      contractStart: "Contract start · Aug 2024",
      sharePct: 15,
      systemKwp: 52,
      investedNgn: 8400000,
      outstandingNgn: 7200000,
      mtdMwh: 9.0,
      row3Left: "Review note",
      row3Right: "Telemetry",
      footerLeft: "Est. savings (MTD) ₦1.1M",
      footerLink: "View receivables →",
    },
  ],
};

export const MOCK_INVESTOR_PAYMENTS = {
  summary: {
    ytdCreditedNgn: 12400000,
    dueNext30Ngn: 2850000,
    overdue90Ngn: 1020000,
    nextSweepLabel: "09 Apr",
  },
  schedule: [
    { key: "s1", due: "08 Apr", branch: "2841", totalDue: "₦410,000", yourCredit: "₦102,500", status: "Pending" },
    { key: "s2", due: "02 Apr", branch: "2104", totalDue: "₦310,000", yourCredit: "₦55,800", status: "Overdue trail" },
    { key: "s3", due: "15 Apr", branch: "1988", totalDue: "₦180,000", yourCredit: "₦21,600", status: "Scheduled" },
  ],
  payoutHistory: [
    { key: "h1", line: "28 Mar · Sweep – mixed pool", amount: "+ ₦842,000" },
    { key: "h2", line: "15 Mar · Missed (2841)", amount: "NO" },
    { key: "h3", line: "01 Mar · Portfolio credit", amount: "+ ₦1.02M" },
  ],
  receivableHealth: {
    dpd: "18 days",
    projectsOverdue: "2",
    irrRange: "9.2% – 11.4%",
  },
  ledger: [
    { key: "l1", date: "28 Mar 2026", type: "Sweep", ref: "Pool A / mixed", customer: "—", allocation: "+ ₦842,000", effect: "Credited" },
    { key: "l2", date: "15 Mar 2026", type: "Missed", ref: "Branch 2841", customer: "—", allocation: "₦0", effect: "Flagged" },
    { key: "l3", date: "01 Mar 2026", type: "Credit", ref: "Portfolio", customer: "—", allocation: "+ ₦1.02M", effect: "Credited" },
    { key: "l4", date: "10 Dec 2025", type: "Sweep", ref: "Pool A", customer: "—", allocation: "+ ₦410,000", effect: "Credited" },
  ],
};

export const MOCK_INVESTOR_ACCOUNT_KYC = {
  profile: {
    legalName: "Jane Chisom Daramola",
    email: "j.daramola@example.com",
    phone: "+234 803 000 0000",
    country: "Nigeria",
    language: "English",
  },
  payout: {
    accountName: "Jane Chisom Daramola",
    bankMasked: "****** Bank PLC",
    accountMasked: "******** 4521",
    nubanVerified: true,
    tin: "12345678-0001",
  },
  meta: {
    tier: "Tier 2 – Full investor",
    investorId: "INV-2025-88421",
    payoutMethod: "Naira · Bank",
  },
  documents: [
    { key: "d1", name: "Government ID", submitted: "12 Jan 2025", status: "Approved" },
    { key: "d2", name: "Proof of address", submitted: "12 Jan 2025", status: "Approved" },
    { key: "d3", name: "Tax identification", submitted: "14 Jan 2025", status: "Approved" },
    { key: "d4", name: "Selfie liveness check", submitted: "15 Jan 2025", status: "Passed" },
    { key: "d5", name: "Certified accreditation", submitted: "—", status: "Not submitted" },
  ],
  declarations: {
    pep: "No PEP match (mock)",
    sof: "Salary & savings (mock)",
    sanctions: "Clear (mock)",
  },
};
