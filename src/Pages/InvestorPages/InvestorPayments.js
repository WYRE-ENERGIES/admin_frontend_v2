import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Table, Tabs, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import InvestorPageHeader from "../../components/investor/InvestorPageHeader";
import { fetchInvestorPayments } from "../../redux/actions/investor/investor.action";

const { Text, Title } = Typography;

const ngnShort = (n) => {
  if (n == null) return "—";
  const v = Number(n);
  if (v >= 1e6) return `₦${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `₦${(v / 1e3).toFixed(2)}k`;
  return `₦${v.toLocaleString("en-NG")}`;
};

function scheduleStatusTag(label) {
  const t = String(label || "").toLowerCase();
  if (t.includes("scheduled")) return <Tag color="green">{label}</Tag>;
  if (t.includes("overdue")) return <Tag color="red">{label}</Tag>;
  return <Tag color="gold">{label}</Tag>;
}

function InvestorPayments() {
  const dispatch = useDispatch();
  const { payments: bundle, paymentsLoading } = useSelector((s) => s.investorPage);
  const [range, setRange] = useState([dayjs().month(0).date(1), dayjs().month(3).endOf("month")]);
  const [ledgerYear, setLedgerYear] = useState("2026");

  useEffect(() => {
    dispatch(fetchInvestorPayments());
  }, [dispatch]);

  const s = bundle?.summary;
  const kpis = useMemo(
    () => [
      {
        key: "1",
        primary: true,
        label: "YTD credited to you",
        value: s ? ngnShort(s.ytdCreditedNgn) : "—",
        sub: "After platform fees (mock)",
      },
      {
        key: "2",
        label: "Due next 30 days",
        value: s ? ngnShort(s.dueNext30Ngn) : "—",
        sub: "Across all tranches",
      },
      {
        key: "3",
        label: "Overdue (90D+)",
        value: s ? ngnShort(s.overdue90Ngn) : "—",
        sub: "Branch 2841-weighted",
      },
      {
        key: "4",
        label: "Next portfolio sweep",
        value: s?.nextSweepLabel || "—",
        sub: "Expected settlement date",
      },
    ],
    [s]
  );

  const scheduleCols = [
    { title: "Due", dataIndex: "due", key: "due", width: 100 },
    { title: "Branch", dataIndex: "branch", key: "branch", width: 90 },
    { title: "Total due", dataIndex: "totalDue", key: "totalDue" },
    {
      title: "Your credit",
      dataIndex: "yourCredit",
      key: "yourCredit",
      render: (v) => <span className="investor-pay-pos">{v}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v) => scheduleStatusTag(v),
    },
  ];

  const ledgerCols = [
    { title: "Date", dataIndex: "date", key: "date", width: 120 },
    { title: "Type", dataIndex: "type", key: "type", width: 100 },
    { title: "Branch / ref", dataIndex: "ref", key: "ref" },
    { title: "Amount (customer)", dataIndex: "customer", key: "customer" },
    {
      title: "Your allocation",
      dataIndex: "allocation",
      key: "allocation",
      render: (v) => <span className="investor-pay-pos">{v}</span>,
    },
    { title: "Balance effect", dataIndex: "effect", key: "effect" },
  ];

  const health = bundle?.receivableHealth;

  return (
    <div className="investor-page investor-payments-page">
      <InvestorPageHeader
        title="Payments & receivables"
        subtitle="Schedule, payouts, and ledger — sample data only."
        range={range}
        onRangeChange={setRange}
      />

      <Text type="secondary" className="investor-payments-note">
        Receivables-style mock: customer-identifying fields may be masked per policy when APIs are
        connected.
      </Text>

      <div className="investor-metrics investor-metrics--four">
        {kpis.map((k) => (
          <Card
            key={k.key}
            bordered={false}
            className={`investor-metric-card${k.primary ? " investor-metric-card--primary" : ""}`}
          >
            <div className="investor-metric-label">{k.label}</div>
            <div className="investor-metric-value">{k.value}</div>
            <div className="investor-metric-sub">{k.sub}</div>
          </Card>
        ))}
      </div>

      <div className="investor-payments-split">
        <Card
          title="Upcoming schedule"
          bordered={false}
          className="investor-card"
          extra={<Text type="secondary">CSV (mock)</Text>}
        >
          <div className="table-responsive-wrapper investor-table-wrap">
            <Table
              className="investor-table"
              loading={paymentsLoading}
              columns={scheduleCols}
              dataSource={bundle?.schedule || []}
              pagination={false}
              size="small"
              rowKey="key"
            />
          </div>
        </Card>

        <div className="investor-payments-stack">
          <Card title="Payout history" bordered={false} className="investor-card">
            {(bundle?.payoutHistory || []).map((row) => (
              <div key={row.key} className="investor-activity-row investor-payments-ph-row">
                <div className="investor-activity-left">
                  <div className="investor-activity-label">{row.line}</div>
                </div>
                <div
                  className={`investor-activity-amount ${
                    row.amount === "NO" ? "is-bad" : "is-good"
                  }`}
                >
                  {row.amount}
                </div>
              </div>
            ))}
          </Card>

          <Card title="Receivable health" bordered={false} className="investor-card">
            <div className="investor-health-lines">
              <div>
                <span className="investor-mini-label">Weighted days past due</span>
                <span className="investor-mini-value">{health?.dpd ?? "—"}</span>
              </div>
              <div>
                <span className="investor-mini-label">Projects with any overdue line</span>
                <span className="investor-mini-value">{health?.projectsOverdue ?? "—"}</span>
              </div>
              <div>
                <span className="investor-mini-label">Expected IRR range</span>
                <span className="investor-mini-value">{health?.irrRange ?? "—"}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card
        title={
          <div className="investor-ledger-head">
            <Title level={5} style={{ margin: 0 }}>
              All cash movements (sample ledger)
            </Title>
            <Tabs
              size="small"
              activeKey={ledgerYear}
              onChange={setLedgerYear}
              items={[
                { key: "2026", label: "2026" },
                { key: "2025", label: "2025" },
              ]}
            />
          </div>
        }
        bordered={false}
        className="investor-card"
      >
        <div className="table-responsive-wrapper investor-table-wrap">
          <Table
            className="investor-table"
            columns={ledgerCols}
            dataSource={(bundle?.ledger || []).filter((r) =>
              ledgerYear === "2026" ? r.date.includes("2026") : r.date.includes("2025")
            )}
            pagination={false}
            size="small"
            rowKey="key"
          />
        </div>
      </Card>

      <Card className="investor-tax-bar" bordered={false}>
        <div className="investor-tax-bar-inner">
          <div>
            <div className="investor-support-title">Tax / compliance exports</div>
            <div className="investor-support-sub">
              Request formal statements for your records — mock action until APIs are live.
            </div>
          </div>
          <Button className="investor-btn-light">Request statement (mock)</Button>
        </div>
      </Card>
    </div>
  );
}

export default InvestorPayments;
