import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Spin, Table, Tabs, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import InvestorPageHeader from "../../components/investor/InvestorPageHeader";
import { fetchInvestorPayments } from "../../redux/actions/investor/investor.action";

const { Text, Title } = Typography;

function scheduleStatusTag(statusKey, label) {
  const t = String(statusKey || label || "").toLowerCase();
  if (t.includes("scheduled")) return <Tag color="green">{label}</Tag>;
  if (t.includes("overdue")) return <Tag color="red">{label}</Tag>;
  if (t.includes("pending")) return <Tag color="gold">{label}</Tag>;
  return <Tag color="default">{label}</Tag>;
}

function InvestorPayments() {
  const dispatch = useDispatch();
  const {
    payments: bundle,
    paymentsLoading,
    paymentsPartialErrors,
  } = useSelector((s) => s.investorPage);
  const loadError = bundle?.loadError;

  const [range, setRange] = useState([
    dayjs().month(0).date(1),
    dayjs().month(3).endOf("month"),
  ]);
  const [ledgerYear, setLedgerYear] = useState(String(dayjs().year()));

  const rangeKey = `${range[0]?.format("YYYY-MM-DD")}_${range[1]?.format("YYYY-MM-DD")}`;

  const loadPayments = useCallback(() => {
    const start = range[0]?.format("YYYY-MM-DD");
    const end = range[1]?.format("YYYY-MM-DD");
    dispatch(
      fetchInvestorPayments({
        start,
        end,
        ledgerYear: Number(ledgerYear),
      })
    );
  }, [dispatch, range, ledgerYear]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments, rangeKey, ledgerYear]);

  const kpis = useMemo(() => {
    const k = bundle?.kpis;
    if (!k) return [];
    return [
      { key: "1", ...k.totalCredited },
      { key: "2", ...k.dueNext30 },
      { key: "3", ...k.overdue90 },
      { key: "4", ...k.nextPaymentDue },
    ];
  }, [bundle?.kpis]);

  const scheduleCols = [
    { title: "Due", dataIndex: "due", key: "due", width: 100 },
    { title: "Branch", dataIndex: "branch", key: "branch", width: 120 },
    { title: "Total due", dataIndex: "totalDue", key: "totalDue" },
    {
      title: "Your credit",
      dataIndex: "yourCredit",
      key: "yourCredit",
      render: (v) => <span className="investor-pay-pos">{v}</span>,
    },
    {
      title: "Status (last posted)",
      dataIndex: "status",
      key: "status",
      render: (v, row) => scheduleStatusTag(row.statusKey, v),
    },
  ];

  const ledgerCols = [
    { title: "Date", dataIndex: "date", key: "date", width: 120 },
    { title: "Type", dataIndex: "type", key: "type", width: 120 },
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
  const ledgerMeta = bundle?.ledgerMeta;

  const ledgerTabYears = useMemo(() => {
    const current = dayjs().year();
    return [
      { key: String(current), label: String(current) },
      { key: String(current - 1), label: String(current - 1) },
    ];
  }, []);

  return (
    <div className="investor-page investor-payments-page">
      {loadError ? (
        <Alert type="error" showIcon message="Could not load payments" description={loadError} />
      ) : null}

      {paymentsPartialErrors?.length ? (
        <Alert
          type="warning"
          showIcon
          closable
          message="Some payment data could not be loaded"
          description="Showing the sections that are available. Refresh the page or try again later."
        />
      ) : null}

      <InvestorPageHeader
        title="Payments & receivables"
        subtitle="Schedule, payouts, receivable health, and cash ledger from your Wyre portfolio."
        range={range}
        onRangeChange={setRange}
      />

      <Spin spinning={paymentsLoading} wrapperClassName="investor-payments-spin">
        <div className="investor-payments-body">
        <div className="investor-metrics investor-metrics--four">
          {kpis.map((k) => (
            <Card
              key={k.key}
              bordered={false}
              className={`investor-metric-card${
                k.primary ? " investor-metric-card--primary" : ""
              }${k.isPastDue ? " investor-metric-card--alert" : ""}`}
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
          >
            <div className="table-responsive-wrapper investor-table-wrap">
              <Table
                className="investor-table"
                columns={scheduleCols}
                dataSource={bundle?.schedule || []}
                pagination={false}
                size="small"
                rowKey="key"
                locale={{ emptyText: "No upcoming installments" }}
              />
            </div>
          </Card>

          <div className="investor-payments-stack">
            <Card title="Payout history" bordered={false} className="investor-card">
              {(bundle?.payoutHistory || []).length === 0 ? (
                <Text type="secondary">No payouts recorded yet.</Text>
              ) : (
                (bundle?.payoutHistory || []).map((row) => (
                  <div key={row.key} className="investor-activity-row investor-payments-ph-row">
                    <div className="investor-activity-left">
                      <div className="investor-activity-label">{row.line}</div>
                    </div>
                    <div
                      className={`investor-activity-amount ${
                        row.isBad ? "is-bad" : "is-good"
                      }`}
                    >
                      {row.amount}
                    </div>
                  </div>
                ))
              )}
            </Card>

            <Card title="Receivable health" bordered={false} className="investor-card">
              <div className="investor-health-lines">
                <div>
                  <span className="investor-mini-label">Weighted days past due (portfolio)</span>
                  <span className="investor-mini-value">{health?.dpd ?? "—"}</span>
                </div>
                <div>
                  <span className="investor-mini-label">Projects with any overdue line</span>
                  <span className="investor-mini-value">{health?.projectsOverdue ?? "—"}</span>
                </div>
                <div>
                  <span className="investor-mini-label">Expected IRR range (model)</span>
                  <span className="investor-mini-value">{health?.irrRange ?? "—"}</span>
                </div>
              </div>
              {health?.disclaimer ? (
                <Text type="secondary" className="investor-health-disclaimer">
                  {health.disclaimer}
                </Text>
              ) : null}
            </Card>
          </div>
        </div>

        <Card
          title={
            <div className="investor-ledger-head">
              <Title level={5} style={{ margin: 0 }}>
                All cash movements
              </Title>
              <Tabs
                size="small"
                activeKey={ledgerYear}
                onChange={setLedgerYear}
                items={ledgerTabYears}
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
              dataSource={bundle?.ledger || []}
              pagination={
                ledgerMeta && ledgerMeta.pages > 1
                  ? {
                      pageSize: ledgerMeta.pageSize,
                      total: ledgerMeta.total,
                      showSizeChanger: false,
                    }
                  : false
              }
              size="small"
              rowKey="key"
              locale={{ emptyText: `No ledger entries for ${ledgerYear}` }}
            />
          </div>
        </Card>
        </div>
      </Spin>

      <Card className="investor-tax-bar" bordered={false}>
        <div className="investor-tax-bar-inner">
          <div>
            <div className="investor-support-title">Tax / compliance exports</div>
            <div className="investor-support-sub">
              Request formal statements for your records.
            </div>
          </div>
          <Button className="investor-btn-light">Request statement</Button>
        </div>
      </Card>
    </div>
  );
}

export default InvestorPayments;
